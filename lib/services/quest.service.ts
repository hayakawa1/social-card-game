import { db } from '@/lib/db';
import { quests, questProgress } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { ErrorCode, type Reward } from '@/types';
import { useStamina, addExperience, updateGold } from './player.service';
import { addCardToPlayer } from './card.service';
import { getPlayerProfile } from './player.service';

/**
 * Get all available quests
 */
export async function getAllQuests() {
  const allQuests = await db
    .select()
    .from(quests)
    .where(eq(quests.isAvailable, true));

  // Parse JSON string fields to arrays
  return allQuests.map(quest => ({
    ...quest,
    rewards: typeof quest.rewards === 'string' ? JSON.parse(quest.rewards) : quest.rewards,
    firstClearRewards: typeof quest.firstClearRewards === 'string' ? JSON.parse(quest.firstClearRewards) : quest.firstClearRewards,
  }));
}

/**
 * Get quest by ID
 */
export async function getQuestById(questId: string) {
  const [quest] = await db
    .select()
    .from(quests)
    .where(eq(quests.id, questId))
    .limit(1);

  if (!quest) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Quest not found',
    };
  }

  if (!quest.isAvailable) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Quest is not available',
    };
  }

  // Parse JSON string fields to arrays
  return {
    ...quest,
    rewards: typeof quest.rewards === 'string' ? JSON.parse(quest.rewards) : quest.rewards,
    firstClearRewards: typeof quest.firstClearRewards === 'string' ? JSON.parse(quest.firstClearRewards) : quest.firstClearRewards,
  };
}

/**
 * Get player's quest progress
 */
export async function getPlayerQuestProgress(playerId: string) {
  const progress = await db
    .select()
    .from(questProgress)
    .where(eq(questProgress.playerId, playerId));

  return progress;
}

/**
 * Get specific quest progress
 */
export async function getQuestProgress(playerId: string, questId: string) {
  const [progress] = await db
    .select()
    .from(questProgress)
    .where(
      and(
        eq(questProgress.playerId, playerId),
        eq(questProgress.questId, questId)
      )
    )
    .limit(1);

  return progress;
}

/**
 * Start a quest
 */
export async function startQuest(playerId: string, questId: string) {
  // Get quest data
  const quest = await getQuestById(questId);

  // Get player data
  const player = await getPlayerProfile(playerId);

  // Check player level requirement
  if (player.level < quest.requiredLevel) {
    throw {
      code: ErrorCode.LEVEL_TOO_LOW,
      message: `Player level ${quest.requiredLevel} required`,
    };
  }

  // Use stamina
  await useStamina(playerId, quest.staminaCost);

  // Get or create quest progress record
  let progress = await getQuestProgress(playerId, questId);

  if (!progress) {
    // Create new progress record
    [progress] = await db
      .insert(questProgress)
      .values({
        playerId,
        questId,
        cleared: false,
        attempts: 1,
      })
      .returning();
  } else {
    // Increment attempts
    [progress] = await db
      .update(questProgress)
      .set({
        attempts: progress.attempts + 1,
      })
      .where(
        and(
          eq(questProgress.playerId, playerId),
          eq(questProgress.questId, questId)
        )
      )
      .returning();
  }

  return {
    quest,
    enemyDeckId: quest.enemyDeckId,
    staminaCost: quest.staminaCost,
  };
}

/**
 * Distribute rewards to player
 */
async function distributeRewards(playerId: string, rewards: Reward[]) {
  const distributedRewards = [];

  for (const reward of rewards) {
    switch (reward.type) {
      case 'exp':
        if (reward.amount) {
          await addExperience(playerId, reward.amount);
          distributedRewards.push(reward);
        }
        break;

      case 'gold':
        if (reward.amount) {
          await updateGold(playerId, reward.amount, 'add');
          distributedRewards.push(reward);
        }
        break;

      case 'gems':
        if (reward.amount) {
          const { updateGems } = await import('./player.service');
          await updateGems(playerId, reward.amount, 'add');
          distributedRewards.push(reward);
        }
        break;

      case 'card':
        if (reward.cardId) {
          await addCardToPlayer(playerId, reward.cardId);
          distributedRewards.push(reward);
        }
        break;

      case 'stamina':
        if (reward.amount) {
          const { recoverStamina } = await import('./player.service');
          await recoverStamina(playerId, reward.amount, false);
          distributedRewards.push(reward);
        }
        break;
    }
  }

  return distributedRewards;
}

/**
 * Complete a quest
 */
export async function completeQuest(
  playerId: string,
  questId: string,
  victory: boolean
) {
  // Get quest data
  const quest = await getQuestById(questId);

  // Get quest progress
  const progress = await getQuestProgress(playerId, questId);

  if (!progress) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Quest not started',
    };
  }

  // If player won
  if (victory) {
    const rewards: Reward[] = [...quest.rewards];
    let firstClear = false;

    // If first time clearing, add first clear rewards
    if (!progress.cleared) {
      rewards.push(...quest.firstClearRewards);
      firstClear = true;

      // Update progress
      await db
        .update(questProgress)
        .set({
          cleared: true,
          clearedAt: new Date(),
        })
        .where(
          and(
            eq(questProgress.playerId, playerId),
            eq(questProgress.questId, questId)
          )
        );
    }

    // Distribute rewards
    const distributedRewards = await distributeRewards(playerId, rewards);

    return {
      victory: true,
      rewards: distributedRewards,
      firstClear,
    };
  } else {
    // Player lost, no rewards
    return {
      victory: false,
      rewards: [],
      firstClear: false,
    };
  }
}
