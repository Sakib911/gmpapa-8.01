import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type HandlerFunction = (
  req: NextRequest,
  session: any,
  context?: { params: Record<string, string> }
) => Promise<Response>;

export function withAuth(handler: HandlerFunction) {
  return async function(
    req: NextRequest,
    context?: { params: Record<string, string> }
  ) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      return handler(req, session, context);
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}