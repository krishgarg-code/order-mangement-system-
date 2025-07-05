const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://cs-backend.vercel.app/api' : 'http://localhost:3000/api');

// Debug logging
console.log('🔍 API_URL configured as:', API_URL);
console.log('🔍 import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔍 import.meta.env.PROD:', import.meta.env.PROD);
console.log('🔍 import.meta.env.MODE:', import.meta.env.MODE);

export const api = {
  // Get all orders
  getOrders: async () => {
    try {
      console.log('🔍 Fetching orders from:', `${API_URL}/orders`);
      console.log('🔍 Environment:', import.meta.env.MODE);
      console.log('🔍 VITE_API_URL:', import.meta.env.VITE_API_URL);
      
      const response = await fetch(`${API_URL}/orders`);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      
      const data = await response.json();
      if (!response.ok) {
        console.error('Error fetching orders:', data.message || 'Failed to fetch orders');
        throw new Error(data.message || 'Failed to fetch orders');
      }
      // Return the orders array directly (backend returns array, not paginated object)
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Create a new order
  createOrder: async (orderData) => {
    console.log('Sending order data:', orderData);
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Error creating order:', data.message || 'Failed to create order');
      throw new Error(data.message || 'Failed to create order');
    }
    console.log('Order created successfully:', data);
    return data;
  },

  // Update an order
  updateOrder: async (id, orderData) => {
    console.log('Updating order:', id, orderData);
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Error updating order:', data.message || 'Failed to update order');
      throw new Error(data.message || 'Failed to update order');
    }
    console.log('Order updated successfully:', data);
    return data;
  },

  // Delete an order
  deleteOrder: async (id) => {
    console.log('Deleting order:', id);
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Error deleting order:', data.message || 'Failed to delete order');
      throw new Error(data.message || 'Failed to delete order');
    }
    console.log('Order deleted successfully:', data);
    return data;
  },
}; 