import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/components.css';
import { mockShops } from './mocks/shopData';

// Development mode - show a shop selector
if (import.meta.env.DEV) {
  const container = document.getElementById('app');
  if (container) {
    const DevApp = () => {
      const [selectedShop, setSelectedShop] = useState<string>('247supermarket');
      
      useEffect(() => {
        // Send initial shop data immediately in dev mode
        setTimeout(() => {
          window.postMessage({
            action: 'openShop',
            shopData: {
              label: mockShops[selectedShop].label || 'Shop',
              items: mockShops[selectedShop].items || [],
              slots: mockShops[selectedShop].slots || 0,
              key: selectedShop
            }
          }, '*');
        }, 100);
      }, [selectedShop]);

      return (
        <StrictMode>
          <div>
            <div className="fixed top-0 left-0 z-50 bg-opacity-90 p-4 rounded-br-lg">
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="bg-slate-800 text-white px-3 py-2 rounded border border-slate-700"
              >
                {Object.entries(mockShops).map(([key, shop]) => (
                  <option key={key} value={key}>
                    {shop.label}
                  </option>
                ))}
              </select>
            </div>
            <App />
          </div>
        </StrictMode>
      );
    };

    createRoot(container).render(<DevApp />);
  }
} else {
  // Production mode - normal app
  const container = document.getElementById('app');
  if (container) {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}
