import { NextRequest, NextResponse } from 'next/server';
import { logger, generateRequestId } from './logger';
import { auth } from '@/auth';

/**
 * API wrapper that adds logging to route handlers
 */
export function withLogging<T = any>(
  handler: (
    request: NextRequest,
    context: { params: any },
    meta: { userId?: string; requestId: string }
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, context: { params: any }) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const method = request.method;
    const path = request.nextUrl.pathname;

    // Get user ID from session if available
    let userId: string | undefined;
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch (error) {
      // Session check failed, continue without userId
    }

    // Log incoming request
    logger.apiRequest(method, path, userId, requestId);

    try {
      // Call the actual handler
      const response = await handler(request, context, { userId, requestId });

      // Log successful response
      const duration = Date.now() - startTime;
      logger.apiResponse(method, path, response.status, duration, userId, requestId);

      return response;
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;
      logger.error(
        `API Error: ${method} ${path}`,
        error instanceof Error ? error : new Error(String(error)),
        { method, path, duration },
        userId,
        requestId
      );

      // Return error response
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Internal server error',
            requestId,
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to create standardized success responses
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Helper to create standardized error responses
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  requestId?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        requestId,
      },
    },
    { status }
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}
