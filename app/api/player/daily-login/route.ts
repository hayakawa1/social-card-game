import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { processDailyLogin } from '@/lib/services/player.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * GET /api/player/daily-login
 * Check if daily login is available
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

    // Process daily login (check only, don't claim)
    const result = await processDailyLogin(userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          consecutiveDays: result.consecutiveDays,
          alreadyClaimed: result.alreadyClaimed,
          rewards: result.rewards,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check daily login error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to check daily login',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/player/daily-login/claim
 * Claim daily login bonus
 */
export async function POST() {
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

    const result = await processDailyLogin(userId);

    if (result.alreadyClaimed) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Daily login already claimed today',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          rewards: result.rewards,
          newConsecutiveDays: result.consecutiveDays,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Claim daily login error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to claim daily login',
        },
      },
      { status: 500 }
    );
  }
}
