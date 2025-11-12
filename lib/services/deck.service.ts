import { db } from '@/lib/db';
import { decks } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { ErrorCode } from '@/types';
import { getPlayerCardsByIds } from './card.service';

const MIN_DECK_SIZE = 20;
const MAX_DECK_SIZE = 40;
const MAX_DUPLICATE_CARDS = 3;
const MAX_TOTAL_COST = 200;

/**
 * Get all decks for a player
 */
export async function getPlayerDecks(playerId: string) {
  const playerDecks = await db
    .select()
    .from(decks)
    .where(eq(decks.playerId, playerId));

  return playerDecks;
}

/**
 * Get a specific deck by ID
 */
export async function getDeckById(playerId: string, deckId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.playerId, playerId)))
    .limit(1);

  if (!deck) {
    throw {
      code: ErrorCode.CARD_NOT_FOUND,
      message: 'Deck not found',
    };
  }

  return deck;
}

/**
 * Validate deck composition
 */
async function validateDeck(playerId: string, cardIds: string[]) {
  // Check deck size
  if (cardIds.length < MIN_DECK_SIZE || cardIds.length > MAX_DECK_SIZE) {
    throw {
      code: ErrorCode.INVALID_DECK_SIZE,
      message: `Deck must contain ${MIN_DECK_SIZE}-${MAX_DECK_SIZE} cards`,
    };
  }

  // Check duplicate cards (max 3 of the same card)
  const cardCounts = new Map<string, number>();
  for (const cardId of cardIds) {
    const count = (cardCounts.get(cardId) || 0) + 1;
    if (count > MAX_DUPLICATE_CARDS) {
      throw {
        code: ErrorCode.DUPLICATE_CARD_LIMIT,
        message: `Cannot have more than ${MAX_DUPLICATE_CARDS} copies of the same card`,
      };
    }
    cardCounts.set(cardId, count);
  }

  // Get player cards with master data
  const playerCards = await getPlayerCardsByIds(playerId, cardIds);

  // Check if player owns all cards
  if (playerCards.length !== cardIds.length) {
    throw {
      code: ErrorCode.CARD_NOT_OWNED,
      message: 'Player does not own all specified cards',
    };
  }

  // Calculate total cost
  let totalCost = 0;
  const cardCostMap = new Map<string, number>();

  for (const { playerCard, cardMaster } of playerCards) {
    cardCostMap.set(playerCard.id, cardMaster.cost);
    totalCost += cardMaster.cost;
  }

  // Check total cost
  if (totalCost > MAX_TOTAL_COST) {
    throw {
      code: ErrorCode.DECK_COST_EXCEEDED,
      message: `Total deck cost (${totalCost}) exceeds maximum (${MAX_TOTAL_COST})`,
    };
  }

  return {
    isValid: true,
    totalCost,
  };
}

/**
 * Create a new deck
 */
export async function createDeck(
  playerId: string,
  name: string,
  cardIds: string[]
) {
  // Validate deck
  const { totalCost } = await validateDeck(playerId, cardIds);

  // Check if player already has 5 decks (max limit)
  const existingDecks = await getPlayerDecks(playerId);
  if (existingDecks.length >= 5) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Maximum 5 decks allowed per player',
    };
  }

  // Create deck
  const [newDeck] = await db
    .insert(decks)
    .values({
      playerId,
      name,
      cardIds,
      totalCost,
      isActive: existingDecks.length === 0, // First deck is active by default
    })
    .returning();

  return newDeck;
}

/**
 * Update an existing deck
 */
export async function updateDeck(
  playerId: string,
  deckId: string,
  updates: {
    name?: string;
    cardIds?: string[];
  }
) {
  // Verify deck ownership
  await getDeckById(playerId, deckId);

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (updates.name) {
    updateData.name = updates.name;
  }

  if (updates.cardIds) {
    // Validate new deck composition
    const { totalCost } = await validateDeck(playerId, updates.cardIds);
    updateData.cardIds = updates.cardIds;
    updateData.totalCost = totalCost;
  }

  const [updatedDeck] = await db
    .update(decks)
    .set(updateData)
    .where(and(eq(decks.id, deckId), eq(decks.playerId, playerId)))
    .returning();

  return updatedDeck;
}

/**
 * Delete a deck
 */
export async function deleteDeck(playerId: string, deckId: string) {
  // Verify deck ownership
  const deck = await getDeckById(playerId, deckId);

  // If this was the active deck, deactivate it
  if (deck.isActive) {
    // Set another deck as active if available
    const otherDecks = await db
      .select()
      .from(decks)
      .where(
        and(eq(decks.playerId, playerId), eq(decks.isActive, false))
      )
      .limit(1);

    if (otherDecks.length > 0) {
      await db
        .update(decks)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(decks.id, otherDecks[0].id));
    }
  }

  // Delete deck
  await db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.playerId, playerId)));

  return { success: true };
}

/**
 * Set active deck
 */
export async function setActiveDeck(playerId: string, deckId: string) {
  // Verify deck ownership
  await getDeckById(playerId, deckId);

  // Deactivate all decks
  await db
    .update(decks)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(decks.playerId, playerId));

  // Activate selected deck
  await db
    .update(decks)
    .set({ isActive: true, updatedAt: new Date() })
    .where(and(eq(decks.id, deckId), eq(decks.playerId, playerId)));

  return { success: true };
}

/**
 * Get active deck for a player
 */
export async function getActiveDeck(playerId: string) {
  const [activeDeck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.playerId, playerId), eq(decks.isActive, true)))
    .limit(1);

  if (!activeDeck) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'No active deck found',
    };
  }

  return activeDeck;
}
