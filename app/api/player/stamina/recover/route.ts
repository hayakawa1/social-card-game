import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { recoverStamina } from '@/lib/services/player.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { z } from 'zod';

const recoverStaminaSchema = z.object({
  amount: z.number().int().positive().max(100),
  useGems: z.boolean().optional().default(false),
});

/**
 * POST /api/player/stamina/recover
 * Recover stamina using items or gems
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
    const validationResult = recoverStaminaSchema.safeParse(body);
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

    const { amount, useGems } = validationResult.data;

    const newStamina = await recoverStamina(userId, amount, useGems);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          stamina: newStamina,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Recover stamina error:', error);

    if (error.code === ErrorCode.INSUFFICIENT_GEMS) {
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
          message: 'Failed to recover stamina',
        },
      },
      { status: 500 }
    );
  }
}
