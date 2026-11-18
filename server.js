
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://foodie-cafe-frontend.vercel.app",
    "http://localhost:3000"
  ]
}));

app.use(express.json());

// Menu database model
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

// Original Foodie Cafe menu
const starterMenu = [
  { id: 1, name: "Velvet Cappuccino", category: "coffee", tag: "BESTSELLER", price: 160, desc: "Rich espresso, silky milk and a soft cocoa finish.", image: "https://images.unsplash.com/photo-1534778101976-628a944c3a69?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Iced Caramel Latte", category: "coffee", tag: "CHILLED FAVOURITE", price: 190, desc: "Smooth espresso over ice with buttery caramel.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Cafe Club Sandwich", category: "food", tag: "FRESH PICK", price: 220, desc: "Toasted layers, crisp veggies and our house sauce.", image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Margherita Pizza", category: "food", tag: "CLASSIC", price: 280, desc: "Golden crust, fresh basil and gooey mozzarella.", image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Chocolate Brownie", category: "dessert", tag: "SWEET TOOTH", price: 150, desc: "Fudgy centre, crisp edges and pure chocolate joy.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Strawberry Cheesecake", category: "dessert", tag: "HOUSE FAVOURITE", price: 210, desc: "Creamy cheesecake with a bright berry topping.", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Mango Smoothie", category: "drinks", tag: "FRUITY & FRESH", price: 170, desc: "A sunny blend of mango, yoghurt and a little love.", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Classic Cold Coffee", category: "drinks", tag: "COOL DOWN", price: 180, desc: "Creamy, chilled coffee blended until perfectly frothy.", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80" }
];

// Get menu items from MongoDB
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

// Home route
app.get("/", (req, res) => {
  res.send("Foodie Cafe Backend is running!");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Foodie Cafe API is working"
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
