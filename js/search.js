// ==========================================================================
// FHE Traders — Header search with live results (client-side, no backend)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("search-toggle-btn");
  const panel = document.getElementById("search-panel");
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  if (!toggleBtn || !panel || !input || !results) return;

  const catLabel = {
    "solar-panels": "Solar Panels",
    "solar-stands": "Solar Stands",
    "inverters": "Inverters",
    "batteries": "Lithium Batteries",
    "vfd": "VFD Drives",
    "fans": "Fans",
    "lighting": "Lighting",
    "fittings": "Fittings",
    "wiring": "Wiring & Cables",
    "distribution": "Distribution & Breakers",
    "security": "Security Systems",
    "appliances": "Home Appliances",
  };

  const open = () => {
    panel.classList.add("active");
    toggleBtn.classList.add("active");
    setTimeout(() => input.focus(), 50);
  };
  const close = () => {
    panel.classList.remove("active");
    toggleBtn.classList.remove("active");
  };

  toggleBtn.addEventListener("click", () => {
    panel.classList.contains("active") ? close() : open();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
  document.addEventListener("click", (e) => {
    if (panel.classList.contains("active") && !panel.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
      close();
    }
  });

  const renderResults = (query) => {
    const list = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
    const q = query.trim().toLowerCase();
    if (!q) {
      results.innerHTML = '<div class="search-empty">Start typing to search our product catalog…</div>';
      return;
    }
    const matches = list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (catLabel[p.category] || "").toLowerCase().includes(q) ||
      (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
      (p.brands || []).some((b) => b.toLowerCase().includes(q)) ||
      (p.models || []).some((m) => m.toLowerCase().replace(/\s+/g, "").includes(q.replace(/\s+/g, "")))
    ).slice(0, 8);

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-empty">No products match "${escapeHtml(query)}". <a href="#" data-whatsapp data-msg="Hi FHE Traders, I'm looking for: ${escapeHtml(query)}">Ask us on WhatsApp</a> instead.</div>`;
      wireWhatsAppButtons();
      return;
    }

    results.innerHTML = matches.map((p) => `
      <a class="search-result-item" href="product.html?id=${encodeURIComponent(p.id)}">
        <span class="search-result-thumb cat-${p.category}">${p.image
          ? `<img src="${p.image}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:contain;background:#fff;padding:4px;" onerror="this.remove()">`
          : `<svg><use href="#${p.icon}"/></svg>`}</span>
        <span>
          <span class="search-result-name">${escapeHtml(p.name)}</span><br>
          <span class="search-result-cat">${catLabel[p.category] || p.category}</span>
        </span>
      </a>
    `).join("");
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  renderResults("");
  input.addEventListener("input", () => renderResults(input.value));
});
