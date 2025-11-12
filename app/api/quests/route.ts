import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import {
  getAllQuests,
  getPlayerQuestProgress,
} from '@/lib/services/quest.service';
import { ErrorCode, type ApiResponse } from '@/types';

/**
 * GET /api/quests
 * Get all available quests with player's progress
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

    const [quests, progress] = await Promise.all([
      getAllQuests(),
      getPlayerQuestProgress(userId),
    ]);

    // Merge quest data with progress
    const questsWithProgress = quests.map((quest) => {
      const questProgress = progress.find((p) => p.questId === quest.id);
      return {
        ...quest,
        cleared: questProgress?.cleared || false,
        progress: questProgress || null,
      };
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          quests: questsWithProgress,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get quests error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get quests',
        },
      },
      { status: 500 }
    );
  }
}
