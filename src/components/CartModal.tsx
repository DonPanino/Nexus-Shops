import { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, CreditCard, Wallet } from 'lucide-react';
import { ShopItem } from '../types';

interface CartItem extends ShopItem {
  quantity: number;
}

interface CartModalProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (itemName: string, quantity: number) => void;
  onRemoveItem: (itemName: string) => void;
  onCheckout: (paymentMethod: 'cash' | 'bank') => void;
}

function CartModal({ items, onClose, onUpdateQuantity, onRemoveItem, onCheckout }: CartModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCheckout = async () => {
    if (isProcessing) return; // Prevent multiple clicks
    
    try {
      setIsProcessing(true);
      await onCheckout(paymentMethod);
      // Close modal is handled by the client-side Lua callback
    } catch (error) {
      console.error('Checkout failed:', error);
      // Error is handled by the client-side Lua callback
    } finally {
      setIsProcessing(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="cart-modal">
      <div className="cart-content">
        {/* Header */}
        <div className="cart-header">
          <div className="shop-header-content">
            <div className="shop-title-section">
              <ShoppingCart className="shop-icon" />
              <h2 className="shop-title">Shopping Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="shop-control-button"
            >
              <X className="w-5 h-5 text-black hover:text-white" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-items">
              <ShoppingCart className="empty-icon" />
              <p className="empty-text">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.name} className="cart-item">
                  {/* Item Image */}
                  <div className="cart-item-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.label || item.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <ShoppingCart className={`w-8 h-8 text-slate-600 ${item.image ? 'hidden' : ''}`} />
                  </div>

                  {/* Item Details */}
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.label || item.name}</h3>
                    <p className="cart-item-price">${item.price.toLocaleString()}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="cart-quantity-controls">
                    <button
                      onClick={() => onUpdateQuantity(item.name, item.quantity - 1)}
                      className="quantity-button"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4 text-slate-900" />
                    </button>
                    <span className="quantity-text">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.name, item.quantity + 1)}
                      className="quantity-button"
                      disabled={item.amount !== -1 && item.quantity >= item.amount}
                    >
                      <Plus className="w-4 h-4 text-slate-900" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.name)}
                    className="remove-button"
                  >
                    <X className="remove-icon" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Section */}
        {items.length > 0 && (
          <div className="payment-section">
            {/* Payment Method Selection */}
            <div className="payment-methods">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`payment-button ${
                  paymentMethod === 'cash'
                    ? 'payment-button-active'
                    : 'payment-button-inactive'
                }`}
              >
                <Wallet className="w-5 h-5" />
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod('bank')}
                className={`payment-button ${
                  paymentMethod === 'bank'
                    ? 'payment-button-active'
                    : 'payment-button-inactive'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Card
              </button>
            </div>

            {/* Total and Checkout Button */}
            <div className="total-section">
              <span className="total-label">Total:</span>
              <span className="total-amount">${total.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="checkout-button"
              disabled={isProcessing}
            >
              <ShoppingCart className="w-5 h-5" />
              {isProcessing ? 'Processing...' : `Checkout with ${paymentMethod === 'cash' ? 'Cash' : 'Card'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;