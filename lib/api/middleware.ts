import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function withDynamicRoute(handler: (req: NextRequest) => Promise<Response>) {
  return async function(req: NextRequest) {
    // Force dynamic response
    const response = await handler(req);
    
    // Add cache control headers
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store, must-revalidate');
    headers.set('x-middleware-cache', 'no-cache');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
}