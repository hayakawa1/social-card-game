import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { enhanceCard } from '@/lib/services/card.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { z } from 'zod';

const enhanceCardSchema = z.object({
  targetCardId: z.string().uuid(),
  materialCardIds: z.array(z.string().uuid()).min(1).max(10),
  goldCost: z.number().int().positive(),
});

/**
 * POST /api/cards/enhance
 * Enhance a card using material cards
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate input
    const validationResult = enhanceCardSchema.safeParse(body);
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

    const { targetCardId, materialCardIds, goldCost } = validationResult.data;

    const result = await enhanceCard(
      userId,
      targetCardId,
      materialCardIds,
      goldCost
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          enhancedCard: result.enhancedCard,
          levelsGained: result.levelsGained,
          expGained: result.expGained,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Enhance card error:', error);

    if (
      error.code === ErrorCode.CARD_NOT_OWNED ||
      error.code === ErrorCode.CARD_NOT_FOUND ||
      error.code === ErrorCode.VALIDATION_ERROR ||
      error.code === ErrorCode.INSUFFICIENT_GOLD
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
          message: 'Failed to enhance card',
        },
      },
      { status: 500 }
    );
  }
}
