import { Package } from 'lucide-react';
import { ShopItem } from '../types';

interface ShopItemCardProps {
  item: ShopItem;
  onClick: () => void;
}

function ShopItemCard({ item, onClick }: ShopItemCardProps) {
  const displayName = item.label || item.name;
  const displayPrice = item.price.toLocaleString();

  return (
    <button
      onClick={onClick}
      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 hover:border-emerald-500/50 transition-all duration-200 text-left group"
    >
      <div className="flex flex-col h-full">
        {/* Item Image/Icon */}
        <div className="bg-slate-900/50 rounded-lg p-4 mb-3 flex items-center justify-center h-32 group-hover:bg-slate-900 transition-colors">
          {item.image ? (
            <img
              src={item.image}
              alt={displayName}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Package className={`w-16 h-16 text-slate-600 ${item.image ? 'hidden' : ''}`} />
        </div>

        {/* Item Info */}
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1 line-clamp-2">{displayName}</h3>
          {item.description && (
            <p className="text-slate-400 text-sm mb-2 line-clamp-2">{item.description}</p>
          )}
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-lg">${displayPrice}</span>
          </div>
          {item.amount !== -1 && (
            <span className="text-slate-400 text-sm">
              Stock: <span className="text-white font-medium">{item.amount}</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ShopItemCard;
