// api/catalog.js
import axios from "axios";

export default async function handler(req, res) {
  const PRINTFUL_API_KEY =
    process.env.PRINTFUL_API_KEY || "LgUs5oyWo1ZHklrk8TwD0uu2jbNO998dmn70bVig";

  try {
    const response = await axios.get("https://api.printful.com/products", {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });

    const products = response.data.result
      .filter((p) => p.variant_count > 0)
      .slice(0, 10);

    res.status(200).json(products);
  } catch (err) {
    console.error("Catalog fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch catalog" });
  }
}
