import { db } from '@/lib/db';
import { cardMasters, playerCards } from '@/drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { ErrorCode } from '@/types';
import { updateGold } from './player.service';

/**
 * Get all card masters
 */
export async function getAllCardMasters() {
  const cards = await db.select().from(cardMasters);
  return cards;
}

/**
 * Get card master by ID
 */
export async function getCardMasterById(cardMasterId: string) {
  const [card] = await db
    .select()
    .from(cardMasters)
    .where(eq(cardMasters.id, cardMasterId))
    .limit(1);

  if (!card) {
    throw {
      code: ErrorCode.CARD_NOT_FOUND,
      message: 'Card master not found',
    };
  }

  return card;
}

/**
 * Get player's card collection
 */
export async function getPlayerCardCollection(playerId: string) {
  const cards = await db
    .select({
      playerCard: playerCards,
      cardMaster: cardMasters,
    })
    .from(playerCards)
    .innerJoin(cardMasters, eq(playerCards.cardMasterId, cardMasters.id))
    .where(eq(playerCards.playerId, playerId));

  return cards;
}

/**
 * Get player card by ID
 */
export async function getPlayerCardById(
  playerId: string,
  playerCardId: string
) {
  const [card] = await db
    .select({
      playerCard: playerCards,
      cardMaster: cardMasters,
    })
    .from(playerCards)
    .innerJoin(cardMasters, eq(playerCards.cardMasterId, cardMasters.id))
    .where(
      and(eq(playerCards.id, playerCardId), eq(playerCards.playerId, playerId))
    )
    .limit(1);

  if (!card) {
    throw {
      code: ErrorCode.CARD_NOT_OWNED,
      message: 'Player does not own this card',
    };
  }

  return card;
}

/**
 * Add card to player's collection
 */
export async function addCardToPlayer(playerId: string, cardMasterId: string) {
  // Get card master data
  const cardMaster = await getCardMasterById(cardMasterId);

  // Create player card with base stats
  const [newCard] = await db
    .insert(playerCards)
    .values({
      playerId,
      cardMasterId,
      level: 1,
      exp: 0,
      attack: cardMaster.baseAttack,
      defense: cardMaster.baseDefense,
    })
    .returning();

  return newCard;
}

/**
 * Calculate card stats at a given level
 */
function calculateCardStats(
  baseAttack: number,
  baseDefense: number,
  level: number
) {
  // Formula: stat = baseStat + (level - 1) * 2
  const attack = baseAttack + (level - 1) * 2;
  const defense = baseDefense + (level - 1) * 2;

  return { attack, defense };
}

/**
 * Calculate experience required for next level
 */
function expForNextCardLevel(currentLevel: number): number {
  // Formula: exp = level * 100
  return currentLevel * 100;
}

/**
 * Enhance card (level up using materials)
 */
export async function enhanceCard(
  playerId: string,
  targetCardId: string,
  materialCardIds: string[],
  goldCost: number
) {
  // Verify target card ownership
  const targetCardData = await getPlayerCardById(playerId, targetCardId);
  const targetCard = targetCardData.playerCard;
  const cardMaster = targetCardData.cardMaster;

  // Check if card is at max level
  if (targetCard.level >= cardMaster.maxLevel) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Card is already at max level',
    };
  }

  // Verify material cards ownership
  if (materialCardIds.length === 0) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'No material cards provided',
    };
  }

  const materialCards = await db
    .select()
    .from(playerCards)
    .where(
      and(
        inArray(playerCards.id, materialCardIds),
        eq(playerCards.playerId, playerId)
      )
    );

  if (materialCards.length !== materialCardIds.length) {
    throw {
      code: ErrorCode.CARD_NOT_OWNED,
      message: 'One or more material cards not owned by player',
    };
  }

  // Cannot use target card as material
  if (materialCardIds.includes(targetCardId)) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Cannot use target card as material',
    };
  }

  // Deduct gold cost
  await updateGold(playerId, goldCost, 'subtract');

  // Calculate total exp from materials
  // Each material card gives: (level * 50) exp
  let totalExpGained = materialCards.reduce(
    (sum, card) => sum + card.level * 50,
    0
  );

  // Delete material cards
  await db
    .delete(playerCards)
    .where(inArray(playerCards.id, materialCardIds));

  // Add exp to target card and level up if needed
  let newExp = targetCard.exp + totalExpGained;
  let newLevel = targetCard.level;

  while (
    newLevel < cardMaster.maxLevel &&
    newExp >= expForNextCardLevel(newLevel)
  ) {
    newExp -= expForNextCardLevel(newLevel);
    newLevel++;
  }

  // Recalculate stats based on new level
  const { attack, defense } = calculateCardStats(
    cardMaster.baseAttack,
    cardMaster.baseDefense,
    newLevel
  );

  // Update target card
  const [enhancedCard] = await db
    .update(playerCards)
    .set({
      level: newLevel,
      exp: newExp,
      attack,
      defense,
    })
    .where(eq(playerCards.id, targetCardId))
    .returning();

  return {
    enhancedCard,
    levelsGained: newLevel - targetCard.level,
    expGained: totalExpGained,
  };
}

/**
 * Get cards by IDs (for deck validation)
 */
export async function getPlayerCardsByIds(
  playerId: string,
  cardIds: string[]
) {
  if (cardIds.length === 0) {
    return [];
  }

  const cards = await db
    .select({
      playerCard: playerCards,
      cardMaster: cardMasters,
    })
    .from(playerCards)
    .innerJoin(cardMasters, eq(playerCards.cardMasterId, cardMasters.id))
    .where(
      and(inArray(playerCards.id, cardIds), eq(playerCards.playerId, playerId))
    );

  return cards;
}
