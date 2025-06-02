import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load orders from API on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await api.getOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const addOrder = async (orderData) => {
    try {
      setLoading(true);
      const newOrder = await api.createOrder(orderData);
      setOrders(prevOrders => [...prevOrders, newOrder]);
      setError(null);
      return newOrder;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, updatedOrder) => {
    try {
      setLoading(true);
      const updated = await api.updateOrder(id, updatedOrder);
      setOrders(prevOrders =>
        prevOrders.map(order => (order._id === id ? updated : order))
      );
      setError(null);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      setLoading(true);
      await api.deleteOrder(id);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importOrders = async (importedOrders) => {
    try {
      setLoading(true);
      const importPromises = importedOrders.map(order => api.createOrder(order));
      const newOrders = await Promise.all(importPromises);
      setOrders(prevOrders => [...prevOrders, ...newOrders]);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportOrders = () => {
    const dataStr = JSON.stringify(orders, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `rolling-mill-orders-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return {
    orders,
    loading,
    error,
    addOrder,
    updateOrder,
    deleteOrder,
    importOrders,
    exportOrders,
  };
};
