// api/printful/get-catalog.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const printfulApiKey = "DmzFX6WgYrQQzdnSGomt6JHBmYpir9chwVLdOeS3";

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
    // Return only necessary product data to the frontend to minimize payload
    const products = data.result.map((product) => ({
      id: product.id,
      name: product.name,
      image_url: product.image_url, // Printful often provides a default image
      main_category_id: product.main_category_id,
      // Add other fields you might need, like available variants, etc.
    }));

    res.status(200).json({ products });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
