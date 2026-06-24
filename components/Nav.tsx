'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const path = usePathname();

  return (
    <nav>
      <div style={{ background: 'white', borderRadius: 6, padding: '3px 10px', display: 'flex', alignItems: 'center' }}>
        <Image src="/logo.png" alt="Jaqu'auto" height={30} width={100} style={{ objectFit: 'contain' }} priority />
      </div>
      <h1>Suivi Batteries Traction</h1>
      <div className="nav-tabs">
        <Link href="/parc" className={`nav-tab${path === '/parc' || path === '/' ? ' active' : ''}`}>
          🔋 Parc
        </Link>
        <Link href="/nouveau" className={`nav-tab${path === '/nouveau' ? ' active' : ''}`}>
          ＋ Diagnostic
        </Link>
        <Link href="/stats" className={`nav-tab${path === '/stats' ? ' active' : ''}`}>
          📊 Stats
        </Link>
      </div>
    </nav>
  );
}
