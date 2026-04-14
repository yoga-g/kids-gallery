(function () {
  "use strict";

  const ARTWORKS_URL = "data/artworks.json";
  const IMAGE_BASE   = "images/artworks/";

  let allData = {};          // { yoga: [...], siyu: [...] }
  let currentTab = "yoga";
  let currentSeries = [];    // array of series for the active tab
  let seriesIndex = -1;      // which series is open in lightbox
  let imageIndex  = 0;       // which image within that series

  // ---- DOM refs ----
  const gallery         = document.getElementById("gallery");
  const lightbox        = document.getElementById("lightbox");
  const lightboxImg     = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const btnPrev         = lightbox.querySelector(".lightbox-prev");
  const btnNext         = lightbox.querySelector(".lightbox-next");

  // ---- Init ----
  async function init() {
    try {
      const res = await fetch(ARTWORKS_URL);
      allData = await res.json();
    } catch (err) {
      gallery.innerHTML = '<p class="empty-state">No artworks yet — stay tuned!</p>';
      console.error("Failed to load artworks:", err);
      return;
    }
    bindTabs();
    bindLightbox();
    switchTab("yoga");
  }

  // ---- Tabs ----
  function bindTabs() {
    document.querySelectorAll(".tab").forEach(btn => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    currentSeries = (allData[tab] || []).slice();
    currentSeries.sort((a, b) => b.date.localeCompare(a.date));
    renderGallery();
  }

  // ---- Render ----
  function renderGallery() {
    gallery.innerHTML = "";

    if (currentSeries.length === 0) {
      gallery.innerHTML = '<p class="empty-state">No artworks yet — stay tuned!</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    currentSeries.forEach((series, idx) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.series = idx;

      // Use the first image as cover
      const img = document.createElement("img");
      img.alt = series.title;
      img.loading = "lazy";
      img.src = IMAGE_BASE + currentTab + "/" + series.images[0];

      card.appendChild(img);

      // Series badge (e.g. "4 pics")
      if (series.images.length > 1) {
        const badge = document.createElement("span");
        badge.className = "card-badge";
        badge.textContent = series.images.length + " pics";
        card.appendChild(badge);
      }

      const info = document.createElement("div");
      info.className = "card-info";

      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = series.title;

      const meta = document.createElement("div");
      meta.className = "card-meta";

      const dateSpan = document.createElement("span");
      dateSpan.textContent = series.date;

      const descSpan = document.createElement("span");
      descSpan.textContent = series.description || "";

      meta.appendChild(dateSpan);
      meta.appendChild(descSpan);
      info.appendChild(title);
      info.appendChild(meta);
      card.appendChild(info);
      fragment.appendChild(card);
    });

    gallery.appendChild(fragment);
  }

  // ---- Lightbox ----
  function openLightbox(sIdx, imgIdx) {
    seriesIndex = sIdx;
    imageIndex  = imgIdx || 0;
    updateLightbox();
    lightbox.hidden = false;
    void lightbox.offsetHeight;
    lightbox.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-visible");
    document.body.style.overflow = "";
    setTimeout(() => { lightbox.hidden = true; }, 300);
  }

  function updateLightbox() {
    const series = currentSeries[seriesIndex];
    const images = series.images;

    lightboxImg.src = IMAGE_BASE + currentTab + "/" + images[imageIndex];
    lightboxImg.alt = series.title;

    lightboxCaption.textContent = series.title +
      (series.description ? "  ·  " + series.description : "");

    // Counter (e.g. "2 / 4")
    if (images.length > 1) {
      lightboxCounter.textContent = (imageIndex + 1) + " / " + images.length;
      lightboxCounter.style.display = "";
    } else {
      lightboxCounter.textContent = "";
      lightboxCounter.style.display = "none";
    }

    // Show/hide arrows
    const multi = images.length > 1;
    btnPrev.classList.toggle("is-hidden", !multi);
    btnNext.classList.toggle("is-hidden", !multi);
  }

  function navigate(dir) {
    const images = currentSeries[seriesIndex].images;
    imageIndex = (imageIndex + dir + images.length) % images.length;
    updateLightbox();
  }

  function bindLightbox() {
    // Click card to open
    gallery.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      openLightbox(Number(card.dataset.series));
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);

    btnPrev.addEventListener("click", (e) => { e.stopPropagation(); navigate(-1); });
    btnNext.addEventListener("click", (e) => { e.stopPropagation(); navigate(1);  });

    // Click backdrop to close
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowLeft")  navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    });
  }

  // ---- Start ----
  document.addEventListener("DOMContentLoaded", init);
})();
