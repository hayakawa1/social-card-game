import { db } from '@/lib/db';
import { gachaBanners, gachaHistory, cardMasters } from '@/drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { ErrorCode, type CurrencyType, type PullType } from '@/types';
import { addCardToPlayer } from './card.service';
import { updateGold, updateGems } from './player.service';

// Base rarity rates
const BASE_RATES = {
  common: 0.7, // 70%
  rare: 0.2, // 20%
  super_rare: 0.08, // 8%
  ultra_rare: 0.02, // 2%
} as const;

/**
 * Get available gacha banners
 */
export async function getAvailableBanners() {
  const now = new Date();

  const banners = await db
    .select()
    .from(gachaBanners)
    .where(
      and(lte(gachaBanners.startDate, now), gte(gachaBanners.endDate, now))
    );

  return banners;
}

/**
 * Get gacha banner by ID
 */
export async function getBannerById(bannerId: string) {
  const [banner] = await db
    .select()
    .from(gachaBanners)
    .where(eq(gachaBanners.id, bannerId))
    .limit(1);

  if (!banner) {
    throw {
      code: ErrorCode.BANNER_NOT_AVAILABLE,
      message: 'Banner not found',
    };
  }

  // Check if banner is available
  const now = new Date();
  if (now < banner.startDate || now > banner.endDate) {
    throw {
      code: ErrorCode.BANNER_NOT_AVAILABLE,
      message: 'Banner is not currently available',
    };
  }

  return banner;
}

/**
 * Draw a random card based on rarity rates
 */
async function drawCard(
  bannerId: string,
  rateUpCardIds: string[] = [],
  guaranteeRarity?: 'rare' | 'super_rare' | 'ultra_rare'
) {
  const banner = await getBannerById(bannerId);

  // Get all cards
  const allCards = await db.select().from(cardMasters);

  let selectedRarity: keyof typeof BASE_RATES;

  if (guaranteeRarity) {
    // Guaranteed rarity
    selectedRarity = guaranteeRarity;
  } else {
    // Random rarity based on rates
    const randomValue = Math.random();
    let cumulativeRate = 0;

    if (randomValue < (cumulativeRate += BASE_RATES.ultra_rare)) {
      selectedRarity = 'ultra_rare';
    } else if (randomValue < (cumulativeRate += BASE_RATES.super_rare)) {
      selectedRarity = 'super_rare';
    } else if (randomValue < (cumulativeRate += BASE_RATES.rare)) {
      selectedRarity = 'rare';
    } else {
      selectedRarity = 'common';
    }
  }

  // Filter cards by rarity
  let eligibleCards = allCards.filter((card) => card.rarity === selectedRarity);

  // If there are rate-up cards of this rarity, prioritize them (50% chance)
  const rateUpEligible = eligibleCards.filter((card) =>
    rateUpCardIds.includes(card.id)
  );

  if (rateUpEligible.length > 0 && Math.random() < 0.5) {
    eligibleCards = rateUpEligible;
  }

  // Randomly select a card
  const randomIndex = Math.floor(Math.random() * eligibleCards.length);
  return eligibleCards[randomIndex];
}

/**
 * Perform single pull
 */
async function performSinglePull(bannerId: string, rateUpCardIds: string[]) {
  const card = await drawCard(bannerId, rateUpCardIds);
  return [card];
}

/**
 * Perform multi pull (10-pull with guaranteed rare or above)
 */
async function performMultiPull(bannerId: string, rateUpCardIds: string[]) {
  const results = [];
  let hasRareOrAbove = false;

  // Draw first 9 cards
  for (let i = 0; i < 9; i++) {
    const card = await drawCard(bannerId, rateUpCardIds);
    results.push(card);

    if (card.rarity !== 'common') {
      hasRareOrAbove = true;
    }
  }

  // 10th card: guarantee rare or above if none was drawn
  if (!hasRareOrAbove) {
    // Randomly select rare, super_rare, or ultra_rare
    const guaranteedRarities = ['rare', 'super_rare', 'ultra_rare'] as const;
    const randomValue = Math.random();

    let guaranteedRarity: (typeof guaranteedRarities)[number];
    if (randomValue < 0.7) {
      guaranteedRarity = 'rare'; // 70% rare
    } else if (randomValue < 0.95) {
      guaranteedRarity = 'super_rare'; // 25% super rare
    } else {
      guaranteedRarity = 'ultra_rare'; // 5% ultra rare
    }

    const card = await drawCard(bannerId, rateUpCardIds, guaranteedRarity);
    results.push(card);
  } else {
    // Normal draw for 10th card
    const card = await drawCard(bannerId, rateUpCardIds);
    results.push(card);
  }

  return results;
}

/**
 * Execute gacha pull
 */
export async function executeGachaPull(
  playerId: string,
  bannerId: string,
  pullType: PullType,
  currencyType: CurrencyType
) {
  // Get banner
  const banner = await getBannerById(bannerId);

  // Calculate cost
  let cost: number;
  if (currencyType === 'gold') {
    if (!banner.costGold) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'This banner does not accept gold',
      };
    }
    cost = pullType === 'single' ? banner.costGold : banner.costGold * 10;
  } else {
    if (!banner.costGems) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'This banner does not accept gems',
      };
    }
    cost = pullType === 'single' ? banner.costGems : banner.costGems * 10;
  }

  // Deduct currency
  if (currencyType === 'gold') {
    await updateGold(playerId, cost, 'subtract');
  } else {
    await updateGems(playerId, cost, 'subtract');
  }

  // Perform pull
  const drawnCards =
    pullType === 'single'
      ? await performSinglePull(bannerId, banner.rateUpCardIds)
      : await performMultiPull(bannerId, banner.rateUpCardIds);

  // Add cards to player's collection
  const playerCards = [];
  for (const cardMaster of drawnCards) {
    const playerCard = await addCardToPlayer(playerId, cardMaster.id);
    playerCards.push({
      playerCard,
      cardMaster,
    });
  }

  // Record gacha history
  await db.insert(gachaHistory).values({
    playerId,
    bannerId,
    pullType,
    cardsObtained: playerCards.map((c) => c.playerCard.id),
    currencyUsed: currencyType,
    amount: cost,
  });

  return {
    cards: playerCards,
    cost,
  };
}

/**
 * Get player's gacha history
 */
export async function getPlayerGachaHistory(
  playerId: string,
  limit: number = 50
) {
  const history = await db
    .select()
    .from(gachaHistory)
    .where(eq(gachaHistory.playerId, playerId))
    .orderBy(gachaHistory.pulledAt)
    .limit(limit);

  return history;
}
