import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/responses';
import { Store } from '@/lib/models/store.model';
import dbConnect from '@/lib/db/mongodb';

export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    await dbConnect();
    
    const stores = await Store.find({ reseller: session.user.id })
      .select('-settings.bkash') // Exclude sensitive data
      .sort({ createdAt: -1 });

    return successResponse(stores);
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    return errorResponse('Failed to fetch stores', 500);
  }
});