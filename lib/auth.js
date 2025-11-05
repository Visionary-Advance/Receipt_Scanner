import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function getSession() {
  return await getServerSession();
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized. Please sign in.' },
    { status: 401 }
  );
}
