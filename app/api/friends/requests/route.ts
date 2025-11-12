import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { getFriendRequests } from '@/lib/services/friends.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

/**
 * GET /api/friends/requests?type=sent|received
 * Get friend requests (sent or received)
 */
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      logger.warn('Friend requests access attempted without authentication', undefined, undefined, requestId);
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

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'received') as 'sent' | 'received';

    logger.info('Getting friend requests', { type }, userId, requestId);

    const requests = await getFriendRequests(userId, type);

    logger.info(`Friend requests retrieved successfully (${requests.length} requests)`, undefined, userId, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { requests },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Failed to get friend requests', error, { errorCode: error.code }, undefined, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get friend requests',
        },
      },
      { status: 500 }
    );
  }
}
