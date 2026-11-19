
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "https://foodie-cafe-frontend.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
  ]
}));
app.use(express.json());

// ================= USER MODEL =================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

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
  address: {
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

// ================= MENU DATA =================

const starterMenu = [
  {
    id: 1, name: "Velvet Cappuccino", category: "coffee",
    tag: "BESTSELLER", price: 160,
    desc: "Rich espresso, silky milk and a soft cocoa finish.",
    image: "https://images.unsplash.com/photo-1534778101976-628a944c3a69?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2, name: "Iced Caramel Latte", category: "coffee",
    tag: "CHILLED FAVOURITE", price: 190,
    desc: "Smooth espresso over ice with buttery caramel.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3, name: "Cafe Club Sandwich", category: "food",
    tag: "FRESH PICK", price: 220,
    desc: "Toasted layers, crisp veggies and our house sauce.",
    image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4, name: "Margherita Pizza", category: "food",
    tag: "CLASSIC", price: 280,
    desc: "Golden crust, fresh basil and gooey mozzarella.",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5, name: "Chocolate Brownie", category: "dessert",
    tag: "SWEET TOOTH", price: 150,
    desc: "Fudgy centre, crisp edges and pure chocolate joy.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6, name: "Strawberry Cheesecake", category: "dessert",
    tag: "HOUSE FAVOURITE", price: 210,
    desc: "Creamy cheesecake with a bright berry topping.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 7, name: "Mango Smoothie", category: "drinks",
    tag: "FRUITY & FRESH", price: 170,
    desc: "A sunny blend of mango, yoghurt and a little love.",
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 8, name: "Classic Cold Coffee", category: "drinks",
    tag: "COOL DOWN", price: 180,
    desc: "Creamy, chilled coffee blended until perfectly frothy.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80"
  }
];

const additionalMenu = [
  {
    id: 9, name: "Farmhouse Pizza", category: "pizza",
    tag: "POPULAR", price: 320,
    desc: "Loaded with fresh vegetables, cheese and delicious sauce.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 10, name: "Cheese Burst Pizza", category: "pizza",
    tag: "CHEESE LOVER", price: 350,
    desc: "Delicious pizza with a rich cheese-filled crust.",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 11, name: "Paneer Tikka Pizza", category: "pizza",
    tag: "CHEF SPECIAL", price: 330,
    desc: "Paneer tikka, capsicum, onion and melted cheese.",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 12, name: "Classic Veg Burger", category: "burger",
    tag: "BESTSELLER", price: 120,
    desc: "Crispy vegetable patty with lettuce and special sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 13, name: "Cheese Burger", category: "burger",
    tag: "CHEESY", price: 160,
    desc: "Vegetable patty topped with melted cheese.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 14, name: "Double Patty Burger", category: "burger",
    tag: "SPECIAL", price: 200,
    desc: "Two delicious vegetable patties with cheese.",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 15, name: "Paneer Burger", category: "burger",
    tag: "HOUSE SPECIAL", price: 180,
    desc: "Spiced paneer patty with fresh vegetables and sauce.",
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 16, name: "White Sauce Pasta", category: "pasta",
    tag: "CREAMY FAVOURITE", price: 180,
    desc: "Creamy white sauce pasta with herbs and vegetables.",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 17, name: "Red Sauce Pasta", category: "pasta",
    tag: "ITALIAN STYLE", price: 170,
    desc: "Pasta tossed in rich and tangy tomato sauce.",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 18, name: "Pink Sauce Pasta", category: "pasta",
    tag: "CHEF SPECIAL", price: 200,
    desc: "A tasty combination of creamy and tomato sauce.",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80",
    available: true
  },
  {
    id: 19, name: "Cheese Pasta", category: "pasta",
    tag: "CHEESE LOVER", price: 220,
    desc: "Creamy cheesy pasta with herbs and vegetables.",
    image: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=700&q=80",
    available: true
  }
];

// ================= SEED MENU =================

async function seedMenu() {
  const count = await Menu.countDocuments();

  if (count === 0) {
    await Menu.insertMany(starterMenu);
    console.log("Original menu added.");
  }

  await Menu.updateOne(
    { id: 4 },
    { $set: { category: "pizza" } }
  );

  const operations = additionalMenu.map(item => ({
    updateOne: {
      filter: { id: item.id },
      update: { $setOnInsert: item },
      upsert: true
    }
  }));

  await Menu.bulkWrite(operations);

  console.log("All 19 menu items checked.");
}

// ================= JWT =================

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session"
    });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }
  next();
}

// ================= HEALTH =================

app.get("/", (req, res) => {
  res.send("Foodie Cafe Backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Foodie Cafe API is working"
  });
});

// ================= REGISTER =================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8 || password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name, email and password of 8-72 characters"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (await User.findOne({ email: cleanEmail })) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: createToken(newUser),
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Could not create account"
    });
  }
});

// ================= LOGIN =================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() || !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: createToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// ================= PROFILE =================

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
});

// ================= MENU API =================

app.get("/api/menu", async (req, res) => {
  try {
    const items = await Menu.find({
      available: true
    }).sort({ id: 1 });

    res.json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    console.error("Menu error:", error);
    res.status(500).json({
      success: false,
      message: "Could not load menu"
    });
  }
});

// ================= CREATE ORDER WITH ADDRESS =================

app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, mobile, address, items } = req.body;

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof mobile !== "string" ||
      !/^[0-9]{10}$/.test(mobile) ||
      typeof address !== "string" ||
      address.trim().length < 10 ||
      address.trim().length > 500 ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name, 10-digit mobile number, full delivery address and items."
      });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const id = Number(item.id);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(id) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 50
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid item or quantity"
        });
      }

      const menuItem = await Menu.findOne({
        id,
        available: true
      });

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: "Menu item not available"
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
      address: address.trim(),
      items: orderItems,
      total,
      status: "Pending"
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Could not save order"
    });
  }
});

// ================= GET ALL ORDERS =================

app.get(
  "/api/orders",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });

      res.json({
        success: true,
        count: orders.length,
        data: orders
      });

    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({
        success: false,
        message: "Could not fetch orders"
      });
    }
  }
);

// ================= UPDATE ORDER STATUS =================

app.patch(
  "/api/orders/:id/status",
  authenticateToken,
  adminOnly,
  async (req, res) => {
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
          message: "Invalid order status"
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
          message: "Order not found"
        });
      }

      res.json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).json({
        success: false,
        message: "Could not update order status"
      });
    }
  }
);

// ================= START SERVER =================

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected Successfully");

    await seedMenu();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();
