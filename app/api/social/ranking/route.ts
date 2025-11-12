import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { getRanking, getPlayerRank } from '@/lib/services/social.service';
import { ErrorCode, type ApiResponse, type RankingType } from '@/types';

/**
 * GET /api/social/ranking
 * Get ranking leaderboard
 * Query params: type (pvp|level), limit (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: 'Unauthorized',
          },
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const rankingType = (searchParams.get('type') || 'pvp') as RankingType;
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get current season (format: YYYY-MM)
    const now = new Date();
    const season = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [rankings, playerRank] = await Promise.all([
      getRanking(rankingType, season, limit),
      getPlayerRank(userId, rankingType, season),
    ]);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          rankings,
          playerRank: playerRank?.rank || null,
          playerScore: playerRank?.score || 0,
          season,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get ranking error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get ranking',
        },
      },
      { status: 500 }
    );
  }
}
