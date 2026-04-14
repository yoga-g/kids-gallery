(function () {
  "use strict";

  const ARTWORKS_URL = "data/artworks.json";
  const IMAGE_DIR   = "images/artworks/";

  let artworks = [];
  let currentIndex = -1;

  // ---- DOM refs ----
  const gallery        = document.getElementById("gallery");
  const lightbox       = document.getElementById("lightbox");
  const lightboxImg    = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");

  // ---- Load & Render ----
  async function init() {
    try {
      const res = await fetch(ARTWORKS_URL);
      artworks = await res.json();
    } catch (err) {
      gallery.innerHTML = "<p style='text-align:center;color:#999;'>暂无作品，敬请期待！</p>";
      console.error("Failed to load artworks:", err);
      return;
    }

    // Sort by date descending (newest first)
    artworks.sort((a, b) => b.date.localeCompare(a.date));

    renderGallery();
    bindLightbox();
  }

  function renderGallery() {
    const fragment = document.createDocumentFragment();

    artworks.forEach((art, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.index = index;

      const img = document.createElement("img");
      img.alt = art.title;
      img.loading = "lazy";                       // native lazy loading
      img.src = IMAGE_DIR + art.file;

      const info = document.createElement("div");
      info.className = "card-info";

      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = art.title;

      const meta = document.createElement("div");
      meta.className = "card-meta";

      const dateSpan = document.createElement("span");
      dateSpan.textContent = art.date;

      const descSpan = document.createElement("span");
      descSpan.textContent = art.description || "";

      meta.appendChild(dateSpan);
      meta.appendChild(descSpan);
      info.appendChild(title);
      info.appendChild(meta);
      card.appendChild(img);
      card.appendChild(info);
      fragment.appendChild(card);
    });

    gallery.appendChild(fragment);
  }

  // ---- Lightbox ----
  function openLightbox(index) {
    currentIndex = index;
    updateLightboxContent();
    lightbox.hidden = false;
    // trigger reflow for transition
    void lightbox.offsetHeight;
    lightbox.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-visible");
    document.body.style.overflow = "";
    setTimeout(() => { lightbox.hidden = true; }, 300);
  }

  function updateLightboxContent() {
    const art = artworks[currentIndex];
    lightboxImg.src = IMAGE_DIR + art.file;
    lightboxImg.alt = art.title;
    lightboxCaption.textContent = `${art.title}  ·  ${art.date}${art.description ? "  ·  " + art.description : ""}`;
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + artworks.length) % artworks.length;
    updateLightboxContent();
  }

  function bindLightbox() {
    // Click card to open
    gallery.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      openLightbox(Number(card.dataset.index));
    });

    // Close button
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);

    // Prev / Next
    lightbox.querySelector(".lightbox-prev").addEventListener("click", (e) => {
      e.stopPropagation();
      navigate(-1);
    });
    lightbox.querySelector(".lightbox-next").addEventListener("click", (e) => {
      e.stopPropagation();
      navigate(1);
    });

    // Click backdrop to close
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape")      closeLightbox();
      if (e.key === "ArrowLeft")   navigate(-1);
      if (e.key === "ArrowRight")  navigate(1);
    });
  }

  // ---- Start ----
  document.addEventListener("DOMContentLoaded", init);
})();
