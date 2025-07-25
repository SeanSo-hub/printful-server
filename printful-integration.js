// assets/printful-integration.js

document.addEventListener("DOMContentLoaded", () => {
  const catalogContainer = document.getElementById(
    "printful-catalog-container"
  );
  const designerModal = document.getElementById("printful-designer-modal");
  const designerContainer = document.getElementById(
    "printful-designer-container"
  );
  const closeModalButton = document.querySelector(".modal .close-button");

  const VERCEl_BACKEND_URL = "https://printful-server-chi.vercel.app"; // !!! IMPORTANT: Replace with your actual Vercel deployment URL

  let designMakerInstance = null; // To store the EDM instance

  // --- Modal Control Functions ---
  function openModal() {
    if (designerModal) {
      designerModal.style.display = "block";
      document.body.style.overflow = "hidden"; // Prevent scrolling on body
    }
  }

  function closeModal() {
    if (designerModal) {
      designerModal.style.display = "none";
      document.body.style.overflow = ""; // Restore body scrolling
      // Destroy the EDM instance when closing the modal to free up resources
      if (designMakerInstance) {
        designMakerInstance.destroy();
        designMakerInstance = null; // Clear the instance
        // You might want to clear the content of the designerContainer if necessary
        designerContainer.innerHTML = "";
      }
    }
  }

  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal);
  }

  // Close modal if clicked outside content
  if (designerModal) {
    designerModal.addEventListener("click", (event) => {
      if (event.target === designerModal) {
        closeModal();
      }
    });
  }
  // --- End Modal Control Functions ---

  // --- Fetch and Render Catalog ---
  async function fetchAndRenderCatalog() {
    if (!catalogContainer) return; // Only run if the container exists

    try {
      catalogContainer.innerHTML = "<h2>Loading Printful Products...</h2>"; // Show loading message
      const response = await fetch(
        `https://printful-server-chi.vercel.app/api/printful/get-catalog`
      );

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${JSON.stringify(
            errorDetails
          )}`
        );
      }

      const data = await response.json();
      const products = data.products;

      if (products && products.length > 0) {
        catalogContainer.innerHTML = ""; // Clear loading message

        products.forEach((product) => {
          const productCard = document.createElement("div");
          productCard.className =
            "grid__item small--one-half medium-up--one-third printful-product-card"; // Shopify grid classes + custom class
          productCard.innerHTML = `
            <img src="${
              product.image_url ||
              "https://via.placeholder.com/200x200?text=No+Image"
            }" alt="${product.name}" />
            <h3>${product.name}</h3>
            <button class="customize-product-button" data-product-id="${
              product.id
            }">Customize</button>
          `;
          catalogContainer.appendChild(productCard);
        });

        // Add event listeners to the new buttons
        document
          .querySelectorAll(".customize-product-button")
          .forEach((button) => {
            button.addEventListener("click", (event) => {
              const printfulProductId = event.target.dataset.productId;
              if (printfulProductId) {
                launchEDM(parseInt(printfulProductId, 10)); // Convert to integer
              } else {
                alert("Could not get product ID for customization.");
              }
            });
          });
      } else {
        catalogContainer.innerHTML = "<h2>No Printful products found.</h2>";
      }
    } catch (error) {
      console.error("Error fetching or rendering catalog:", error);
      catalogContainer.innerHTML = `<h2>Failed to load products: ${error.message}</h2>`;
    }
  }

  // --- Launch EDM Function ---
  async function launchEDM(printfulProductId) {
    if (!designerContainer) {
      console.error("Designer container not found.");
      alert("Design maker container not available.");
      return;
    }

    // You might want to pass a unique ID for the design being created.
    // For simplicity, let's use a combination of Printful product ID and a timestamp.
    const externalProductId = `pf-${printfulProductId}-${Date.now()}`;

    try {
      // 1. Fetch nonce from your Vercel backend
      const response = await fetch(
        `https://printful-server-chi.vercel.app/api/printful/get-nonce`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ externalProductId: externalProductId }), // Pass external ID to backend if needed for nonce
        }
      );

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${JSON.stringify(
            errorDetails
          )}`
        );
      }

      const data = await response.json();
      const nonce = data.nonce;

      // 2. Initialize and Launch EDM
      if (typeof PFDesignMaker === "undefined") {
        console.error(
          "PFDesignMaker not loaded. Ensure embed.js is correctly included."
        );
        alert(
          "Design maker library not loaded. Please try refreshing the page."
        );
        return;
      }

      // If an instance already exists, destroy it before creating a new one
      if (designMakerInstance) {
        designMakerInstance.destroy();
        designMakerInstance = null;
        designerContainer.innerHTML = ""; // Clear content for new instance
      }

      openModal(); // Open the modal *before* initializing EDM to ensure container is visible

      designMakerInstance = new PFDesignMaker({
        elemId: "printful-designer-container", // ID of the container div inside the modal
        nonce: nonce,
        externalProductId: externalProductId, // Unique ID for your design
        initProduct: {
          productId: printfulProductId, // The Printful product ID from the catalog
        },
        // Optional callbacks
        onSave: (data) => {
          console.log("Design saved:", data);
          alert(
            "Design saved successfully! You can now add it to your cart or continue shopping."
          );
          closeModal(); // Close modal after save
          // TODO: Implement logic to handle the saved design:
          // - Store `data.templateId` and `data.variantIds` (if applicable)
          // - You'll need to create a Shopify cart item with these details,
          //   potentially as line item properties, to pass to Printful later.
          //   This is a complex step beyond EDM setup and usually involves
          //   custom backend fulfillment logic.
        },
        onCancel: () => {
          console.log("Design cancelled.");
          alert("Design process cancelled.");
          closeModal(); // Close modal on cancel
        },
        onError: (error) => {
          console.error("EDM Error:", error);
          alert(
            "An error occurred with the design maker. Please try again. Error: " +
              error.message
          );
          closeModal(); // Close modal on error
        },
      });
    } catch (error) {
      console.error("Error launching EDM:", error);
      alert("Could not launch design maker: " + error.message);
      closeModal(); // Ensure modal closes on error
    }
  }

  // --- Initialize when DOM is ready ---
  if (catalogContainer) {
    // Only fetch catalog if the container exists on the page
    fetchAndRenderCatalog();
  }
});
