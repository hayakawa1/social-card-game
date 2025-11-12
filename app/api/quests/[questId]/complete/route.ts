import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { completeQuest } from '@/lib/services/quest.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { z } from 'zod';

const completeQuestSchema = z.object({
  victory: z.boolean(),
});

/**
 * POST /api/quests/:questId/complete
 * Complete a quest
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

    const body = await request.json();

    // Validate input
    const validationResult = completeQuestSchema.safeParse(body);
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

    const { victory } = validationResult.data;

    const result = await completeQuest(userId, questId, victory);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          victory: result.victory,
          rewards: result.rewards,
          firstClear: result.firstClear,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Complete quest error:', error);

    if (error.code === ErrorCode.VALIDATION_ERROR) {
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
          message: 'Failed to complete quest',
        },
      },
      { status: 500 }
    );
  }
}
