export interface ShopItem {
  name: string;
  price: number;
  amount: number;
  info: Record<string, any>;
  type: string;
  slot: number;
  label?: string;
  description?: string;
  image?: string;
}

export interface ShopData {
  label: string;
  items: ShopItem[];
  slots: number;
}
