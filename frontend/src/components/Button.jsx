import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'bg-paddy-700 text-cream hover:bg-paddy-900',
  accent: 'bg-turmeric-500 text-paddy-900 hover:bg-turmeric-300',
  secondary: 'border border-paddy-300 bg-transparent text-paddy-700 hover:bg-paddy-50',
  ghost: 'text-paddy-700 hover:bg-paddy-50',
  danger: 'bg-rust-500 text-white hover:bg-rust-700',
};
const SIZES = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };

export default function Button({ variant = 'primary', size = 'md', to, className = '', children, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>;
  return <button type="button" className={classes} {...props}>{children}</button>;
}
