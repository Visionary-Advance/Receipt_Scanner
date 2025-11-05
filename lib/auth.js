import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

export async function getSession() {
  return await getServerSession(authOptions);
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized. Please sign in.' },
    { status: 401 }
  );
}
