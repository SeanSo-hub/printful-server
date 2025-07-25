// api/printful/nonce.js (or similar for your framework)
// For Express.js, this would be a route handler: router.post('/api/printful/nonce', async (req, res) => { ... });

import fetch from "node-fetch"; // If using Node.js without a fetch polyfill or in older versions

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const printfulApiKey = "DmzFX6WgYrQQzdnSGomt6JHBmYpir9chwVLdOeS3";
  const { externalProductId } = req.body; // If you pass externalProductId from frontend

  if (!printfulApiKey) {
    return res
      .status(500)
      .json({ message: "Printful API Key not configured." });
  }

  if (!externalProductId) {
    // externalProductId is required by Printful for nonce generation if creating a new template
    return res.status(400).json({ message: "externalProductId is required." });
  }

  try {
    const response = await fetch(
      "https://api.printful.com/embedded-designer/nonces",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${printfulApiKey}`, // Use your Printful API Key
        },
        body: JSON.stringify({
          external_product_id: externalProductId, // Pass the product ID from your system
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Printful API Error:", errorData);
      throw new Error(
        `Printful API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const nonce = data.result.nonce; // Extract the nonce from the Printful response

    if (!nonce) {
      throw new Error("Nonce not found in Printful API response.");
    }

    res.status(200).json({ nonce: nonce });
  } catch (error) {
    console.error("Error generating Printful nonce:", error);
    res.status(500).json({
      message: "Failed to generate Printful nonce.",
      error: error.message,
    });
  }
}
