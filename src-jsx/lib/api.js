const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  // Get all orders
  getOrders: async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Create a new order
  createOrder: async (orderData) => {
    try {
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
        throw new Error(data.message || 'Failed to create order');
      }
      console.log('Order created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update an order
  updateOrder: async (id, orderData) => {
    try {
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
        throw new Error(data.message || 'Failed to update order');
      }
      console.log('Order updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Delete an order
  deleteOrder: async (id) => {
    try {
      console.log('Deleting order:', id);
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete order');
      }
      console.log('Order deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },
}; 