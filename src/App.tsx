import { useState, useEffect, useCallback } from 'react';
import ShopUI from './components/ShopUI';
import { ShopData, ShopItem } from './types';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const handleCloseUI = useCallback(() => {
    // Check isVisible state captured by useCallback.
    if (!isVisible) return; 

    // 1. Update React state
    setIsVisible(false);
    setShopData(null);

    // 2. Ensure NUI elements don't trap pointer or focus
    try {
      (document.activeElement as HTMLElement | null)?.blur();
      // Reset pointer events if they were changed when opening the UI
      document.body.style.pointerEvents = 'auto';
    } catch (e) {
      /* no-op */
    }
    
    fetch(`https://${GetParentResourceName()}/closeUI`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }).catch(console.error);

  }, [isVisible]);

  const handleClose = () => {
    handleCloseUI();
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;

        if (data.action === 'openShop' && data.shopData) {
          const transformedData: ShopData & { key?: string } = {
            key: String(data.shopData.key || data.shopData.label || ''),
            label: data.shopData.label || 'Shop',
            items: Array.isArray(data.shopData.items) ? data.shopData.items.map((item: Partial<ShopItem>) => ({
              name: String(item.name || ''),
              price: Number(item.price || 0),
              amount: Number(item.amount || 0),
              info: item.info || {},
              type: String(item.type || ''),
              slot: Number(item.slot || 0),
              label: String(item.label || item.name || ''),
              description: String(item.description || ''),
              image: String(item.image || '')
            })) : [],
            slots: Number(data.shopData.slots || 0)
          };
          
          setShopData(transformedData);
          setIsVisible(true);
        } else if (data.action === 'closeShop') {
          handleCloseUI();
        }
      } catch (error) {
        console.error('Error processing shop data:', error);
      }
    };

    // This function will now be recreated with the latest handleCloseUI
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) { 
        event.preventDefault();
        handleCloseUI();
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, handleCloseUI]); // <-- Crucial dependencies for the event listener

  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      {shopData && (
        <ShopUI shopData={shopData} onClose={handleClose} />
      )}
    </div>
  );
}

export default App;