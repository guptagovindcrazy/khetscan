export default function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-2xl border border-paddy-100 bg-white/80 p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </Tag>
  );
}
