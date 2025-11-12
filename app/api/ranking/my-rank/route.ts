import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { getPlayerAllRanks } from '@/lib/services/ranking.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

/**
 * GET /api/ranking/my-rank
 * Get current player's rank across all categories
 */
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      logger.warn('My rank access attempted without authentication', undefined, undefined, requestId);
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

    logger.info('Getting player ranks', undefined, userId, requestId);

    const ranks = await getPlayerAllRanks(userId);

    logger.info('Player ranks retrieved successfully', undefined, userId, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { ranks },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Failed to get player ranks', error, { errorCode: error.code }, undefined, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get player ranks',
        },
      },
      { status: 500 }
    );
  }
}
