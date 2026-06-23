import { NextRequest, NextResponse } from 'next/server';
import { listBatteries, createBattery, addIntervention } from '@/lib/db';
import type { DiagnosticFormData } from '@/lib/types';

export async function GET() {
  try {
    const batteries = await listBatteries();
    return NextResponse.json(batteries);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data: DiagnosticFormData = await req.json();

    if (!data.serie?.trim() || !data.modele?.trim() || !data.vehicule?.trim() || !data.date?.trim() || !data.technicien?.trim() || !data.decision?.trim()) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    // Crée la batterie si elle n'existe pas encore (ON CONFLICT DO NOTHING)
    await createBattery(data);
    await addIntervention(data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
