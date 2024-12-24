import { NextRequest, NextResponse } from 'next/server';
import { Store } from '@/lib/models/store.model';
import { validateDomain } from '@/lib/utils/domain';
import dbConnect from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const subdomain = searchParams.get('subdomain');

    if (domain) {
      // Validate domain format
      if (!validateDomain(domain)) {
        return NextResponse.json(
          { error: 'Invalid domain format' },
          { status: 400 }
        );
      }

      // Check if domain is already in use
      const existingStore = await Store.findOne({
        'domainSettings.customDomain': domain.toLowerCase()
      });

      return NextResponse.json({ available: !existingStore });
    }

    if (subdomain) {
      // Validate subdomain format
      if (!/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(subdomain)) {
        return NextResponse.json(
          { error: 'Invalid subdomain format' },
          { status: 400 }
        );
      }

      // Check if subdomain is already in use
      const existingStore = await Store.findOne({
        'domainSettings.subdomain': subdomain.toLowerCase()
      });

      return NextResponse.json({ available: !existingStore });
    }

    return NextResponse.json(
      { error: 'Domain or subdomain parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Domain check error:', error);
    return NextResponse.json(
      { error: 'Failed to check domain availability' },
      { status: 500 }
    );
  }
}