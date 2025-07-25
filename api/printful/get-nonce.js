// api/printful/get-nonce.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const printfulApiKey = DmzFX6WgYrQQzdnSGomt6JHBmYpir9chwVLdOeS3;

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

        body: JSON.stringify({
          external_product_id: "2",
        }),
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


