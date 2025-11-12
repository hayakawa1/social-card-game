import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { getFriends } from '@/lib/services/friends.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

/**
 * GET /api/friends
 * Get user's friends list
 */
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      logger.warn('Friends list access attempted without authentication', undefined, undefined, requestId);
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

    logger.info('Getting friends list', undefined, userId, requestId);

    const friends = await getFriends(userId);

    logger.info(`Friends list retrieved successfully (${friends.length} friends)`, undefined, userId, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { friends },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Failed to get friends list', error, { errorCode: error.code }, undefined, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get friends list',
        },
      },
      { status: 500 }
    );
  }
}
