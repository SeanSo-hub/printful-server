// /api/edm-token.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { variant_id } = req.body;

  if (!variant_id) {
    return res.status(400).json({ error: "Missing variant_id" });
  }

  try {
    const response = await axios.post(
      "https://api.printful.com/design-token",
      {
        variant_ids: [variant_id],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const token = response.data?.result?.token;
    if (!token) {
      throw new Error("No token returned");
    }

    res.status(200).json({ token });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch design token" });
  }
}
