import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 bg-paddy-900 text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 font-display text-xl font-bold"><Leaf size={20} aria-hidden />KhetScan</p>
          <p className="mt-3 max-w-sm text-sm text-paddy-100">
            Photo-based crop disease detection. Results are decision support and do not replace advice from an agronomist.
          </p>
        </div>
        <nav aria-label="Product" className="text-sm">
          <p className="font-semibold">Product</p>
          <ul className="mt-3 space-y-2 text-paddy-100">
            <li><Link to="/detect" className="hover:text-white">Scan a leaf</Link></li>
            <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
            <li><Link to="/history" className="hover:text-white">Scan history</Link></li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-semibold">Need a second opinion?</p>
          <p className="mt-3 text-paddy-100">Contact your nearest Krishi Vigyan Kendra or state agriculture department before large-scale spraying.</p>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-paddy-100">© {new Date().getFullYear()} KhetScan. Built with React, Express and TensorFlow.</p>
    </footer>
  );
}
