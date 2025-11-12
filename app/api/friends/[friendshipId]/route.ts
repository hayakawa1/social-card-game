import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { removeFriend } from '@/lib/services/friends.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

/**
 * DELETE /api/friends/[friendshipId]
 * Remove a friend
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { friendshipId: string } }
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      logger.warn('Remove friend attempted without authentication', undefined, undefined, requestId);
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

    const { friendshipId } = params;

    logger.info('Removing friend', { friendshipId }, userId, requestId);

    await removeFriend(userId, friendshipId);

    logger.info('Friend removed successfully', { friendshipId }, userId, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Friend removed' },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Failed to remove friend', error, { errorCode: error.code }, undefined, requestId);

    if (error.code === ErrorCode.VALIDATION_ERROR || error.code === ErrorCode.UNAUTHORIZED) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.code === ErrorCode.UNAUTHORIZED ? 403 : 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to remove friend',
        },
      },
      { status: 500 }
    );
  }
}
