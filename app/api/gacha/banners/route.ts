import { NextResponse } from 'next/server';
import { getAvailableBanners } from '@/lib/services/gacha.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * GET /api/gacha/banners
 * Get all available gacha banners
 */
export async function GET() {
  try {
    const banners = await getAvailableBanners();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          banners,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get gacha banners error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get gacha banners',
        },
      },
      { status: 500 }
    );
  }
}
