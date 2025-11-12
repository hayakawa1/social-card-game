import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { getPlayerDecks, createDeck } from '@/lib/services/deck.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { z } from 'zod';

const createDeckSchema = z.object({
  name: z.string().min(1).max(100),
  cardIds: z.array(z.string().uuid()).min(20).max(40),
});

/**
 * GET /api/decks
 * Get all decks for current player
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

    const decks = await getPlayerDecks(userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          decks,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get decks error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get decks',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/decks
 * Create a new deck
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
    const validationResult = createDeckSchema.safeParse(body);
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

    const { name, cardIds } = validationResult.data;

    const newDeck = await createDeck(userId, name, cardIds);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          deck: newDeck,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create deck error:', error);

    if (
      error.code === ErrorCode.INVALID_DECK_SIZE ||
      error.code === ErrorCode.DUPLICATE_CARD_LIMIT ||
      error.code === ErrorCode.DECK_COST_EXCEEDED ||
      error.code === ErrorCode.CARD_NOT_OWNED ||
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
          message: 'Failed to create deck',
        },
      },
      { status: 500 }
    );
  }
}
