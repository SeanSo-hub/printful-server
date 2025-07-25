export default async function handler(req, res) {
  const allowedOrigin = "https://gue12v-0i.myshopify.com";

  // ✅ Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  // ✅ Handle preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Only allow POST after preflight
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { variant_id } = req.body;

  if (!variant_id) {
    return res.status(400).json({ error: "Missing variant_id" });
  }

  try {
    const response = await fetch(
      "https://api.printful.com/design-maker/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        },
        body: JSON.stringify({ variant_id }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Printful error:", data);
      return res
        .status(response.status)
        .json({ error: data.error || "Token fetch failed" });
    }

    return res.status(200).json({ token: data.result.token });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
