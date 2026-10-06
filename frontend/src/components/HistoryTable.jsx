import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import ConfidenceMeter from './ConfidenceMeter';
import DiseaseBadge from './DiseaseBadge';
import { formatDate } from '../utils/format';

function Actions({ item, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <Link to={`/history/${item.id}`} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-paddy-700 hover:bg-paddy-50">
        <Eye size={16} aria-hidden />View
      </Link>
      {confirming ? (
        <>
          <button type="button" onClick={() => onDelete(item)} className="rounded-full bg-rust-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rust-700">Delete</button>
          <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-3 py-1.5 text-sm font-semibold text-soil-600 hover:bg-cream-deep">Cancel</button>
        </>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} aria-label={`Delete ${item.cropName} ${item.predictedDisease} scan`} className="grid h-9 w-9 place-items-center rounded-full text-soil-600 hover:bg-rust-100 hover:text-rust-700">
          <Trash2 size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}

export default function HistoryTable({ items, onDelete }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-paddy-100 bg-white/80 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-paddy-50 text-soil-600">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Leaf</th>
              <th scope="col" className="px-4 py-3 font-semibold">Result</th>
              <th scope="col" className="w-44 px-4 py-3 font-semibold">Confidence</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Date</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paddy-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3"><img src={item.imageUrl} alt="" loading="lazy" className="h-14 w-14 rounded-lg object-cover" /></td>
                <td className="px-4 py-3"><p className="font-semibold">{item.predictedDisease}</p><p className="text-soil-600">{item.cropName}</p></td>
                <td className="px-4 py-3"><ConfidenceMeter value={item.confidence} status={item.status} compact /></td>
                <td className="px-4 py-3"><DiseaseBadge status={item.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-soil-600">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3"><Actions item={item} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-paddy-100 bg-white/80 p-4">
            <div className="flex gap-3">
              <img src={item.imageUrl} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.predictedDisease}</p>
                <p className="text-sm text-soil-600">{item.cropName} · {formatDate(item.createdAt)}</p>
                <DiseaseBadge status={item.status} className="mt-2 !px-2 !py-0.5 !text-xs" />
              </div>
            </div>
            <div className="mt-3"><ConfidenceMeter value={item.confidence} status={item.status} compact /></div>
            <div className="mt-2"><Actions item={item} onDelete={onDelete} /></div>
          </li>
        ))}
      </ul>
    </>
  );
}
