/* === CART.JS ===
   Responsável por adicionar, remover e renderizar itens do carrinho
*/

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ======================= BLOQUEIO DE SCROLL =======================
function disableScroll() { document.body.style.overflow = "hidden"; }
function enableScroll() { document.body.style.overflow = ""; }

// ======================= SALVAR LOCALMENTE =======================
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ======================= ADICIONAR AO CARRINHO =======================
function addToCart(nome, preco, quantidade) {
  if (!currentUser) return showToast("Você precisa estar logado para adicionar produtos!");

  quantidade = parseInt(quantidade);
  if (quantidade <= 0) return;

  const existing = cart.find(item => item.nome === nome);
  if (existing) existing.quantidade += quantidade;
  else cart.push({ nome, preco, quantidade });

  saveCart();
  renderCart();
  showToast(`${quantidade}x ${nome} adicionado(s) ao carrinho!`);
}

// ======================= RENDERIZAR CARRINHO =======================
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const countEl = document.getElementById("cart-count");

  container.innerHTML = "";
  let total = 0, count = 0;

  cart.forEach((item, index) => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;
    count += item.quantidade;

    const div = document.createElement("div");
    div.innerHTML = `
      ${item.quantidade}x ${item.nome} - R$ ${subtotal.toFixed(2)}
      <button onclick="removeFromCart(${index})">X</button>
    `;
    container.appendChild(div);
  });

  totalEl.textContent = total.toFixed(2);
  countEl.textContent = count;
}

// ======================= MODAIS =======================
const cartOverlay = document.getElementById("cart-overlay");
cartOverlay.addEventListener("click", e => { 
  if (e.target === cartOverlay) closeCart(); 
});

function openCart() {
  if (!currentUser) return showToast("Você precisa estar logado para acessar o carrinho!");
  if (currentUser.email === "administrador@gmail.com") return;

  cartOverlay.style.display = "flex";
  renderCart();
  disableScroll();
}

function closeCart() {
  cartOverlay.style.display = "none";
  enableScroll();
}

// ======================= FINALIZAR PEDIDO =======================
function finalizeOrder() {
  if (!cart.length) return showToast("Carrinho vazio!");
  showToast("Pedido finalizado!");
  cart = [];
  saveCart();
  renderCart();
}

// ======================= REMOVER ITEM =======================
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

// ======================= INICIALIZAÇÃO =======================
window.addEventListener("load", renderCart);