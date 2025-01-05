export interface CartItem {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      images: string[];
    };
  }
  
  export interface Cart {
    items: CartItem[];
  }
  