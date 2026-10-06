export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-paddy-300 px-6 py-14 text-center">
      {Icon && <Icon size={36} className="mb-4 text-paddy-500" aria-hidden />}
      <h3 className="text-xl font-bold">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-soil-600">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
