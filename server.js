
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://foodie-cafe-frontend.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
  ]
}));

app.use(express.json());

// ================= MENU MODEL =================

const menuSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  tag: String,
  price: Number,
  desc: String,
  image: String,
  available: { type: Boolean, default: true }
});

const Menu = mongoose.model("Menu", menuSchema);

// ================= ORDER MODEL =================

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    itemId: Number,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "Pending"
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

// ================= STARTER MENU =================

const starterMenu = [
  {
    id: 1,
    name: "Velvet Cappuccino",
    category: "coffee",
    tag: "BESTSELLER",
    price: 160,
    desc: "Rich espresso, silky milk and a soft cocoa finish.",
    image: "https://images.unsplash.com/photo-1534778101976-628a944c3a69?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2,
    name: "Iced Caramel Latte",
    category: "coffee",
    tag: "CHILLED FAVOURITE",
    price: 190,
    desc: "Smooth espresso over ice with buttery caramel.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3,
    name: "Cafe Club Sandwich",
    category: "food",
    tag: "FRESH PICK",
    price: 220,
    desc: "Toasted layers, crisp veggies and our house sauce.",
    image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "Margherita Pizza",
    category: "food",
    tag: "CLASSIC",
    price: 280,
    desc: "Golden crust, fresh basil and gooey mozzarella.",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "Chocolate Brownie",
    category: "dessert",
    tag: "SWEET TOOTH",
    price: 150,
    desc: "Fudgy centre, crisp edges and pure chocolate joy.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "Strawberry Cheesecake",
    category: "dessert",
    tag: "HOUSE FAVOURITE",
    price: 210,
    desc: "Creamy cheesecake with a bright berry topping.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 7,
    name: "Mango Smoothie",
    category: "drinks",
    tag: "FRUITY & FRESH",
    price: 170,
    desc: "A sunny blend of mango, yoghurt and a little love.",
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 8,
    name: "Classic Cold Coffee",
    category: "drinks",
    tag: "COOL DOWN",
    price: 180,
    desc: "Creamy, chilled coffee blended until perfectly frothy.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80"
  }
];

// ================= MENU API =================

app.get("/api/menu", async (req, res) => {
  try {
    let items = await Menu.find({ available: true }).sort({ id: 1 });

    if (items.length === 0) {
      await Menu.insertMany(starterMenu);
      items = await Menu.find({ available: true }).sort({ id: 1 });
    }

    res.json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    console.error("Menu API error:", error);

    res.status(500).json({
      success: false,
      message: "Could not load menu"
    });
  }
});

// ================= SAVE ORDER API =================

app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, mobile, items } = req.body;

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof mobile !== "string" ||
      !/^[0-9]{10}$/.test(mobile) ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name, 10-digit mobile number and order items."
      });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(Number(item.id)) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 50
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid item or quantity."
        });
      }

      const menuItem = await Menu.findOne({
        id: Number(item.id),
        available: true
      });

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: "Menu item is unavailable."
        });
      }

      orderItems.push({
        itemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity
      });

      total += menuItem.price * quantity;
    }

    const newOrder = await Order.create({
      customerName: customerName.trim(),
      mobile,
      items: orderItems,
      total
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: newOrder
    });

  } catch (error) {
    console.error("Order error:", error);

    res.status(500).json({
      success: false,
      message: "Could not save order."
    });
  }
});

// ================= VIEW ORDERS API =================

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error("Fetch orders error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch orders."
    });
  }
});

// ================= UPDATE ORDER STATUS =================

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Preparing",
      "Completed",
      "Cancelled"
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status."
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error("Status update error:", error);

    res.status(500).json({
      success: false,
      message: "Could not update order."
    });
  }
});

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
  res.send("Foodie Cafe Backend is running!");
});

// ================= HEALTH CHECK =================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Foodie Cafe API is working"
  });
});

// ================= DATABASE CONNECTION =================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

