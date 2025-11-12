import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { sendFriendRequest } from '@/lib/services/social.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { z } from 'zod';

const friendRequestSchema = z.object({
  targetPlayerId: z.string().uuid(),
});

/**
 * POST /api/social/friends/request
 * Send a friend request
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate input
    const validationResult = friendRequestSchema.safeParse(body);
    if (!validationResult.success) {
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

    const { targetPlayerId } = validationResult.data;

    const friendRequest = await sendFriendRequest(userId, targetPlayerId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          requestId: friendRequest.id,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Send friend request error:', error);

    if (
      error.code === ErrorCode.PLAYER_NOT_FOUND ||
      error.code === ErrorCode.ALREADY_FRIENDS ||
      error.code === ErrorCode.FRIEND_LIMIT_REACHED ||
      error.code === ErrorCode.VALIDATION_ERROR
    ) {
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
