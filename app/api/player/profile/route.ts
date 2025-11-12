import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import {
  getPlayerProfile,
  updatePlayerProfile,
} from '@/lib/services/player.service';
import { ErrorCode, type ApiResponse } from '@/types';
import { z } from 'zod';

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  iconUrl: z.string().url().optional(),
});

/**
 * GET /api/player/profile
 * Get current player's profile
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

    const profile = await getPlayerProfile(userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          playerId: profile.id,
          username: profile.username,
          level: profile.level,
          exp: profile.exp,
          gold: profile.gold,
          gems: profile.gems,
          stamina: profile.stamina,
          maxStamina: profile.maxStamina,
          lastStaminaUpdate: profile.lastStaminaUpdate,
          iconUrl: profile.iconUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to get profile',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/player/profile
 * Update current player's profile
 */
export async function PUT(request: NextRequest) {
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
    const validationResult = updateProfileSchema.safeParse(body);
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

    const updatedProfile = await updatePlayerProfile(
      userId,
      validationResult.data
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          playerId: updatedProfile.id,
          username: updatedProfile.username,
          level: updatedProfile.level,
          exp: updatedProfile.exp,
          gold: updatedProfile.gold,
          gems: updatedProfile.gems,
          stamina: updatedProfile.stamina,
          maxStamina: updatedProfile.maxStamina,
          lastStaminaUpdate: updatedProfile.lastStaminaUpdate,
          iconUrl: updatedProfile.iconUrl,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);

    if (error.message === 'Username already taken') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
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
          message: 'Failed to update profile',
        },
      },
      { status: 500 }
    );
  }
}
