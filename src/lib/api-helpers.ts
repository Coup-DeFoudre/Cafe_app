import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export function successResponse<T>(data: T, message?: string): Response {
  return NextResponse.json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
}

export function errorResponse(error: string, statusCode: number): Response {
  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse<null>,
    { status: statusCode }
  );
}

export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    
    if (prismaError.code === 'P2002') {
      return errorResponse('Resource already exists', 400);
    }
    
    if (prismaError.code === 'P2025') {
      return errorResponse('Resource not found', 404);
    }
    
    if (prismaError.code === 'P2003') {
      return errorResponse('Invalid reference', 400);
    }
  }

  // Validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    return errorResponse(error.message, 400);
  }

  // Generic server error
  return errorResponse('Internal server error', 500);
}