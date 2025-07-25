export default async function handler(req, res) {
  const allowedOrigin = "https://gue12v-0i.myshopify.com";

  // ✅ Always set CORS headers
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  // ✅ Handle preflight requests properly
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // CORS preflight pass
  }

  // ✅ Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { variant_id } = req.body;

  if (!variant_id) {
    return res.status(400).json({ error: "Missing variant_id" });
  }

  try {
    const printfulRes = await fetch(
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

    const data = await printfulRes.json();

    if (!printfulRes.ok) {
      console.error("Printful Error:", data);
      return res
        .status(printfulRes.status)
        .json({ error: data.error || "Token fetch failed" });
    }

    return res.status(200).json({ token: data.result.token });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
