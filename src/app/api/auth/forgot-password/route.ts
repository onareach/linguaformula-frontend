import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export async function POST(request: NextRequest) {
  if (!API) {
    return NextResponse.json({ error: 'Server URL is not configured' }, { status: 500 });
  }
  const url = `${API.replace(/\/$/, '')}/api/auth/forgot-password`;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json(
        { error: res.ok ? 'Invalid response from backend.' : `Backend returned ${res.status}` },
        { status: res.ok ? 502 : res.status }
      );
    }
    return NextResponse.json(data as object, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Backend unreachable';
    return NextResponse.json({ error: `Could not reach backend: ${message}` }, { status: 502 });
  }
}
