import { useState } from 'react';
import { X, Package, ShoppingCart, Plus, Minus } from 'lucide-react';
import { ShopItem } from '../types';

interface PurchaseModalProps {
  item: ShopItem;
  onClose: () => void;
}

function PurchaseModal({ item, onClose }: PurchaseModalProps) {
  const [quantity, setQuantity] = useState(1);
  const displayName = item.label || item.name;
  const maxQuantity = item.amount === -1 ? 999 : item.amount;

  const handlePurchase = () => {
    fetch(`https://${GetParentResourceName}/buyItem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: item.name,
        amount: quantity
      })
    });
    onClose();
  };

  const GetParentResourceName = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'nui-frame-app';
    }
    const match = window.location.href.match(/https?:\/\/([^/]+)\//);
    return match ? match[1] : 'nui-frame-app';
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const totalPrice = item.price * quantity;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Purchase Item</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-black hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item Display */}
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-center w-20 h-20 flex-shrink-0">
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
                <Package className={`w-12 h-12 text-slate-600 ${item.image ? 'hidden' : ''}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">{displayName}</h3>
                <p className="text-emerald-400 font-bold">${item.price.toLocaleString()}</p>
                {item.amount !== -1 && (
                  <p className="text-black text-sm mt-1">Available: {item.amount}</p>
                )}
              </div>
            </div>
            {item.description && (
              <p className="text-black text-sm mt-4 pt-4 border-t border-slate-700/50">
                {item.description}
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="text-black text-sm mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:cursor-not-allowed p-3 rounded-lg transition-colors"
              >
                <Minus className="w-5 h-5 text-white" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(val, maxQuantity)));
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-center font-semibold flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
              <button
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:cursor-not-allowed p-3 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-black">Total Price:</span>
              <span className="text-emerald-400 font-bold text-xl">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseModal;
