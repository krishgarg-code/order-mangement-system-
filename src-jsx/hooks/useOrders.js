import { useState, useEffect } from "react";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load orders from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("rollingMillOrders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Initialize with sample data
      const sampleOrders = [
        {
          id: "1",
          orderNumber: "RM001",
          companyName: "ABC Steel Works",
          contactPerson: "John Doe",
          phone: "+1234567890",
          email: "john@abcsteel.com",
          rollDimension: "50x100x200",
          rollType: "Work Roll",
          quantity: 5,
          pricePerUnit: 15000,
          totalPrice: 75000,
          status: "casting",
          orderDate: "2024-01-15",
          expectedDelivery: "2024-02-15",
          notes: "Urgent order",
        },
        {
          id: "2",
          orderNumber: "RM002",
          companyName: "XYZ Manufacturing",
          contactPerson: "Jane Smith",
          phone: "+1987654321",
          email: "jane@xyzmanuf.com",
          rollDimension: "75x150x300",
          rollType: "Backup Roll",
          quantity: 3,
          pricePerUnit: 25000,
          totalPrice: 75000,
          status: "melting",
          orderDate: "2024-01-20",
          expectedDelivery: "2024-03-01",
          notes: "",
        },
        {
          id: "3",
          orderNumber: "RM003",
          companyName: "PQR Industries",
          contactPerson: "Mike Johnson",
          phone: "+1122334455",
          email: "mike@pqr.com",
          rollDimension: "60x120x250",
          rollType: "Work Roll",
          quantity: 8,
          pricePerUnit: 18000,
          totalPrice: 144000,
          status: "done",
          orderDate: "2024-01-10",
          expectedDelivery: "2024-02-10",
          notes: "Quality check completed",
        },
      ];
      setOrders(sampleOrders);
      localStorage.setItem("rollingMillOrders", JSON.stringify(sampleOrders));
    }
  }, []);

  const saveOrders = (newOrders) => {
    setOrders(newOrders);
    localStorage.setItem("rollingMillOrders", JSON.stringify(newOrders));
  };

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
    };
    const newOrders = [...orders, newOrder];
    saveOrders(newOrders);
  };

  const updateOrder = (id, updatedOrder) => {
    const newOrders = orders.map((order) =>
      order.id === id ? { ...order, ...updatedOrder } : order,
    );
    saveOrders(newOrders);
  };

  const deleteOrder = (id) => {
    const newOrders = orders.filter((order) => order.id !== id);
    saveOrders(newOrders);
  };

  const importOrders = (importedOrders) => {
    // Add IDs to imported orders if they don't have them
    const ordersWithIds = importedOrders.map((order) => ({
      ...order,
      id:
        order.id ||
        Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));
    saveOrders(ordersWithIds);
  };

  return {
    orders,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    importOrders,
    setLoading,
  };
};
