import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { getPlayerGachaHistory } from '@/lib/services/gacha.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * GET /api/gacha/history
 * Get player's gacha history
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

    const history = await getPlayerGachaHistory(userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          history,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get gacha history error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get gacha history',
        },
      },
      { status: 500 }
    );
  }
}
