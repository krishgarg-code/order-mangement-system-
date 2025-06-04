import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const OrderForm = ({ order, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    orderNumber: generateOrderNumber(),
    companyName: "",
    broker: "",
    quantity: 1,
    orderDate: "",
    expectedDelivery: "",
    notes: "",
    rolls: [
      {
        rollNumber: "",
        hardness: "",
        machining: "",
        rollDescription: "",
        dimensions: "",
        status: "Pending",
        grade: "",
      },
    ],
  });

  useEffect(() => {
    if (order) {
      setFormData({
        orderNumber: order.orderNumber,
        companyName: order.companyName,
        broker: order.broker || "",
        quantity: order.quantity,
        orderDate: order.orderDate,
        expectedDelivery: order.expectedDelivery,
        notes: order.notes,
        rolls: order.rolls || [
          {
            rollNumber: "",
            hardness: "",
            machining: "",
            rollDescription: "",
            dimensions: "",
            status: "Pending",
            grade: "",
          },
        ],
      });
    } else {
      setFormData((prev) => ({ ...prev, orderNumber: generateOrderNumber() }));
    }
  }, [order]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format dates to ISO string and ensure they're valid
    const formattedData = {
      ...formData,
      orderDate: formData.orderDate ? new Date(formData.orderDate).toISOString() : null,
      expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : null,
      quantity: parseInt(formData.quantity) || 1
    };

    // Validate required fields
    if (!formattedData.companyName) {
      alert('Please enter company name');
      return;
    }

    if (!formattedData.orderDate) {
      alert('Please select order date');
      return;
    }

    if (!formattedData.expectedDelivery) {
      alert('Please select expected delivery date');
      return;
    }

    // Validate rolls
    if (!formattedData.rolls || formattedData.rolls.length === 0) {
      alert('At least one roll is required');
      return;
    }

    // Validate each roll
    const invalidRolls = formattedData.rolls.filter(roll => !roll.rollNumber || !roll.hardness);
    if (invalidRolls.length > 0) {
      alert('All rolls must have a roll number and hardness');
      return;
    }

    // Remove empty fields from rolls
    formattedData.rolls = formattedData.rolls.map(roll => ({
      rollNumber: roll.rollNumber,
      hardness: roll.hardness,
      machining: roll.machining || '',
      rollDescription: roll.rollDescription || '',
      dimensions: roll.dimensions || '',
      status: roll.status || 'Pending',
      grade: roll.grade || ''
    }));

    console.log('Submitting order data:', formattedData);
    onSubmit(formattedData);
  };

  const handleQuantityChange = (value) => {
    const qty = parseInt(value) || 1;
    setFormData((prev) => {
      let rolls = prev.rolls.slice(0, qty);
      while (rolls.length < qty) {
        rolls.push({
          rollNumber: "",
          hardness: "",
          machining: "",
          rollDescription: "",
          dimensions: "",
          status: "Pending",
          grade: "",
        });
      }
      return { ...prev, quantity: qty, rolls };
    });
  };

  const rollDescriptions = [
    "SHAFT",
    "ROLL",
    "REEL",
    "CASTING",
  ];
  const statusOptions = [
    "Pending",
    "casting",
    "annealing",
    "machining",
    "baring/wobler",
    "dispached",
  ];
  const gradeOptions = [
    "ALLOYS",
    "ADAMITE",
    "S.G.I",
    "W.S.G",
    "ACCICULAR",
    "CHILL",
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{order ? "Edit Order" : "Add New Order"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orderNumber">Order Number (auto-generated)</Label>
              <Input
                id="orderNumber"
                value={formData.orderNumber}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="broker">Broker</Label>
              <Input
                id="broker"
                value={formData.broker}
                onChange={(e) =>
                  setFormData({ ...formData, broker: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={(e) =>
                  setFormData({ ...formData, orderDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="expectedDelivery">Expected Delivery</Label>
              <Input
                id="expectedDelivery"
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) =>
                  setFormData({ ...formData, expectedDelivery: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Mini forms for each roll */}
          <div className="space-y-6 mt-6 max-h-[70vh] overflow-y-auto pr-2 border rounded-md bg-white">
            {formData.rolls.map((roll, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-semibold mb-2">Roll {idx + 1}</div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label>Roll Number</Label>
                    <Input
                      value={roll.rollNumber}
                      onChange={(e) => {
                        const rolls = [...formData.rolls];
                        rolls[idx].rollNumber = e.target.value;
                        setFormData({ ...formData, rolls });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label>Hardness</Label>
                    <Input
                      value={roll.hardness}
                      onChange={(e) => {
                        const rolls = [...formData.rolls];
                        rolls[idx].hardness = e.target.value;
                        setFormData({ ...formData, rolls });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label>Machining</Label>
                    <Input
                      value={roll.machining}
                      onChange={(e) => {
                        const rolls = [...formData.rolls];
                        rolls[idx].machining = e.target.value;
                        setFormData({ ...formData, rolls });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <Select
                      value={roll.grade}
                      onValueChange={(value) => {
                        const rolls = [...formData.rolls];
                        rolls[idx].grade = value;
                        setFormData({ ...formData, rolls });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Roll Description</Label>
                    <Select
                      value={roll.rollDescription}
                      onValueChange={(value) => {
                        const rolls = [...formData.rolls];
                        rolls[idx].rollDescription = value;
                        setFormData({ ...formData, rolls });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roll description" />
                      </SelectTrigger>
                      <SelectContent>
                        {rollDescriptions.map((desc) => (
                          <SelectItem key={desc} value={desc}>
                            {desc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Dimensions</Label>
                    <Input
                      value={roll.dimensions}
                      onChange={(e) => {
                        const rolls = [...formData.rolls];
                        rolls[idx].dimensions = e.target.value;
                        setFormData({ ...formData, rolls });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={roll.status}
                      onValueChange={(value) => {
                        const rolls = [...formData.rolls];
                        rolls[idx].status = value;
                        setFormData({ ...formData, rolls });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              {order ? "Update Order" : "Create Order"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
