import axios from "axios";

const allowedOrigin = "https://gue12v-0i.myshopify.com";

export default async function handler(req, res) {
  const requestOrigin = req.headers.origin;

  // Set CORS headers
  if (requestOrigin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
