// api/printful/get-nonce.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // It's good practice to ensure these are set even if vercel.json is used,
  // in case the OPTIONS preflight somehow bypasses vercel.json's full handling
  // and reaches the function.
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://gue12v-0i.myshopify.com"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request: RETURN 200 OK immediately
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Now, check for the expected method
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const printfulApiKey = process.env.PRINTFUL_API_KEY;

    if (!printfulApiKey) {
      return res
        .status(500)
        .json({ message: "Printful API Key not configured." });
    }

    const response = await fetch(
      "https://api.printful.com/embedded-designer/nonces",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${printfulApiKey}`,
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Printful Nonce Error:", errorData);
      return res.status(response.status).json({
        message: "Failed to get nonce from Printful",
        details: errorData,
      });
    }

    const data = await response.json();
    res.status(200).json({ nonce: data.result.nonce });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
