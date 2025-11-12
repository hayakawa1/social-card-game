import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players } from '@/drizzle/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { ErrorCode, type ApiResponse } from '@/types';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
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

    const { username, email, password } = validationResult.data;

    // Check if user already exists
    const existingUserByEmail = await db
      .select()
      .from(players)
      .where(eq(players.email, email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Email already registered',
          },
        },
        { status: 400 }
      );
    }

    const existingUserByUsername = await db
      .select()
      .from(players)
      .where(eq(players.username, username))
      .limit(1);

    if (existingUserByUsername.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Username already taken',
          },
        },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create new player
    const [newPlayer] = await db
      .insert(players)
      .values({
        username,
        email,
        passwordHash,
        level: 1,
        exp: 0,
        gold: 10000, // Starting gold
        gems: 500, // Starting gems
        stamina: 100,
        maxStamina: 100,
        consecutiveLoginDays: 0,
      })
      .returning();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          userId: newPlayer.id,
          username: newPlayer.username,
          email: newPlayer.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to register user',
        },
      },
      { status: 500 }
    );
  }
}
