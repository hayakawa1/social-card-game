import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { executeGachaPull } from '@/lib/services/gacha.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const gachaPullSchema = z.object({
  bannerId: z.string().uuid(),
  pullType: z.enum(['single', 'multi']),
  currencyType: z.enum(['gold', 'gems']),
});

/**
 * POST /api/gacha/pull
 * Execute a gacha pull
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      logger.warn('Gacha pull attempted without authentication', undefined, undefined, requestId);
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

    logger.info('Gacha pull request received', undefined, userId, requestId);

    const body = await request.json();

    // Validate input
    const validationResult = gachaPullSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Gacha pull validation failed', { errors: validationResult.error.errors }, userId, requestId);
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

    const { bannerId, pullType, currencyType } = validationResult.data;

    logger.debug('Executing gacha pull', { bannerId, pullType, currencyType }, userId, requestId);

    const result = await executeGachaPull(
      userId,
      bannerId,
      pullType,
      currencyType
    );

    const duration = Date.now() - startTime;
    logger.info(`Gacha pull successful (${duration}ms)`, { pullType, cardsCount: result.cards.length, cost: result.cost }, userId, requestId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          cards: result.cards,
          cost: result.cost,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(
      `Gacha pull failed (${duration}ms)`,
      error,
      { errorCode: error.code },
      undefined,
      requestId
    );

    if (
      error.code === ErrorCode.BANNER_NOT_AVAILABLE ||
      error.code === ErrorCode.INSUFFICIENT_GOLD ||
      error.code === ErrorCode.INSUFFICIENT_GEMS ||
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
          message: 'Failed to execute gacha pull',
        },
      },
      { status: 500 }
    );
  }
}
