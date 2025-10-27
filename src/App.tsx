import { useState, useEffect } from 'react';
import ShopUI from './components/ShopUI';
import { ShopData } from './types';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [shopData, setShopData] = useState<ShopData | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;

      if (data.action === 'openShop') {
        setShopData(data.shopData);
        setIsVisible(true);
      } else if (data.action === 'closeShop') {
        setIsVisible(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
        fetch(`https://${GetParentResourceName()}/closeUI`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  const GetParentResourceName = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'nui-frame-app';
    }
    const match = window.location.href.match(/https?:\/\/([^/]+)\//);
    return match ? match[1] : 'nui-frame-app';
  };

  if (!isVisible || !shopData) {
    return null;
  }

  return <ShopUI shopData={shopData} onClose={() => setIsVisible(false)} />;
}

export default App;
