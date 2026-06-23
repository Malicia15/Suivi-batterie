import { NextRequest, NextResponse } from 'next/server';
import { getBattery, deleteBattery } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ serie: string }> }) {
  const { serie } = await params;
  try {
    const battery = await getBattery(decodeURIComponent(serie));
    if (!battery) return NextResponse.json({ error: 'Batterie non trouvée' }, { status: 404 });
    return NextResponse.json(battery);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ serie: string }> }) {
  const { serie } = await params;
  try {
    const deleted = await deleteBattery(decodeURIComponent(serie));
    if (!deleted) return NextResponse.json({ error: 'Batterie non trouvée' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
