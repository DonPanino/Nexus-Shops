import { useState, useMemo, useEffect, useRef } from 'react';
import { X, ShoppingCart, Search } from 'lucide-react';
import { ShopData, ShopItem } from '../types';
import ShopItemCard from './ShopItemCard';
import CartModal from './CartModal';
import { mockNuiCallbacks } from '../mocks/nuiCallbacks';

interface ShopUIProps {
  shopData: ShopData;
  onClose: () => void;
}

interface CartItem extends ShopItem {
  quantity: number; 
}

function ShopUI({ shopData, onClose }: ShopUIProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const recentPurchasesRef = useRef<Record<string, number>>({});
  const RECENT_PURCHASE_COOLDOWN = 5000; // ms

  const isDev = useMemo(() => import.meta.env.DEV, []);

  const GetParentResourceName = useMemo(() => {
    // In dev mode, return mock resource name
    if (isDev) return 'nui-frame-app';

    // Prefer FiveM-injected global if available on window
    const globalGet = (window as unknown as { GetParentResourceName?: () => string }).GetParentResourceName;
    if (typeof globalGet === 'function') return globalGet();

    // If running inside FiveM NUI the hostname may be like `cfx-nui-<resourcename>`
    const hostname = window.location.hostname || '';
    if (hostname.startsWith('cfx-nui-')) {
      return hostname.replace('cfx-nui-', '');
    }

    return 'qb-shops';
  }, [isDev]);
  
  const handleAddToCart = (item: ShopItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.name === item.name);
      const currentQuantity = existingItem?.quantity || 0;
      
      // Check if adding one more would exceed stock
      if (item.amount !== -1 && currentQuantity >= item.amount) {
        // Send error message to client
        if (isDev) {
          mockNuiCallbacks.notifyError({ message: 'Not enough stock!' });
        } else {
          void fetch(`https://${GetParentResourceName}/notifyError`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Not enough stock!' })
          });
        }
        return prevItems;
      }

      if (existingItem) {
        return prevItems.map(i => 
          i.name === item.name 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const handleClose = async () => {
    try {
      if (isDev) {
        mockNuiCallbacks.closeUI();
      } else {
        await fetch(`https://${GetParentResourceName}/closeUI`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to close UI:', error);
      onClose();
    }
  };

  const handleUpdateQuantity = (itemName: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveFromCart(itemName);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.name === itemName
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveFromCart = (itemName: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.name !== itemName));
  };

  const shopKey = useMemo(() => ((shopData as ShopData & { key?: string })?.key) || shopData?.label || '', [shopData]);

  const handleCheckout = async (paymentMethod: 'cash' | 'bank') => {
    try {
      const resourceName = GetParentResourceName;
      const payload = {
        cartItems: cartItems.map(item => ({ name: item.name, amount: item.quantity })),
        // send internal shop key when available (fallback to label)
        shop: shopKey,
        paymentMethod
      };
      if (isDev) {
        mockNuiCallbacks.purchaseCart(payload);
      } else {
        await fetch(`https://${resourceName}/purchaseCart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      // Do NOT close the modal/UI here. Wait for server purchaseResponse to confirm success.
    } catch (error) {
      console.error('Failed to checkout:', error);
    }
  };

  // Clear cart when the shop changes (ensure cart is per-shop) and close modal
  useEffect(() => {
    setCartItems([]);
    // Ensure cart modal is closed when switching shops
    setShowCart(false);
    const recent = recentPurchasesRef.current[shopKey];
    if (recent && (Date.now() - recent) < RECENT_PURCHASE_COOLDOWN) {
      // Keep cart closed if the shop was just purchased from
      setShowCart(false);
    }
  }, [shopKey, shopData?.label]);

  // Listen for NUI closeShop messages to clear cart for that shop on purchase success
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.action === 'closeShop' && data.success && data.shop) {
        const currentKey = shopKey || shopData.label;
        if (data.shop === currentKey) {
          setCartItems([]);
          setShowCart(false);
          // mark recent purchase for this shop to prevent immediate re-open
          recentPurchasesRef.current[data.shop] = Date.now();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [shopKey, shopData?.label]);

  const filteredItems = useMemo(() => {
    const items = Array.isArray(shopData?.items) ? shopData.items : [];
    return items.filter((item) => {
      const label = (item?.label || item?.name || '').toString();
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [shopData?.items, searchTerm]);

  return (
    <div className="shop-container">
      <div className="shop-content">
        {/* Header */}
        <div className="shop-header">
          <div className="shop-header-content">
            <div className="shop-title-section">
              <div className="shop-icon-container">
                <ShoppingCart className="shop-icon" />
              </div>
              <div>
                <h1 className="shop-title">{shopData?.label || 'Shop'}</h1>
                <p className="shop-subtitle">{filteredItems.length} items available</p>
              </div>
            </div>
            <div className="shop-controls">
              <button
                onClick={() => setShowCart(true)}
                className="shop-cart-button"
              >
                <ShoppingCart className="w-6 h-6 text-black hover:text-white" />
                {cartItems.length > 0 && (
                  <span className="cart-count-badge">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleClose}
                className="shop-control-button"
              >
                <X className="w-6 h-6 text-black hover:text-white" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Items Grid */}
        <div className="items-container">
          {filteredItems.length === 0 ? (
            <div className="empty-items">
              <ShoppingCart className="empty-icon" />
              <p className="empty-text">No items found</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => {
                const cartQuantity = cartItems.find(cartItem => cartItem.name === item.name)?.quantity || 0;
                return (
                  <ShopItemCard
                    key={item.name}
                    item={item}
                    onClick={() => handleAddToCart(item)}
                    cartQuantity={cartQuantity}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Modal */}
        {showCart && (
          <CartModal
            items={cartItems}
            onClose={() => setShowCart(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />
        )}
      </div>
    </div>
  );
}

export default ShopUI;
