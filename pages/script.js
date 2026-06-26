
// ── Dark / Light Mode Toggle ──
const html = document.documentElement;
const themeIcon = document.getElementById('theme-icon');

if (localStorage.getItem('theme') === 'light') {
  html.classList.remove('dark');
  if (themeIcon) themeIcon.textContent = '☀️';
} else {
  html.classList.add('dark');
  if (themeIcon) themeIcon.textContent = '🌙';
}

function toggleTheme() {
  const isDark = html.classList.toggle('dark');
  if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ── Mobile Hamburger Menu ──
function toggleMenu() {
  const menu = document.getElementById('mob-menu');
  const icon  = document.getElementById('ham');
  if (!menu) return;
  menu.classList.toggle('open');
  if (icon) icon.textContent = menu.classList.contains('open') ? '✕' : '☰';
}

// ══════════════════════════════
//  CART
// ══════════════════════════════
let cart = JSON.parse(localStorage.getItem('lexstro-cart') || '[]');

function saveCart() {
  localStorage.setItem('lexstro-cart', JSON.stringify(cart));
}

function updateCartUI() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = `🛒 Cart (${total})`;
  });
}

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart();
  updateCartUI();

  // Flash toast notification
  showToast(`✅ "${name}" added to cart!`);
}

function showToast(msg) {
  let toast = document.getElementById('lexstri-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'nexus-toast';
    toast.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:9999;
      background:#7c3aed; color:#fff; padding:12px 20px;
      border-radius:10px; font-size:14px; font-weight:600;
      box-shadow:0 4px 20px rgba(124,58,237,0.4);
      transition: opacity 0.4s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ── Cart Modal ──
function openCart() {
  let modal = document.getElementById('cart-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cart-modal';
    modal.style.cssText = `
      position:fixed; inset:0; z-index:10000;
      background:rgba(0,0,0,0.6); display:flex;
      align-items:center; justify-content:center;
    `;
    modal.innerHTML = `
      <div style="background:#1f2937; border-radius:14px; padding:24px; width:360px; max-width:90vw; color:#f9fafb;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h2 style="font-weight:700; font-size:18px;">🛒 Your Cart</h2>
          <button onclick="closeCart()" style="background:none; border:none; color:#9ca3af; font-size:22px; cursor:pointer;">✕</button>
        </div>
        <div id="cart-items"></div>
        <div id="cart-total" style="margin-top:16px; font-weight:700; font-size:16px; text-align:right; color:#a78bfa;"></div>
        <button onclick="clearCart()" style="margin-top:14px; width:100%; background:#374151; color:#f9fafb; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:600;">🗑 Clear Cart</button>
      </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) closeCart(); });
    document.body.appendChild(modal);
  }
  renderCartItems();
  modal.style.display = 'flex';
}

function renderCartItems() {
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p style="color:#9ca3af; text-align:center; padding:20px 0;">Your cart is empty.</p>';
    if (totalEl) totalEl.textContent = '';
    return;
  }

  itemsEl.innerHTML = cart.map((item, i) => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #374151;">
      <div>
        <p style="font-weight:600; font-size:14px;">${item.name}</p>
        <p style="font-size:12px; color:#9ca3af;">$${item.price.toFixed(2)} × ${item.qty}</p>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:700; color:#a78bfa;">$${(item.price * item.qty).toFixed(2)}</span>
        <button onclick="removeFromCart(${i})" style="background:#ef4444; border:none; color:#fff; width:22px; height:22px; border-radius:50%; cursor:pointer; font-size:14px; line-height:1;">✕</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (totalEl) totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  renderCartItems();
}

function closeCart() {
  const modal = document.getElementById('cart-modal');
  if (modal) modal.style.display = 'none';
}

// ══════════════════════════════
//  GENRE FILTER (Games page)
// ══════════════════════════════
function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active style
      filterBtns.forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white');
        b.classList.add('filter-btn');
      });
      btn.classList.add('bg-purple-600', 'text-white');

      const genre = btn.dataset.genre;
      document.querySelectorAll('.game-card').forEach(card => {
        const match = genre === 'all' || card.dataset.genre === genre;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

// ── Init on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  initFilter();
});

// ══════════════════════════════
//  PRODUCT PREVIEW MODAL
// ══════════════════════════════
function openPreview(name, price, tag, desc, addable) {
  let modal = document.getElementById('preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'preview-modal';
    modal.style.cssText = `
      position:fixed; inset:0; z-index:10000;
      background:rgba(0,0,0,0.7); display:flex;
      align-items:center; justify-content:center;
      padding: 16px;
    `;
    modal.addEventListener('click', e => { if (e.target === modal) closePreview(); });
    document.body.appendChild(modal);
  }

  const addBtn = addable
    ? `<button onclick="addToCart('${name}', ${price}); closePreview();"
        style="background:#7c3aed; color:#fff; border:none; padding:10px 22px;
               border-radius:8px; font-weight:700; font-size:14px; cursor:pointer;
               transition:background 0.2s;"
        onmouseover="this.style.background='#6d28d9'"
        onmouseout="this.style.background='#7c3aed'">
        🛒 Add to Cart — $${price.toFixed(2)}
      </button>`
    : `<a href="games.html"
        style="background:#7c3aed; color:#fff; padding:10px 22px; border-radius:8px;
               font-weight:700; font-size:14px; text-decoration:none; display:inline-block;">
        🎮 Browse All Games
      </a>`;

  modal.innerHTML = `
    <div style="background:#1f2937; border-radius:16px; padding:28px; width:420px;
                max-width:95vw; color:#f9fafb; position:relative;">
      <button onclick="closePreview()"
        style="position:absolute; top:14px; right:16px; background:none; border:none;
               color:#9ca3af; font-size:22px; cursor:pointer; line-height:1;">✕</button>

      <p style="font-size:11px; color:#a78bfa; font-weight:700; letter-spacing:2px;
                text-transform:uppercase; margin-bottom:6px;">${tag}</p>
      <h2 style="font-size:22px; font-weight:800; margin-bottom:10px;">${name}</h2>
      <p style="font-size:14px; color:#9ca3af; line-height:1.7; margin-bottom:20px;">${desc}</p>

      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:gap;">
        <span style="font-size:22px; font-weight:800; color:#a78bfa;">$${price.toFixed(2)}</span>
        ${addBtn}
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

function closePreview() {
  const modal = document.getElementById('preview-modal');
  if (modal) modal.style.display = 'none';
}
function toggleMenu() {
      const m = document.getElementById('mob-menu');
      const h = document.getElementById('ham');
      m.classList.toggle('open');
      h.textContent = m.classList.contains('open') ? '✕' : '☰';
    }

    function togglePassword() {
      const pw = document.getElementById('password');
      const icon = document.getElementById('eye-icon');
      if (pw.type === 'password') {
        pw.type = 'text';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
      } else {
        pw.type = 'password';
        icon.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>';
      }
    }

    function showToast(msg, isError) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.background = isError ? '#dc2626' : '#7c3aed';
      t.style.color = '#fff';
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    function validate() {
      let ok = true;
      const email = document.getElementById('email');
      const pw = document.getElementById('password');
      const emailErr = document.getElementById('email-err');
      const pwErr = document.getElementById('pw-err');

      if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('error'); emailErr.classList.add('show'); ok = false;
      } else {
        email.classList.remove('error'); emailErr.classList.remove('show');
      }

      if (!pw.value || pw.value.length < 6) {
        pw.classList.add('error'); pwErr.classList.add('show'); ok = false;
      } else {
        pw.classList.remove('error'); pwErr.classList.remove('show');
      }

      return ok;
    }

    function handleLogin(e) {
      e.preventDefault();
      if (!validate()) return;
      const btn = document.getElementById('login-btn');
      btn.textContent = 'LOGGING IN...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'LOGIN';
        btn.disabled = false;
        showToast('Welcome back, Gamer!', false);
      }, 1400);
    }

    function socialLogin(provider) {
      showToast('Connecting via ' + provider + '...', false);
    }