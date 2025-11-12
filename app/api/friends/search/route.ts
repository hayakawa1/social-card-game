import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { searchUsers } from '@/lib/services/friends.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

/**
 * GET /api/friends/search?q=username
 * Search for users by username
 */
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      logger.warn('User search attempted without authentication', undefined, undefined, requestId);
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
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: { users: [] },
        },
        { status: 200 }
      );
    }

    logger.info('Searching users', { query }, userId, requestId);

    const users = await searchUsers(userId, query);

    logger.info(`User search completed (${users.length} results)`, undefined, userId, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { users },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Failed to search users', error, { errorCode: error.code }, undefined, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to search users',
        },
      },
      { status: 500 }
    );
  }
}
