// ==========================================================================
// FHE Traders — Client-side wishlist ("Saved Items")
// No account/login needed: stored only in this browser via localStorage.
// ==========================================================================

const WISHLIST_KEY = "fhe_wishlist";

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveWishlist(ids) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  } catch (e) {
    /* localStorage unavailable — wishlist simply won't persist */
  }
}

function isInWishlist(id) {
  return getWishlist().includes(id);
}

function toggleWishlist(id) {
  const ids = getWishlist();
  const idx = ids.indexOf(id);
  if (idx === -1) {
    ids.push(id);
  } else {
    ids.splice(idx, 1);
  }
  saveWishlist(ids);
  updateWishlistBadge();
  return ids.includes(id);
}

function updateWishlistBadge() {
  const badge = document.getElementById("wishlist-count");
  if (!badge) return;
  const count = getWishlist().length;
  badge.textContent = count;
  badge.hidden = count === 0;
}

document.addEventListener("DOMContentLoaded", updateWishlistBadge);
