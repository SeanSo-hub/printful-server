// /api/edm-token.js
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { variant_id } = req.body;
  if (!variant_id) return res.status(400).json({ error: "Missing variant_id" });

  const externalProductId = `custom-${variant_id}`;
  const apiKey = process.env.PRINTFUL_API_KEY;

  try {
    const response = await fetch(
      "https://api.printful.com/embedded-designer/nonces",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ external_product_id: externalProductId }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error("Printful error:", result);
      return res
        .status(500)
        .json({ error: result?.error || "Failed to get EDM token" });
    }

    return res.status(200).json({ token: result.result?.token });
  } catch (err) {
    console.error("EDM Token error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
