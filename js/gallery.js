(function () {
  "use strict";

  const ARTWORKS_URL = "data/artworks.json";
  const IMAGE_BASE   = "images/artworks/yoga/";

  let currentSeries = [];
  let seriesIndex   = -1;
  let imageIndex    = 0;
  let currentLang   = "en"; // "en" or "zh"
  let scrollObserver = null;
  let activeTag      = null; // null = show all

  // ---- i18n ----
  const I18N = {
    en: {
      title: "Yoga's Art Gallery",
      subtitle: "Every piece tells a story",
      rights: "All rights reserved.",
      copyright_notice: "All artworks on this site are original creations and protected by copyright law. Unauthorized reproduction, distribution, or use is strictly prohibited.",
      made_with: "Made with",
      empty: "No artworks yet — stay tuned!",
      all: "All",
      all: "All",
      chalkboard: "chalkboard",
      "oil painting": "oil painting",
      collage: "collage",
      "mixed media": "mixed media",
      craft: "craft",
      "3D sculpture": "3D sculpture",
      drawing: "drawing",
      clay: "clay"
    },
    zh: {
      title: "Yoga 的美术馆",
      subtitle: "每一幅都是一个故事",
      rights: "版权所有。",
      copyright_notice: "本网站所有作品均为原创，受版权法保护。未经授权，禁止复制、传播或使用。",
      made_with: "用心制作",
      empty: "还没有作品——敬请期待！",
      all: "全部",
      chalkboard: "黑板画",
      "oil painting": "油画",
      collage: "拼贴",
      "mixed media": "混合媒材",
      craft: "手工",
      "3D sculpture": "3D雕塑",
      drawing: "绘画",
      clay: "黏土"
    }
  };

  const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MONTHS_ZH = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

  function t(key) { return I18N[currentLang][key] || key; }
  function months() { return currentLang === "zh" ? MONTHS_ZH : MONTHS_EN; }

  // ---- DOM refs ----
  const gallery         = document.getElementById("gallery");
  const monthNav        = document.getElementById("month-nav");
  const lightbox        = document.getElementById("lightbox");
  const lightboxImg     = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const btnPrev         = lightbox.querySelector(".lightbox-prev");
  const btnNext         = lightbox.querySelector(".lightbox-next");
  const langToggle      = document.getElementById("lang-toggle");
  const themeToggle     = document.getElementById("theme-toggle");
  const tagFilter       = document.getElementById("tag-filter");

  // ---- Helpers ----
  function getFile(img)    { return typeof img === "string" ? img : img.file; }
  function imgSrc(img)     { return IMAGE_BASE + getFile(img); }

  function getCaption(img) {
    if (typeof img === "string") return "";
    if (currentLang === "zh" && img.caption_zh) return img.caption_zh;
    return img.caption || "";
  }

  function getTitle(series) {
    if (currentLang === "zh" && series.title_zh) return series.title_zh;
    return series.title;
  }

  function getDescription(series) {
    if (currentLang === "zh" && series.description_zh) return series.description_zh;
    return series.description || "";
  }

  function formatDate(dateStr) {
    var M = months();
    var parts = dateStr.split("-");
    var y = parts[0];
    var m = parts[1] ? parseInt(parts[1], 10) : null;
    var d = parts[2] ? parseInt(parts[2], 10) : null;
    if (currentLang === "zh") {
      if (m && d) return m + "月" + d + "日";
      if (m)      return m + "月";
      return y + "年";
    }
    if (m && d) return M[m - 1] + " " + d;
    if (m)      return M[m - 1];
    return y;
  }

  function monthKey(dateStr) {
    var parts = dateStr.split("-");
    if (parts.length >= 2) return parts[0] + "-" + parts[1].padStart(2, "0");
    return parts[0] + "-01";
  }

  function parseMonthKey(key) {
    var parts = key.split("-");
    var mi = parseInt(parts[1], 10) - 1;
    return { month: months()[mi], year: parts[0] };
  }

  // ---- Lazy loading ----
  var lazyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        lazyObserver.unobserve(img);
      }
    });
  }, { rootMargin: "200px 0px" });

  function createLazyImg(src, alt) {
    var img = document.createElement("img");
    img.alt = alt;
    img.dataset.src = src;
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    lazyObserver.observe(img);
    return img;
  }

  // ---- Theme ----
  function initTheme() {
    var saved = localStorage.getItem("gallery-theme");
    if (saved === "dark") {
      document.body.classList.add("dark");
      themeToggle.textContent = "☀️";
    } else if (saved === "light") {
      document.body.classList.remove("dark");
      themeToggle.textContent = "🌙";
    } else {
      // Auto: 18:00–06:00 is dark
      var hour = new Date().getHours();
      if (hour >= 18 || hour < 6) {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️";
      } else {
        themeToggle.textContent = "🌙";
      }
    }

    themeToggle.addEventListener("click", function () {
      var isDark = document.body.classList.toggle("dark");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("gallery-theme", isDark ? "dark" : "light");
    });
  }

  // ---- Language ----
  function initLang() {
    var saved = localStorage.getItem("gallery-lang");
    if (saved === "zh") {
      currentLang = "zh";
      langToggle.textContent = "EN";
      langToggle.title = "Switch to English";
    } else {
      currentLang = "en";
      langToggle.textContent = "中";
      langToggle.title = "切换中文";
    }

    langToggle.addEventListener("click", function () {
      currentLang = currentLang === "en" ? "zh" : "en";
      localStorage.setItem("gallery-lang", currentLang);
      langToggle.textContent = currentLang === "en" ? "中" : "EN";
      langToggle.title = currentLang === "en" ? "切换中文" : "Switch to English";
      updateI18nStrings();
      renderGallery();
      // Update lightbox if open
      if (!lightbox.hidden) updateLightbox();
    });
  }

  function updateI18nStrings() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
  }

  // ---- Init ----
  async function init() {
    initTheme();
    initLang();

    try {
      var res = await fetch(ARTWORKS_URL);
      currentSeries = await res.json();
    } catch (err) {
      gallery.innerHTML = '<p class="empty-state">' + t("empty") + '</p>';
      return;
    }

    currentSeries.sort(function (a, b) { return b.date.localeCompare(a.date); });
    updateI18nStrings();
    renderGallery();
    bindLightbox();
    bindProtection();
  }

  // ---- Tag CSS class helper ----
  function tagClass(tag) {
    return "tag-" + tag.toLowerCase().replace(/\s+/g, "-");
  }

  // ---- Render ----
  function renderGallery() {
    gallery.innerHTML = "";

    if (currentSeries.length === 0) {
      gallery.innerHTML = '<p class="empty-state">' + t("empty") + '</p>';
      return;
    }

    // Group by month
    var groups = new Map();
    currentSeries.forEach(function (series, idx) {
      var key = monthKey(series.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ series: series, idx: idx });
    });

    var fragment = document.createDocumentFragment();

    groups.forEach(function (items, key) {
      var parsed = parseMonthKey(key);

      var group = document.createElement("section");
      group.className = "timeline-group";
      group.id = "month-" + key;

      var label = document.createElement("div");
      label.className = "timeline-label";
      label.innerHTML =
        '<div class="timeline-month">' + parsed.month + '</div>' +
        '<div class="timeline-year">' + parsed.year + '</div>';

      var cardsWrap = document.createElement("div");
      cardsWrap.className = "timeline-cards";

      items.forEach(function (item) {
        var series = item.series;
        var idx = item.idx;

        var card = document.createElement("div");
        card.className = "card";
        card.dataset.series = idx;
        if (series.tags && series.tags.length > 0) {
          card.dataset.tags = series.tags.join(",");
        }

        var images = series.images;

        if (images.length === 1) {
          var img = createLazyImg(imgSrc(images[0]), getTitle(series));
          img.dataset.imgIdx = "0";
          card.appendChild(img);
        } else {
          var grid = document.createElement("div");
          grid.className = "card-grid";
          var count = Math.min(images.length, 4);
          grid.classList.add("grid-" + count);

          for (var i = 0; i < count; i++) {
            var img = createLazyImg(imgSrc(images[i]), getTitle(series) + " " + (i + 1));
            img.dataset.imgIdx = String(i);
            grid.appendChild(img);
          }

          card.appendChild(grid);
        }

        var info = document.createElement("div");
        info.className = "card-info";

        var title = document.createElement("div");
        title.className = "card-title";
        title.textContent = getTitle(series);

        var meta = document.createElement("div");
        meta.className = "card-meta";

        var dateSpan = document.createElement("span");
        dateSpan.className = "card-date";
        dateSpan.textContent = formatDate(series.date);

        meta.appendChild(dateSpan);

        var desc = getDescription(series);
        if (desc) {
          var descSpan = document.createElement("span");
          descSpan.className = "card-desc";
          descSpan.textContent = desc;
          meta.appendChild(descSpan);
        }

        info.appendChild(title);

        // Render tags
        if (series.tags && series.tags.length > 0) {
          var tagsWrap = document.createElement("div");
          tagsWrap.className = "card-tags";
          series.tags.forEach(function (tg) {
            var span = document.createElement("span");
            span.className = "tag " + tagClass(tg);
            span.textContent = t(tg);
            tagsWrap.appendChild(span);
          });
          info.appendChild(tagsWrap);
        }

        info.appendChild(meta);
        card.appendChild(info);
        cardsWrap.appendChild(card);
      });

      group.appendChild(label);
      group.appendChild(cardsWrap);
      fragment.appendChild(group);
    });

    gallery.appendChild(fragment);

    // Build month navigation
    buildMonthNav(groups);

    // Build tag filter
    buildTagFilter();
  }

  // ---- Tag Filter ----
  // Map of tag colors (must match CSS .tag-* classes)
  var TAG_COLORS = {
    "chalkboard": "#4a5568",
    "oil painting": "#c53030",
    "collage": "#2b6cb0",
    "mixed media": "#c05621",
    "craft": "#2f855a",
    "3D sculpture": "#6b46c1",
    "drawing": "#4c51bf",
    "clay": "#975a16"
  };

  function buildTagFilter() {
    tagFilter.innerHTML = "";

    // Count tags
    var tagCounts = {};
    var total = currentSeries.length;
    currentSeries.forEach(function (series) {
      if (series.tags) {
        series.tags.forEach(function (tg) {
          tagCounts[tg] = (tagCounts[tg] || 0) + 1;
        });
      }
    });

    var tagKeys = Object.keys(tagCounts);
    if (tagKeys.length === 0) return;

    // Sort by count descending
    tagKeys.sort(function (a, b) { return tagCounts[b] - tagCounts[a]; });

    // "All" button
    var allBtn = document.createElement("button");
    allBtn.className = "tag-filter-btn-all" + (activeTag === null ? " active" : "");
    allBtn.textContent = t("all") + " " + total;
    allBtn.addEventListener("click", function () {
      activeTag = null;
      applyTagFilter();
      updateFilterButtons();
    });
    tagFilter.appendChild(allBtn);

    // Per-tag buttons
    tagKeys.forEach(function (tg) {
      var btn = document.createElement("button");
      btn.className = "tag-filter-btn" + (activeTag === tg ? " active" : "");
      btn.style.background = TAG_COLORS[tg] || "#7c5cbf";

      var labelSpan = document.createElement("span");
      labelSpan.textContent = t(tg);

      var countSpan = document.createElement("span");
      countSpan.className = "tag-count";
      countSpan.textContent = tagCounts[tg];

      btn.appendChild(labelSpan);
      btn.appendChild(countSpan);
      btn.dataset.tag = tg;

      btn.addEventListener("click", function () {
        activeTag = activeTag === tg ? null : tg;
        applyTagFilter();
        updateFilterButtons();
      });

      tagFilter.appendChild(btn);
    });
  }

  function updateFilterButtons() {
    var allBtn = tagFilter.querySelector(".tag-filter-btn-all");
    if (allBtn) {
      allBtn.classList.toggle("active", activeTag === null);
    }
    tagFilter.querySelectorAll(".tag-filter-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.tag === activeTag);
    });
  }

  function applyTagFilter() {
    // Show/hide cards
    var cards = gallery.querySelectorAll(".card");
    cards.forEach(function (card) {
      if (activeTag === null) {
        card.classList.remove("tag-hidden");
      } else {
        var tags = (card.dataset.tags || "").split(",");
        card.classList.toggle("tag-hidden", tags.indexOf(activeTag) === -1);
      }
    });

    // Show/hide timeline groups if all their cards are hidden
    var groups = gallery.querySelectorAll(".timeline-group");
    groups.forEach(function (group) {
      var visibleCards = group.querySelectorAll(".card:not(.tag-hidden)");
      group.classList.toggle("tag-hidden", visibleCards.length === 0);
    });

    // Update month nav: hide pills for hidden groups
    var pills = monthNav.querySelectorAll(".month-nav-pill");
    pills.forEach(function (pill) {
      var key = pill.dataset.month;
      var group = document.getElementById("month-" + key);
      if (group) {
        pill.style.display = group.classList.contains("tag-hidden") ? "none" : "";
      }
    });
  }

  // ---- Month Navigation ----
  function buildMonthNav(groups) {
    monthNav.innerHTML = "";
    var keys = Array.from(groups.keys());

    keys.forEach(function (key) {
      var parsed = parseMonthKey(key);
      var pill = document.createElement("button");
      pill.className = "month-nav-pill";
      pill.textContent = parsed.month + " " + parsed.year;
      pill.dataset.month = key;
      pill.addEventListener("click", function () {
        var target = document.getElementById("month-" + key);
        if (target) {
          var navHeight = monthNav.offsetHeight;
          var targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
          window.scrollTo({ top: targetTop, behavior: "smooth" });
        }
      });
      monthNav.appendChild(pill);
    });

    setupScrollHighlight(keys);
  }

  function setupScrollHighlight(keys) {
    // Disconnect previous observer if any
    if (scrollObserver) scrollObserver.disconnect();

    scrollObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          var key = id.replace("month-", "");
          var pills = monthNav.querySelectorAll(".month-nav-pill");
          pills.forEach(function (p) {
            p.classList.toggle("active", p.dataset.month === key);
          });
          var activePill = monthNav.querySelector(".month-nav-pill.active");
          if (activePill) {
            activePill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          }
        }
      });
    }, {
      rootMargin: "-60px 0px -70% 0px",
      threshold: 0
    });

    keys.forEach(function (key) {
      var el = document.getElementById("month-" + key);
      if (el) scrollObserver.observe(el);
    });
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
    setTimeout(function () { lightbox.hidden = true; }, 300);
  }

  function updateLightbox() {
    var series = currentSeries[seriesIndex];
    var images = series.images;
    var current = images[imageIndex];

    lightboxImg.src = imgSrc(current);
    lightboxImg.alt = getTitle(series);

    var caption = getCaption(current) || getDescription(series);
    lightboxCaption.textContent = caption;

    if (images.length > 1) {
      lightboxCounter.textContent = (imageIndex + 1) + " / " + images.length;
      lightboxCounter.style.display = "";
    } else {
      lightboxCounter.textContent = "";
      lightboxCounter.style.display = "none";
    }

    var multi = images.length > 1;
    btnPrev.classList.toggle("is-hidden", !multi);
    btnNext.classList.toggle("is-hidden", !multi);
  }

  function navigate(dir) {
    var images = currentSeries[seriesIndex].images;
    imageIndex = (imageIndex + dir + images.length) % images.length;
    updateLightbox();
  }

  function bindLightbox() {
    gallery.addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      if (!card) return;
      var sIdx = Number(card.dataset.series);
      var clickedImg = e.target.closest("img[data-img-idx]");
      var imgIdx = clickedImg ? Number(clickedImg.dataset.imgIdx) : 0;
      openLightbox(sIdx, imgIdx);
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    btnPrev.addEventListener("click", function (e) { e.stopPropagation(); navigate(-1); });
    btnNext.addEventListener("click", function (e) { e.stopPropagation(); navigate(1); });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowLeft")  navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    });

    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartTime = 0;

    lightbox.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      touchStartTime = Date.now();
    }, { passive: true });

    lightbox.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].screenX - touchStartX;
      var dy = e.changedTouches[0].screenY - touchStartY;
      var dt = Date.now() - touchStartTime;

      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 3 && dt < 500) {
        if (dx < 0) navigate(1);
        else        navigate(-1);
      }
    }, { passive: true });
  }

  // ---- Image protection ----
  function bindProtection() {
    document.addEventListener("contextmenu", function (e) {
      if (e.target.tagName === "IMG" || e.target.closest(".card") || e.target.closest(".lightbox")) {
        e.preventDefault();
      }
    });

    document.addEventListener("dragstart", function (e) {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
