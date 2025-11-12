import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { removeFriend } from '@/lib/services/social.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * DELETE /api/social/friends/:friendId
 * Remove a friend
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { friendId } = await params;

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

    await removeFriend(userId, friendId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Friend removed successfully',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove friend error:', error);
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
