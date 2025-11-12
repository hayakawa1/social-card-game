import { db } from '@/lib/db';
import { players } from '@/drizzle/schema';
import { desc, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export interface RankingEntry {
  rank: number;
  playerId: string;
  username: string;
  level: number;
  totalPower: number;
  wins: number;
  losses: number;
  winRate: number;
  value: number; // The value being ranked by
}

export type RankingType = 'level' | 'power' | 'wins' | 'winRate';

/**
 * Get rankings by type
 */
export async function getRankings(
  type: RankingType,
  limit: number = 100
): Promise<RankingEntry[]> {
  try {
    // Get players sorted by the specified column
    let playersData;

    switch (type) {
      case 'level':
        playersData = await db
          .select()
          .from(players)
          .orderBy(desc(players.level))
          .limit(limit);
        break;
      case 'power':
        playersData = await db
          .select()
          .from(players)
          .orderBy(desc(players.totalPower))
          .limit(limit);
        break;
      case 'wins':
        playersData = await db
          .select()
          .from(players)
          .orderBy(desc(players.wins))
          .limit(limit);
        break;
      case 'winRate':
        // Calculate win rate as wins / (wins + losses)
        // We'll sort by wins first, then calculate win rate
        playersData = await db
          .select()
          .from(players)
          .orderBy(desc(players.wins))
          .limit(limit);
        break;
      default:
        playersData = await db
          .select()
          .from(players)
          .orderBy(desc(players.level))
          .limit(limit);
    }

    // Calculate win rate and create ranking entries
    const rankings: RankingEntry[] = playersData.map((player, index) => {
      const totalGames = player.wins + player.losses;
      const winRate = totalGames > 0 ? (player.wins / totalGames) * 100 : 0;

      let value: number;
      switch (type) {
        case 'level':
          value = player.level;
          break;
        case 'power':
          value = player.totalPower;
          break;
        case 'wins':
          value = player.wins;
          break;
        case 'winRate':
          value = winRate;
          break;
        default:
          value = player.level;
      }

      return {
        rank: index + 1,
        playerId: player.id,
        username: player.username,
        level: player.level,
        totalPower: player.totalPower,
        wins: player.wins,
        losses: player.losses,
        winRate,
        value,
      };
    });

    // If ranking by win rate, re-sort by win rate
    if (type === 'winRate') {
      rankings.sort((a, b) => b.winRate - a.winRate);
      // Update ranks after re-sorting
      rankings.forEach((entry, index) => {
        entry.rank = index + 1;
      });
    }

    logger.info('Rankings retrieved', { type, count: rankings.length });

    return rankings;
  } catch (error) {
    logger.error('Failed to get rankings', error as Error, { type, limit });
    throw error;
  }
}

/**
 * Get player rank by type
 */
export async function getPlayerRank(
  playerId: string,
  type: RankingType
): Promise<{ rank: number; total: number } | null> {
  try {
    const rankings = await getRankings(type, 1000); // Get more entries to find player rank

    const playerIndex = rankings.findIndex((entry) => entry.playerId === playerId);

    if (playerIndex === -1) {
      return null;
    }

    return {
      rank: rankings[playerIndex].rank,
      total: rankings.length,
    };
  } catch (error) {
    logger.error('Failed to get player rank', error as Error, { playerId, type });
    throw error;
  }
}

/**
 * Get player's ranks across all categories
 */
export async function getPlayerAllRanks(playerId: string): Promise<{
  level: { rank: number; total: number } | null;
  power: { rank: number; total: number } | null;
  wins: { rank: number; total: number } | null;
  winRate: { rank: number; total: number } | null;
}> {
  try {
    const [levelRank, powerRank, winsRank, winRateRank] = await Promise.all([
      getPlayerRank(playerId, 'level'),
      getPlayerRank(playerId, 'power'),
      getPlayerRank(playerId, 'wins'),
      getPlayerRank(playerId, 'winRate'),
    ]);

    return {
      level: levelRank,
      power: powerRank,
      wins: winsRank,
      winRate: winRateRank,
    };
  } catch (error) {
    logger.error('Failed to get player all ranks', error as Error, { playerId });
    throw error;
  }
}
