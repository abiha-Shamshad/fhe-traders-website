// ==========================================================================
// FHE Traders — Site behaviour
// ==========================================================================

// Width at which the nav becomes the drawer. Must match the media query in
// css/style.css that moves .main-nav to its collapsed layout.
const NAV_DRAWER_WIDTH = 1140;

document.addEventListener("DOMContentLoaded", () => {
  wireWhatsAppButtons();
  wireNavToggle();
  wireNavDropdown();
  wireProductFilter();
  wireLightbox();
  wireContactForm();
  wireSideToolbar();
  markActiveNav();
  wireYear();
});

/** The business WhatsApp line. js/config.js is loaded on every page. */
function whatsAppNumber() {
  return (window.SITE_CONFIG && window.SITE_CONFIG.WHATSAPP_NUMBER) || "";
}

/** Build every WhatsApp link from SITE_CONFIG + each element's data-msg. */
function wireWhatsAppButtons() {
  const number = whatsAppNumber();
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    const msg = el.getAttribute("data-msg") || "Hi FHE Traders, I'd like to know more.";
    el.setAttribute("href", `https://wa.me/${number}?text=${encodeURIComponent(msg)}`);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
}

/** Mobile hamburger menu toggle. */
function wireNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    nav.classList.toggle("active");
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      // The categories chevron expands a submenu in place — closing the whole
      // menu on that tap would shut it before anything could be read.
      if (e.target.closest(".chev-btn")) return;
      toggle.classList.remove("active");
      nav.classList.remove("active");
    });
  });
}

/** Highlight the current page in the main nav. */
function markActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path) link.classList.add("active");
  });
}

/** Categories mega-menu: hover works via CSS; on touch the chevron expands it. */
function wireNavDropdown() {
  const dropdown = document.getElementById("categories-dropdown");
  if (!dropdown) return;
  const trigger = dropdown.querySelector("a");
  const isDrawerLayout = () =>
    window.matchMedia("(hover: none)").matches ||
    window.innerWidth <= NAV_DRAWER_WIDTH;

  trigger.addEventListener("click", (e) => {
    if (!isDrawerLayout()) return;
    // Only the chevron toggles. Tapping the "Products" label itself follows the
    // link to the products page — swallowing that tap left phone users with a
    // menu item that never went anywhere.
    if (e.target.closest(".chev-btn")) {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle("open");
    }
  });
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove("open");
  });
}

/** Floating scroll-to-top + share buttons. */
function wireSideToolbar() {
  const toolbar = document.querySelector(".side-toolbar");
  if (!toolbar) return;
  const topBtn = toolbar.querySelector("[data-scroll-top]");
  const shareBtn = toolbar.querySelector("[data-share]");

  if (topBtn) {
    window.addEventListener("scroll", () => {
      topBtn.classList.toggle("visible", window.scrollY > 500);
    });
    topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  if (shareBtn) {
    shareBtn.classList.add("visible");
    shareBtn.addEventListener("click", () => sharePage());
  }
}

/** Share the current page via the Web Share API, falling back to copying the link. */
function sharePage(title, text) {
  const shareData = {
    title: title || document.title,
    text: text || "Check this out from FHE Traders",
    url: window.location.href,
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareData.url).then(() => {
      alert("Link copied to clipboard!");
    });
  } else {
    window.prompt("Copy this link:", shareData.url);
  }
}

/** Recently-viewed products (client-side, localStorage). */
const RECENTLY_VIEWED_KEY = "fhe_recently_viewed";
function addRecentlyViewed(id) {
  try {
    let ids = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
    ids = ids.filter((x) => x !== id);
    ids.unshift(id);
    ids = ids.slice(0, 8);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
  } catch (e) {
    /* localStorage unavailable */
  }
}
function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
  } catch (e) {
    return [];
  }
}

/** Products page category filter. */
function wireProductFilter() {
  const filterBar = document.querySelector(".filter-bar");
  if (!filterBar) return;
  const buttons = filterBar.querySelectorAll(".filter-btn");

  const applyFilter = (category) => {
    buttons.forEach((b) => b.classList.toggle("active", b.getAttribute("data-filter") === category));
    // Queried live, not cached: the products grid re-renders itself when the
    // sort order changes, which would leave a cached NodeList pointing at
    // detached cards and silently break filtering afterwards.
    document.querySelectorAll("[data-category]").forEach((card) => {
      const show = category === "all" || card.getAttribute("data-category") === category;
      card.style.display = show ? "" : "none";
    });
    // products.html registers this so the "Showing N in ..." line stays in step.
    if (typeof window.onProductFilterChange === "function") window.onProductFilterChange(category);
  };

  // Exposed so the catalog can re-apply the active filter after it re-renders.
  window.applyProductFilter = applyFilter;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.getAttribute("data-filter")));
  });

  // Deep-link support: category chips elsewhere link to products.html#<category>
  const hash = window.location.hash.replace("#", "");
  if (hash && Array.from(buttons).some((b) => b.getAttribute("data-filter") === hash)) {
    applyFilter(hash);
    setTimeout(() => filterBar.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  }
}

/** Simple gallery lightbox (icon/caption based placeholder content). */
function wireLightbox() {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;
  const title = lightbox.querySelector("[data-lightbox-title]");
  const desc = lightbox.querySelector("[data-lightbox-desc]");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (title) title.textContent = item.getAttribute("data-title") || "";
      if (desc) desc.textContent = item.getAttribute("data-desc") || "";
      lightbox.classList.add("active");
    });
  });

  const close = () => lightbox.classList.remove("active");
  if (closeBtn) closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/** Contact form -> opens WhatsApp with the message pre-filled (no backend needed). */
function wireContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const number = whatsAppNumber();
    const name = form.querySelector("#name")?.value.trim() || "";
    const phone = form.querySelector("#phone")?.value.trim() || "";
    const service = form.querySelector("#service")?.value || "";
    const message = form.querySelector("#message")?.value.trim() || "";

    const lines = [
      `Hi FHE Traders, I'd like to get in touch.`,
      name && `Name: ${name}`,
      phone && `Phone: ${phone}`,
      service && `Interested in: ${service}`,
      message && `Message: ${message}`,
    ].filter(Boolean);

    const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  });
}

function wireYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}
