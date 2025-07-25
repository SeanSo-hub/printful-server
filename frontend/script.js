document.addEventListener("DOMContentLoaded", async () => {
  const catalogContainer = document.getElementById("catalog");

  const res = await fetch("http://localhost:3000/api/catalog");
  const products = await res.json();

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <button data-id="${product.id}">Customize</button>
    `;
    catalogContainer.appendChild(card);
  });

  catalogContainer.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
      const productId = e.target.dataset.id;
      const session = await fetch(`http://localhost:3000/api/edm-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).then((res) => res.json());

      window.openEDM(session.nonce, productId);
    }
  });
});
