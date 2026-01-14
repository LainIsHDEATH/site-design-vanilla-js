"use strict";

/**
 * Дані (локально).
 * У реальному проєкті це прийшло б з API.
 */
const PRODUCTS = [
  { id: 1, name: "Механічна клавіатура K3", category: "Клавіатури", price: 2899, rating: 4.7, inStock: true },
  { id: 2, name: "Навушники EchoPods", category: "Аудіо", price: 1599, rating: 4.4, inStock: true },
  { id: 3, name: "Миша ProClick X", category: "Миші", price: 999, rating: 4.2, inStock: false },
  { id: 4, name: "Монітор 27\" QHD", category: "Монітори", price: 7499, rating: 4.8, inStock: true },
  { id: 5, name: "Павербанк 20 000 mAh", category: "Аксесуари", price: 1299, rating: 4.1, inStock: true },
  { id: 6, name: "Колонка MiniBoom", category: "Аудіо", price: 2199, rating: 4.5, inStock: true },
  { id: 7, name: "Килимок SpeedPad", category: "Аксесуари", price: 399, rating: 4.0, inStock: true },
  { id: 8, name: "Вебкамера 1080p", category: "Аксесуари", price: 1399, rating: 4.3, inStock: false },
  { id: 9, name: "Ігрова миша Lite", category: "Миші", price: 799, rating: 4.6, inStock: true },
  { id: 10, name: "Клавіатура мембранна M1", category: "Клавіатури", price: 699, rating: 3.9, inStock: true },
  { id: 11, name: "Монітор 24\" FHD", category: "Монітори", price: 4999, rating: 4.2, inStock: true },
  { id: 12, name: "Навушники StudioOver", category: "Аудіо", price: 3499, rating: 4.9, inStock: true },
];

