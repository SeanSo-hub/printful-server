// backend/server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

// STEP 1 – Retrieve Product Catalog
app.get("/api/catalog", async (req, res) => {
  try {
    const response = await axios.get("https://api.printful.com/products", {
      headers: {
        Authorization: `Bearer ${
          PRINTFUL_API_KEY || "LgUs5oyWo1ZHklrk8TwD0uu2jbNO998dmn70bVig"
        }`,
      },
    });

    const products = response.data.result
      .filter((p) => p.variant_count > 0)
      .slice(0, 10);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch catalog" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
