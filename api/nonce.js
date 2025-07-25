// /api/printful/nonce.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { external_product_id, external_customer_id } = req.body;

  try {
    const response = await axios.post(
      "https://api.printful.com/embedded-designer/nonces",
      {
        external_product_id,
        external_customer_id: external_customer_id || null,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const nonce = response.data?.result?.nonce;
    return res.status(200).json({ nonce });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch nonce" });
  }
}
