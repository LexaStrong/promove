import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'platform_admin',
      },
    });

    return NextResponse.json({ success: true, role: 'platform_admin' });
  } catch (err: any) {
    console.error('Error updating Clerk user role:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update metadata' }, { status: 500 });
  }
}
