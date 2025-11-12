import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { getQuestById } from '@/lib/services/quest.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * GET /api/quests/:questId
 * Get a specific quest
 */
export async function GET(
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

    const quest = await getQuestById(questId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          quest,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get quest error:', error);

    if (error.code === ErrorCode.VALIDATION_ERROR) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get quest',
        },
      },
      { status: 500 }
    );
  }
}
