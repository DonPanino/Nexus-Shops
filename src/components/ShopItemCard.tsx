import { Package } from 'lucide-react';
import { ShopItem } from '../types';

interface ShopItemCardProps {
  item: ShopItem;
  onClick: () => void;
  cartQuantity?: number;
}

function ShopItemCard({ item, onClick, cartQuantity = 0 }: ShopItemCardProps) {
  const displayName = item.label || item.name;
  const displayPrice = item.price.toLocaleString();

  return (
    <button onClick={onClick} className="shop-item">
      {cartQuantity > 0 && (
        <span className="shop-item-quantity">
          {cartQuantity}
        </span>
      )}
      <div className="shop-item-container">
        {/* Item Image/Icon */}
        <div className="shop-item-image-container">
          {item.image ? (
            <img
              src={item.image}
              alt={displayName}
              className="shop-item-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Package className={`shop-item-placeholder-icon ${item.image ? 'hidden' : ''}`} />
        </div>

        {/* Item Info */}
        <div className="shop-item-info">
          <h3 className="shop-item-title">{displayName}</h3>
          {item.description && (
            <p className="shop-item-description">{item.description}</p>
          )}
        </div>

        {/* Price and Stock */}
        <div className="shop-item-footer">
          <div className="shop-item-price-container">
            <span className="shop-item-price">${displayPrice}</span>
          </div>
          {item.amount !== -1 && (
            <span className="shop-item-stock">
              Stock: <span className="shop-item-stock-amount">{item.amount}</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ShopItemCard;
