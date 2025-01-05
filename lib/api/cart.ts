import { handleAPIResponse } from './errors';
import type { Cart } from '@/types/cart';

export async function fetchCartData(): Promise<Cart> {
  const response = await fetch('/api/cart');
  await handleAPIResponse(response);
  return response.json();
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const response = await fetch('/api/cart', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, quantity }),
  });
  await handleAPIResponse(response);
  return response.json();
}