const els = {
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  categoryChecks: document.getElementById("categoryChecks"),
  inStockOnly: document.getElementById("inStockOnly"),
  minPrice: document.getElementById("minPrice"),
  maxPrice: document.getElementById("maxPrice"),
  sortSelect: document.getElementById("sortSelect"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),

  productsGrid: document.getElementById("productsGrid"),
  resultsCount: document.getElementById("resultsCount"),
  emptyState: document.getElementById("emptyState"),

  openCartBtn: document.getElementById("openCartBtn"),
  closeCartBtn: document.getElementById("closeCartBtn"),
  cartModal: document.getElementById("cartModal"),
  cartBackdrop: document.getElementById("cartBackdrop"),
  cartItems: document.getElementById("cartItems"),
  cartEmpty: document.getElementById("cartEmpty"),
  cartTotal: document.getElementById("cartTotal"),
  cartBadge: document.getElementById("cartBadge"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  checkoutBtn: document.getElementById("checkoutBtn"),
};

const state = {
  search: "",
  selectedCategories: new Set(),
  inStockOnly: false,
  minPrice: null,
  maxPrice: null,
  sort: "price-asc",
  cart: new Map(), // productId -> quantity
};

function formatUAH(value) {
  return `₴${value.toLocaleString("uk-UA")}`;
}

function uniqueCategories(items) {
  return Array.from(new Set(items.map(p => p.category))).sort((a, b) => a.localeCompare(b, "uk"));
}

function buildCategoryFilters() {
  const cats = uniqueCategories(PRODUCTS);
  els.categoryChecks.innerHTML = cats.map(cat => {
    const id = `cat-${cat.replace(/\s+/g, "-").toLowerCase()}`;
    return `
      <label class="check" for="${id}">
        <input class="check__input" type="checkbox" id="${id}" data-category="${cat}">
        <span class="check__text">${cat}</span>
      </label>
    `;
  }).join("");

  // default: all categories selected
  cats.forEach(c => state.selectedCategories.add(c));

  // mark them checked
  for (const input of els.categoryChecks.querySelectorAll("input[type=checkbox]")) {
    input.checked = true;
  }
}

function getFilteredProducts() {
  const q = state.search.trim().toLowerCase();

  let list = PRODUCTS.filter(p => {
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (!state.selectedCategories.has(p.category)) return false;
    if (state.inStockOnly && !p.inStock) return false;
    if (state.minPrice !== null && p.price < state.minPrice) return false;
    if (state.maxPrice !== null && p.price > state.maxPrice) return false;
    return true;
  });

  // sorting
  switch (state.sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "name-asc":
      list.sort((a, b) => a.name.localeCompare(b.name, "uk"));
      break;
    default:
      break;
  }

  return list;
}

function renderProducts() {
  const list = getFilteredProducts();
  els.resultsCount.textContent = String(list.length);

  if (list.length === 0) {
    els.productsGrid.innerHTML = "";
    els.emptyState.hidden = false;
    return;
  }

  els.emptyState.hidden = true;

  els.productsGrid.innerHTML = list.map(p => {
    const stockClass = p.inStock ? "badge badge--ok" : "badge badge--out";
    const stockText = p.inStock ? "В наявності" : "Немає";
    const cartQty = state.cart.get(p.id) || 0;

    return `
      <article class="card" data-product-id="${p.id}">
        <div class="card__top">
          <span class="badge">${p.category}</span>
          <span class="${stockClass}">${stockText}</span>
        </div>

        <div class="card__body">
          <h2 class="card__title">${p.name}</h2>
          <p class="card__meta">
            <span>⭐ ${p.rating.toFixed(1)}</span>
            <span>•</span>
            <span class="small">ID: ${p.id}</span>
          </p>
          <div class="card__price">${formatUAH(p.price)}</div>
        </div>

        <div class="card__footer">
          <span class="small">${cartQty ? `У кошику: ${cartQty}` : "Ще не додано"}</span>
          <button class="btn btn--primary js-add-to-cart" type="button" ${p.inStock ? "" : "disabled"} aria-disabled="${!p.inStock}">
            Додати
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function updateCartBadge() {
  let totalQty = 0;
  for (const qty of state.cart.values()) totalQty += qty;
  els.cartBadge.textContent = String(totalQty);
  els.cartBadge.setAttribute("aria-label", `Кількість у кошику: ${totalQty}`);
}

function calcCartTotal() {
  let total = 0;
  for (const [id, qty] of state.cart.entries()) {
    const p = PRODUCTS.find(x => x.id === id);
    if (p) total += p.price * qty;
  }
  return total;
}

function renderCart() {
  const entries = Array.from(state.cart.entries());

  if (entries.length === 0) {
    els.cartItems.innerHTML = "";
    els.cartEmpty.hidden = false;
    els.cartTotal.textContent = formatUAH(0);
    updateCartBadge();
    renderProducts();
    return;
  }

  els.cartEmpty.hidden = true;

  els.cartItems.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return "";

    const lineTotal = p.price * qty;

    return `
      <div class="cart-item" data-cart-id="${id}">
        <div>
          <p class="cart-item__title">${p.name}</p>
          <p class="cart-item__meta">${p.category} • ${formatUAH(p.price)} • Сума: ${formatUAH(lineTotal)}</p>
        </div>
        <div class="cart-item__controls">
          <div class="qty" aria-label="Кількість">
            <button class="qty__btn js-qty-minus" type="button" aria-label="Зменшити">−</button>
            <span class="qty__value" aria-label="Поточна кількість">${qty}</span>
            <button class="qty__btn js-qty-plus" type="button" aria-label="Збільшити">+</button>
          </div>
          <button class="remove js-remove" type="button" aria-label="Видалити">Видалити</button>
        </div>
      </div>
    `;
  }).join("");

  els.cartTotal.textContent = formatUAH(calcCartTotal());
  updateCartBadge();
  renderProducts();
}

/* ====== Cart modal controls ====== */
function openCart() {
  els.cartModal.hidden = false;
  document.body.style.overflow = "hidden";
  els.closeCartBtn.focus();
}
function closeCart() {
  els.cartModal.hidden = true;
  document.body.style.overflow = "";
  els.openCartBtn.focus();
}

/* ====== Event handlers ====== */
function onGridClick(e) {
  const btn = e.target.closest(".js-add-to-cart");
  if (!btn) return;

  const card = e.target.closest("[data-product-id]");
  if (!card) return;

  const id = Number(card.getAttribute("data-product-id"));
  const product = PRODUCTS.find(p => p.id === id);
  if (!product || !product.inStock) return;

  const current = state.cart.get(id) || 0;
  state.cart.set(id, current + 1);
  renderCart();
}

function onCartClick(e) {
  const root = e.target.closest("[data-cart-id]");
  if (!root) return;

  const id = Number(root.getAttribute("data-cart-id"));
  const qty = state.cart.get(id) || 0;

  if (e.target.closest(".js-qty-plus")) {
    state.cart.set(id, qty + 1);
    renderCart();
    return;
  }

  if (e.target.closest(".js-qty-minus")) {
    const next = qty - 1;
    if (next <= 0) state.cart.delete(id);
    else state.cart.set(id, next);
    renderCart();
    return;
  }

  if (e.target.closest(".js-remove")) {
    state.cart.delete(id);
    renderCart();
  }
}

function resetFilters() {
  state.search = "";
  els.searchInput.value = "";
  els.minPrice.value = "";
  els.maxPrice.value = "";
  state.minPrice = null;
  state.maxPrice = null;

  state.inStockOnly = false;
  els.inStockOnly.checked = false;

  state.sort = "price-asc";
  els.sortSelect.value = "price-asc";

  // select all categories
  state.selectedCategories.clear();
  const cats = uniqueCategories(PRODUCTS);
  cats.forEach(c => state.selectedCategories.add(c));

  for (const input of els.categoryChecks.querySelectorAll("input[type=checkbox]")) {
    input.checked = true;
  }

  renderProducts();
}

function bindEvents() {
  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value;
    renderProducts();
  });

  els.clearSearchBtn.addEventListener("click", () => {
    els.searchInput.value = "";
    state.search = "";
    renderProducts();
    els.searchInput.focus();
  });

  els.categoryChecks.addEventListener("change", (e) => {
    const input = e.target.closest("input[type=checkbox]");
    if (!input) return;

    const cat = input.dataset.category;
    if (!cat) return;

    if (input.checked) state.selectedCategories.add(cat);
    else state.selectedCategories.delete(cat);

    // якщо користувач зняв всі — не показуємо нічого (це ок)
    renderProducts();
  });

  els.inStockOnly.addEventListener("change", () => {
    state.inStockOnly = els.inStockOnly.checked;
    renderProducts();
  });

  function parsePrice(v) {
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  els.minPrice.addEventListener("input", () => {
    state.minPrice = parsePrice(els.minPrice.value);
    renderProducts();
  });
  els.maxPrice.addEventListener("input", () => {
    state.maxPrice = parsePrice(els.maxPrice.value);
    renderProducts();
  });

  els.sortSelect.addEventListener("change", () => {
    state.sort = els.sortSelect.value;
    renderProducts();
  });

  els.resetFiltersBtn.addEventListener("click", resetFilters);

  els.productsGrid.addEventListener("click", onGridClick);

  els.openCartBtn.addEventListener("click", () => {
    renderCart();
    openCart();
  });
  els.closeCartBtn.addEventListener("click", closeCart);
  els.cartBackdrop.addEventListener("click", closeCart);

  document.addEventListener("keydown", (e) => {
    if (!els.cartModal.hidden && e.key === "Escape") closeCart();
  });

  els.cartItems.addEventListener("click", onCartClick);

  els.clearCartBtn.addEventListener("click", () => {
    state.cart.clear();
    renderCart();
  });

  els.checkoutBtn.addEventListener("click", () => {
    // Демо-дія: показуємо підтвердження та очищаємо
    const total = calcCartTotal();
    alert(`Демо: оформлення. Сума: ${formatUAH(total)}.\n(У реальному проєкті тут був би перехід на checkout.)`);
    state.cart.clear();
    renderCart();
    closeCart();
  });
}

/* ====== Init ====== */
buildCategoryFilters();
bindEvents();
renderProducts();
renderCart();
