import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export async function POST(request: NextRequest) {
  if (!API) {
    return NextResponse.json({ error: 'Server URL is not configured' }, { status: 500 });
  }
  try {
    const body = await request.json();
    const res = await fetch(`${API.replace(/\/$/, '')}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 502 });
  }
}
