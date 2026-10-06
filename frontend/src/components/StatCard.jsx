import Card from './Card';

export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <Card className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paddy-50 text-paddy-600">
        <Icon size={22} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-soil-600">{label}</p>
        <p className="font-display text-3xl font-bold leading-tight">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-soil-400">{hint}</p>}
      </div>
    </Card>
  );
}
