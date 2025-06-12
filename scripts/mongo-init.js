// MongoDB initialization script for Order Management System

// Switch to the order-management database
db = db.getSiblingDB('order-management');

// Create a user for the application
db.createUser({
  user: 'oms-user',
  pwd: 'oms-password',
  roles: [
    {
      role: 'readWrite',
      db: 'order-management'
    }
  ]
});

// Create collections with validation
db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['orderNumber', 'customerName', 'items', 'status', 'createdAt'],
      properties: {
        orderNumber: {
          bsonType: 'string',
          description: 'Order number must be a string and is required'
        },
        customerName: {
          bsonType: 'string',
          description: 'Customer name must be a string and is required'
        },
        items: {
          bsonType: 'array',
          description: 'Items must be an array and is required',
          items: {
            bsonType: 'object',
            required: ['name', 'quantity', 'price'],
            properties: {
              name: { bsonType: 'string' },
              quantity: { bsonType: 'number' },
              price: { bsonType: 'number' }
            }
          }
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'processing', 'completed', 'cancelled'],
          description: 'Status must be one of the enum values'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date must be a date and is required'
        }
      }
    }
  }
});

// Create indexes for better performance
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ customerName: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

// Insert sample data
db.orders.insertMany([
  {
    orderNumber: 'ORD-001',
    customerName: 'John Doe',
    items: [
      { name: 'Widget A', quantity: 2, price: 25.99 },
      { name: 'Widget B', quantity: 1, price: 15.50 }
    ],
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    orderNumber: 'ORD-002',
    customerName: 'Jane Smith',
    items: [
      { name: 'Product X', quantity: 3, price: 45.00 }
    ],
    status: 'processing',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date()
  }
]);

print('MongoDB initialization completed successfully!');
print('Database: order-management');
print('Collections created: orders');
print('Sample data inserted: 2 orders');
