const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let listings = [];

app.get("/", (req, res) => {
  res.send("Swap API is running");
});

app.get("/api/listings", (req, res) => {
  res.json(listings);
});

app.post("/api/listings", (req, res) => {
  const newListing = {
    id: Date.now(),
    title: req.body.title,
    price: req.body.price,
    location: req.body.location,
    category: req.body.category,
    description: req.body.description,
  };

  listings.unshift(newListing);

  res.status(201).json(newListing);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});