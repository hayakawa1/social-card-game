import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { rejectFriendRequest } from '@/lib/services/friends.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const rejectRequestSchema = z.object({
  requestId: z.string().uuid(),
});

/**
 * POST /api/friends/reject
 * Reject a friend request
 */
export async function POST(request: NextRequest) {
  const reqId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      logger.warn('Reject friend request attempted without authentication', undefined, undefined, reqId);
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

    const body = await request.json();
    const validationResult = rejectRequestSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Reject friend request validation failed', { errors: validationResult.error.errors }, userId, reqId);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { requestId } = validationResult.data;

    logger.info('Rejecting friend request', { requestId }, userId, reqId);

    await rejectFriendRequest(userId, requestId);

    logger.info('Friend request rejected successfully', { requestId }, userId, reqId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Friend request rejected' },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Failed to reject friend request', error, { errorCode: error.code }, undefined, reqId);

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
          message: 'Failed to reject friend request',
        },
      },
      { status: 500 }
    );
  }
}
