import { NextResponse, NextRequest } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { createClerkClient } from '@clerk/backend';

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  org_id?: string;
  role: string;
  vehicles_count: number;
  created_at: string;
  status: 'active' | 'pending' | 'inactive';
}

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrator session required.' }, { status: 401 });
  }

  try {
    const usersList: AdminUserData[] = [];
    const seenEmails = new Set<string>();

    // 1. Fetch Organisations & Vehicles from Neon Postgres
    let orgRows: any[] = [];
    let vehicleRows: any[] = [];

    try {
      orgRows = await query(`
        SELECT id, name, slug, phone, email, created_at 
        FROM organisations 
        ORDER BY created_at DESC
      `);
      vehicleRows = await query(`
        SELECT id, org_id, plate_number, make, model, gps_tracker_imei, status 
        FROM vehicles
      `);
    } catch (dbErr) {
      console.warn('Neon DB query notice in admin/users:', dbErr);
    }

    // Map vehicle counts per org_id
    const vehicleCountByOrg: Record<string, number> = {};
    for (const v of vehicleRows) {
      if (v.org_id) {
        vehicleCountByOrg[v.org_id] = (vehicleCountByOrg[v.org_id] || 0) + 1;
      }
    }

    // 2. Fetch Users from Clerk Directory
    let clerkUsers: any[] = [];
    try {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (clerkSecretKey) {
        const client = createClerkClient({ secretKey: clerkSecretKey });
        const res = await client.users.getUserList({ limit: 100 });
        clerkUsers = res.data || (Array.isArray(res) ? res : []);
      }
    } catch (clerkErr) {
      console.warn('Clerk user list fetch notice in admin/users:', clerkErr);
    }

    // Map Clerk users to admin list
    for (const cu of clerkUsers) {
      const email = cu.emailAddresses?.[0]?.emailAddress?.toLowerCase() || '';
      if (!email) continue;
      seenEmails.add(email);

      // Find matching organisation in Neon
      const matchingOrg = orgRows.find(
        o => (o.email && o.email.toLowerCase() === email) ||
             (o.phone && o.phone.toLowerCase() === email) ||
             (o.name && o.name.toLowerCase() === (cu.firstName || '').toLowerCase())
      );

      const fullName = [cu.firstName, cu.lastName].filter(Boolean).join(' ') || cu.username || email.split('@')[0];
      const orgName = matchingOrg?.name || 'Individual Fleet Operator';
      const orgId = matchingOrg?.id;
      const vCount = orgId ? (vehicleCountByOrg[orgId] || 0) : 0;
      const phone = cu.phoneNumbers?.[0]?.phoneNumber || matchingOrg?.phone || 'Not provided';
      const createdAt = cu.createdAt ? new Date(cu.createdAt).toISOString() : new Date().toISOString();

      usersList.push({
        id: cu.id,
        name: fullName,
        email,
        phone,
        organization: orgName,
        org_id: orgId,
        role: 'Fleet Owner',
        vehicles_count: vCount,
        created_at: createdAt,
        status: 'active',
      });
    }

    // 3. Include verified organisations from Neon not already matched by email
    for (const org of orgRows) {
      const orgEmail = (org.email || '').toLowerCase().trim();
      const orgPhone = (org.phone || '').trim();
      const orgKey = `org-${org.id}`;

      if (orgEmail && !seenEmails.has(orgEmail)) {
        seenEmails.add(orgEmail);
        usersList.push({
          id: orgKey,
          name: org.name,
          email: orgEmail,
          phone: orgPhone || 'Not provided',
          organization: org.name,
          org_id: org.id,
          role: 'Fleet Owner',
          vehicles_count: vehicleCountByOrg[org.id] || 0,
          created_at: org.created_at || new Date().toISOString(),
          status: 'active',
        });
      } else if (!orgEmail && orgPhone) {
        // Real organisation with phone contact
        usersList.push({
          id: orgKey,
          name: org.name,
          email: '',
          phone: orgPhone,
          organization: org.name,
          org_id: org.id,
          role: 'Fleet Owner',
          vehicles_count: vehicleCountByOrg[org.id] || 0,
          created_at: org.created_at || new Date().toISOString(),
          status: 'active',
        });
      }
    }



    // Sort by creation date descending
    usersList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // CRITICAL SECURITY GUARANTEE: Never include passwords, hashes, or auth keys in payload
    return NextResponse.json({
      success: true,
      total: usersList.length,
      users: usersList,
    });
  } catch (error: any) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve platform users.' }, { status: 500 });
  }
}
