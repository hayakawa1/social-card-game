import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import {
  getDeckById,
  updateDeck,
  deleteDeck,
} from '@/lib/services/deck.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { z } from 'zod';

const updateDeckSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  cardIds: z.array(z.string().uuid()).min(20).max(40).optional(),
});

/**
 * GET /api/decks/:deckId
 * Get a specific deck
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { deckId } = await params;

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

    const deck = await getDeckById(userId, deckId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          deck,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get deck error:', error);

    if (error.code === ErrorCode.CARD_NOT_FOUND) {
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
          message: 'Failed to get deck',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/decks/:deckId
 * Update a deck
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { deckId } = await params;

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
    const validationResult = updateDeckSchema.safeParse(body);
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

    const updatedDeck = await updateDeck(userId, deckId, validationResult.data);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          deck: updatedDeck,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update deck error:', error);

    if (
      error.code === ErrorCode.CARD_NOT_FOUND ||
      error.code === ErrorCode.INVALID_DECK_SIZE ||
      error.code === ErrorCode.DUPLICATE_CARD_LIMIT ||
      error.code === ErrorCode.DECK_COST_EXCEEDED ||
      error.code === ErrorCode.CARD_NOT_OWNED
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
          message: 'Failed to update deck',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/decks/:deckId
 * Delete a deck
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { deckId } = await params;

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

    await deleteDeck(userId, deckId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Deck deleted successfully',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete deck error:', error);

    if (error.code === ErrorCode.CARD_NOT_FOUND) {
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
          message: 'Failed to delete deck',
        },
      },
      { status: 500 }
    );
  }
}
