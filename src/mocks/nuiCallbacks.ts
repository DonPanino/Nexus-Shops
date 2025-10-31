// NUI message handlers for development mode
export const mockNuiCallbacks = {
  closeUI: () => {
    console.log('[DEV] Received closeUI event');
    return { status: 'ok' };
  },

  notifyError: (data: { message: string }) => {
    console.log('[DEV] Error notification:', data.message);
    return { status: 'ok' };
  },

  purchaseCart: (data: { 
    cartItems: Array<{ name: string; amount: number }>;
    shop: string;
    paymentMethod: 'cash' | 'bank';
  }) => {
    console.log('[DEV] Processing purchase:', {
      items: data.cartItems,
      shop: data.shop,
      payment: data.paymentMethod
    });

    // Simulate server processing
    setTimeout(() => {
      // Simulate successful purchase response
      window.postMessage({
        action: 'closeShop',
        success: true,
        shop: data.shop
      }, '*');
    }, 500);

    return { status: 'success' };
  }
};