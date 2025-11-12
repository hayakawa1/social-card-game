import { NextResponse } from 'next/server';
import { getAllCardMasters } from '@/lib/services/card.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * GET /api/cards/master
 * Get all card master data (cached)
 */
export async function GET() {
  try {
    const cards = await getAllCardMasters();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          cards,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Get card masters error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get card masters',
        },
      },
      { status: 500 }
    );
  }
}
