import { NextRequest } from 'next/server';
import { withDynamicRoute } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/responses';

async function handler(req: NextRequest) {
  return successResponse({ message: 'API is working' });
}

export const GET = withDynamicRoute(handler);