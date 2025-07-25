// api/printful/get-catalog.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // --- CORS HEADERS START ---
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://gue12v-0i.myshopify.com"
  ); // Allow your Shopify store
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow these HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow these headers

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // --- CORS HEADERS END ---

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const printfulApiKey = process.env.PRINTFUL_API_KEY || "DmzFX6WgYrQQzdnSGomt6JHBmYpir9chwVLdOeS3";

    if (!printfulApiKey) {
      return res
        .status(500)
        .json({ message: "Printful API Key not configured." });
    }

    const response = await fetch("https://api.printful.com/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${printfulApiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Printful Catalog Error:", errorData);
      return res.status(response.status).json({
        message: "Failed to get catalog from Printful",
        details: errorData,
      });
    }

    const data = await response.json();
    const products = data.result.map((product) => ({
      id: product.id,
      name: product.name,
      image_url: product.image_url,
      main_category_id: product.main_category_id,
    }));

    res.status(200).json({ products });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
