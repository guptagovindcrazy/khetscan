import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import Button from './Button';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'History' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const link = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-paddy-100 text-paddy-900' : 'text-paddy-700 hover:bg-paddy-50'}`;

  return (
    <header className="sticky top-0 z-30 border-b border-paddy-100 bg-cream/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-paddy-700 text-cream"><Leaf size={18} aria-hidden /></span>
          KhetScan
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={link}>{l.label}</NavLink>)}
          <Button to="/detect" size="sm" className="ml-3">Scan a leaf</Button>
        </div>
        <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-paddy-50 md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </nav>
      {open && (
        <div className="space-y-1 border-t border-paddy-100 px-4 pb-4 pt-2 md:hidden">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={(s) => `block ${link(s)}`} onClick={() => setOpen(false)}>{l.label}</NavLink>)}
          <Button to="/detect" className="mt-2 w-full" onClick={() => setOpen(false)}>Scan a leaf</Button>
        </div>
      )}
    </header>
  );
}
