import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { startQuest } from '@/lib/services/quest.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * POST /api/quests/:questId/start
 * Start a quest
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questId: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { questId } = await params;

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

    const result = await startQuest(userId, questId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          quest: result.quest,
          enemyDeckId: result.enemyDeckId,
          staminaCost: result.staminaCost,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Start quest error:', error);

    if (
      error.code === ErrorCode.INSUFFICIENT_STAMINA ||
      error.code === ErrorCode.LEVEL_TOO_LOW ||
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
          message: 'Failed to start quest',
        },
      },
      { status: 500 }
    );
  }
}
