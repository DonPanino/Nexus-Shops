import { ShopData } from '../types';

// Mock shop data for development
export const mockShops: Record<string, ShopData> = {
  "247supermarket": {
    label: "24/7 Supermarket",
    items: [
      {
        name: "water_bottle",
        label: "Water Bottle",
        price: 10,
        amount: 50,
        info: {},
        type: "item",
        slot: 1,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/water_bottle.png",
        description: "Stay hydrated!"
      },
      {
        name: "sandwich",
        label: "Sandwich",
        price: 15,
        amount: 50,
        info: {},
        type: "item",
        slot: 2,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/sandwich.png",
        description: "A tasty sandwich"
      },
      {
        name: "cola",
        label: "eCola",
        price: 12,
        amount: 50,
        info: {},
        type: "item",
        slot: 3,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/cola.png",
        description: "Refreshing soda"
      },
      {
        name: "phone",
        label: "Phone",
        price: 999,
        amount: 5,
        info: {},
        type: "item",
        slot: 4,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/phone.png",
        description: "Latest model smartphone"
      },
      {
        name: "radio",
        label: "Radio",
        price: 799,
        amount: 10,
        info: {},
        type: "item",
        slot: 5,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/radio.png",
        description: "Portable communication device"
      }
    ],
    slots: 5
  },
  "ammunation": {
    label: "Ammunation",
    items: [
      {
        name: "armor",
        label: "Body Armor",
        price: 5000,
        amount: 5,
        info: {},
        type: "item",
        slot: 1,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/armor.png",
        description: "Standard body armor"
      },
      {
        name: "repairkit",
        label: "Repair Kit",
        price: 250,
        amount: 50,
        info: {},
        type: "item",
        slot: 2,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/repairkit.png",
        description: "Basic vehicle repair kit"
      },
      {
        name: "binoculars",
        label: "Binoculars",
        price: 500,
        amount: 15,
        info: {},
        type: "item",
        slot: 3,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/binoculars.png",
        description: "Long-range viewing device"
      }
    ],
    slots: 3
  },
  "hardware": {
    label: "Hardware Store",
    items: [
      {
        name: "lockpick",
        label: "Lockpick",
        price: 150,
        amount: 30,
        info: {},
        type: "item",
        slot: 1,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/lockpick.png",
        description: "Standard lockpicking tool"
      },
      {
        name: "screwdriverset",
        label: "Screwdriver Set",
        price: 350,
        amount: 50,
        info: {},
        type: "item",
        slot: 2,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/screwdriverset.png",
        description: "Set of various screwdrivers"
      },
      {
        name: "drill",
        label: "Drill",
        price: 1500,
        amount: 5,
        info: {},
        type: "item",
        slot: 3,
        image: "https://raw.githubusercontent.com/qbcore-framework/qb-inventory/main/html/images/drill.png",
        description: "Heavy-duty power drill"
      }
    ],
    slots: 3
  }
};