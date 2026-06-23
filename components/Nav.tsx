'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const path = usePathname();

  return (
    <nav>
      <div className="logo">⚡ <span>VE</span>Bat</div>
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
