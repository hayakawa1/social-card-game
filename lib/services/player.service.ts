import { db } from '@/lib/db';
import { players } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { ErrorCode } from '@/types';
import { calculateCurrentStamina, calculateLevel, expForNextLevel } from '@/lib/utils';

/**
 * Get player profile by ID
 */
export async function getPlayerProfile(playerId: string) {
  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  if (!player) {
    throw new Error('Player not found');
  }

  // Calculate current stamina
  const currentStamina = calculateCurrentStamina(
    player.stamina,
    player.maxStamina,
    player.lastStaminaUpdate
  );

  // Update stamina if changed
  if (currentStamina !== player.stamina) {
    await db
      .update(players)
      .set({
        stamina: currentStamina,
        lastStaminaUpdate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(players.id, playerId));
  }

  return {
    ...player,
    stamina: currentStamina,
  };
}

/**
 * Update player profile
 */
export async function updatePlayerProfile(
  playerId: string,
  data: {
    username?: string;
    iconUrl?: string;
  }
) {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.username) {
    // Check if username is already taken
    const [existingPlayer] = await db
      .select()
      .from(players)
      .where(eq(players.username, data.username))
      .limit(1);

    if (existingPlayer && existingPlayer.id !== playerId) {
      throw new Error('Username already taken');
    }

    updateData.username = data.username;
  }

  if (data.iconUrl) {
    updateData.iconUrl = data.iconUrl;
  }

  const [updatedPlayer] = await db
    .update(players)
    .set(updateData)
    .where(eq(players.id, playerId))
    .returning();

  return updatedPlayer;
}

/**
 * Add experience to player and level up if needed
 */
export async function addExperience(playerId: string, expAmount: number) {
  const player = await getPlayerProfile(playerId);

  let newExp = player.exp + expAmount;
  let newLevel = player.level;

  // Calculate new level
  while (newExp >= expForNextLevel(newLevel)) {
    newExp -= expForNextLevel(newLevel);
    newLevel++;
  }

  // Update player
  await db
    .update(players)
    .set({
      exp: newExp,
      level: newLevel,
      updatedAt: new Date(),
    })
    .where(eq(players.id, playerId));

  return {
    newLevel,
    newExp,
    leveledUp: newLevel > player.level,
    levelsGained: newLevel - player.level,
  };
}

/**
 * Add or subtract gold
 */
export async function updateGold(
  playerId: string,
  amount: number,
  operation: 'add' | 'subtract'
) {
  const player = await getPlayerProfile(playerId);

  const newGold =
    operation === 'add' ? player.gold + amount : player.gold - amount;

  if (newGold < 0) {
    throw {
      code: ErrorCode.INSUFFICIENT_GOLD,
      message: 'Insufficient gold',
    };
  }

  await db
    .update(players)
    .set({
      gold: newGold,
      updatedAt: new Date(),
    })
    .where(eq(players.id, playerId));

  return newGold;
}

/**
 * Add or subtract gems
 */
export async function updateGems(
  playerId: string,
  amount: number,
  operation: 'add' | 'subtract'
) {
  const player = await getPlayerProfile(playerId);

  const newGems =
    operation === 'add' ? player.gems + amount : player.gems - amount;

  if (newGems < 0) {
    throw {
      code: ErrorCode.INSUFFICIENT_GEMS,
      message: 'Insufficient gems',
    };
  }

  await db
    .update(players)
    .set({
      gems: newGems,
      updatedAt: new Date(),
    })
    .where(eq(players.id, playerId));

  return newGems;
}

/**
 * Use stamina
 */
export async function useStamina(playerId: string, amount: number) {
  const player = await getPlayerProfile(playerId);

  if (player.stamina < amount) {
    throw {
      code: ErrorCode.INSUFFICIENT_STAMINA,
      message: 'Insufficient stamina',
    };
  }

  const newStamina = player.stamina - amount;

  await db
    .update(players)
    .set({
      stamina: newStamina,
      lastStaminaUpdate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(players.id, playerId));

  return newStamina;
}

/**
 * Recover stamina (by item or gems)
 */
export async function recoverStamina(
  playerId: string,
  amount: number,
  useGems: boolean = false
) {
  const player = await getPlayerProfile(playerId);

  // If using gems, deduct cost (10 gems per stamina point)
  if (useGems) {
    const gemCost = amount * 10;
    await updateGems(playerId, gemCost, 'subtract');
  }

  const newStamina = Math.min(player.stamina + amount, player.maxStamina);

  await db
    .update(players)
    .set({
      stamina: newStamina,
      lastStaminaUpdate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(players.id, playerId));

  return newStamina;
}

/**
 * Process daily login bonus
 */
export async function processDailyLogin(playerId: string) {
  const player = await getPlayerProfile(playerId);
  const now = new Date();
  const lastLogin = new Date(player.lastLoginDate);

  // Check if already claimed today
  const isToday =
    now.getFullYear() === lastLogin.getFullYear() &&
    now.getMonth() === lastLogin.getMonth() &&
    now.getDate() === lastLogin.getDate();

  if (isToday) {
    return {
      alreadyClaimed: true,
      consecutiveDays: player.consecutiveLoginDays,
      rewards: [],
    };
  }

  // Check if consecutive (within 24 hours)
  const timeDiff = now.getTime() - lastLogin.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  const isConsecutive = hoursDiff <= 48; // Allow 2 days grace period

  let newConsecutiveDays = isConsecutive
    ? player.consecutiveLoginDays + 1
    : 1;

  // Reset after 7 days
  if (newConsecutiveDays > 7) {
    newConsecutiveDays = 1;
  }

  // Calculate rewards based on consecutive days
  const goldReward = 100 * newConsecutiveDays;
  const gemsReward = newConsecutiveDays === 7 ? 500 : 10 * newConsecutiveDays;

  // Update player
  await db
    .update(players)
    .set({
      gold: player.gold + goldReward,
      gems: player.gems + gemsReward,
      consecutiveLoginDays: newConsecutiveDays,
      lastLoginDate: now,
      updatedAt: now,
    })
    .where(eq(players.id, playerId));

  return {
    alreadyClaimed: false,
    consecutiveDays: newConsecutiveDays,
    rewards: [
      { type: 'gold' as const, amount: goldReward },
      { type: 'gems' as const, amount: gemsReward },
    ],
  };
}
