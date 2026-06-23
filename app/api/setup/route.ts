import { NextResponse } from 'next/server';
import { setupSchema } from '@/lib/db';

export async function GET() {
  try {
    await setupSchema();
    return NextResponse.json({ ok: true, message: 'Schema créé avec succès' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
