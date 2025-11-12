import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { getPlayerCardCollection } from '@/lib/services/card.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * GET /api/cards/collection
 * Get current player's card collection
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

    const collection = await getPlayerCardCollection(userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          cards: collection,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get card collection error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get card collection',
        },
      },
      { status: 500 }
    );
  }
}
