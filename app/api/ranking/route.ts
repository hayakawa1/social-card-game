import { NextRequest, NextResponse } from 'next/server';
import { getRankings, type RankingType } from '@/lib/services/ranking.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

/**
 * GET /api/ranking?type=level|power|wins|winRate&limit=100
 * Get rankings
 */
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'level') as RankingType;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Validate type
    const validTypes: RankingType[] = ['level', 'power', 'wins', 'winRate'];
    if (!validTypes.includes(type)) {
      logger.warn('Invalid ranking type requested', { type }, undefined, requestId);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid ranking type',
          },
        },
        { status: 400 }
      );
    }

    // Validate limit
    if (limit < 1 || limit > 1000) {
      logger.warn('Invalid ranking limit requested', { limit }, undefined, requestId);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Limit must be between 1 and 1000',
          },
        },
        { status: 400 }
      );
    }

    logger.info('Getting rankings', { type, limit }, undefined, requestId);

    const rankings = await getRankings(type, limit);

    logger.info(`Rankings retrieved successfully (${rankings.length} entries)`, undefined, undefined, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { rankings, type, limit },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Failed to get rankings', error, { errorCode: error.code }, undefined, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get rankings',
        },
      },
      { status: 500 }
    );
  }
}
