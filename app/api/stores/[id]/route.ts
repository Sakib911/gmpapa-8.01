import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/responses';
import { Store } from '@/lib/models/store.model';
import dbConnect from '@/lib/db/mongodb';

export const GET = withAuth(async (req: NextRequest, session, context) => {
  try {
    await dbConnect();
    
    if (!context?.params?.id) {
      return errorResponse('Store ID is required', 400);
    }
    
    const store = await Store.findOne({
      _id: context.params.id,
      reseller: session.user.id
    }).select('-settings.bkash');

    if (!store) {
      return errorResponse('Store not found', 404);
    }

    return successResponse(store);
  } catch (error) {
    console.error('Failed to fetch store:', error);
    return errorResponse('Failed to fetch store', 500);
  }
});