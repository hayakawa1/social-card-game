import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { acceptFriendRequest } from '@/lib/services/social.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { z } from 'zod';

const acceptRequestSchema = z.object({
  requestId: z.string().uuid(),
});

/**
 * POST /api/social/friends/accept
 * Accept a friend request
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
    const validationResult = acceptRequestSchema.safeParse(body);
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

    const { requestId } = validationResult.data;

    await acceptFriendRequest(userId, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Friend request accepted',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Accept friend request error:', error);

    if (
      error.code === ErrorCode.FRIEND_REQUEST_NOT_FOUND ||
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
          message: 'Failed to accept friend request',
        },
      },
      { status: 500 }
    );
  }
}
