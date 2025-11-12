import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import {
  getPlayerFriends,
  getPendingFriendRequests,
  getSentFriendRequests,
} from '@/lib/services/social.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * GET /api/social/friends
 * Get player's friends list and friend requests
 */
export async function GET() {
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

    const [friends, receivedRequests, sentRequests] = await Promise.all([
      getPlayerFriends(userId),
      getPendingFriendRequests(userId),
      getSentFriendRequests(userId),
    ]);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          friends,
          receivedRequests,
          sentRequests,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get friends',
        },
      },
      { status: 500 }
    );
  }
}
