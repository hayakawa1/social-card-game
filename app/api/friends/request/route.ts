import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { sendFriendRequest } from '@/lib/services/friends.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const sendRequestSchema = z.object({
  username: z.string().min(1),
});

/**
 * POST /api/friends/request
 * Send a friend request
 */
export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      logger.warn('Friend request attempted without authentication', undefined, undefined, requestId);
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
    const validationResult = sendRequestSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Friend request validation failed', { errors: validationResult.error.errors }, userId, requestId);
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

    const { username } = validationResult.data;

    logger.info('Sending friend request', { username }, userId, requestId);

    const friendRequest = await sendFriendRequest(userId, username);

    logger.info('Friend request sent successfully', { requestId: friendRequest.id }, userId, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { request: friendRequest },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Failed to send friend request', error, { errorCode: error.code }, undefined, requestId);

    if (error.code === ErrorCode.VALIDATION_ERROR) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to send friend request',
        },
      },
      { status: 500 }
    );
  }
}
