/* === PRODUCT.JS ===
   Renderiza produtos e permite CRUD para o administrador
*/

// === CARREGAR PRODUTOS DO LOCALSTORAGE ===
let produtos = JSON.parse(localStorage.getItem("produtos")) || [
  { id: 1, nome: "Café Preto", descricao: "Café tradicional", preco: 5.0, quantidade: 1, imagem: "https://s2-oglobo.glbimg.com/DsK7XG8E-JwxHP8m0cQQhbxZWhs=/0x182:740x927/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_da025474c0c44edd99332dddb09cabe8/internal_photos/bs/2024/U/n/EJKDs3Tum4cqSVmRj67A/xicara-de-cafe-e-graos-de-cafe-d.jpg" },
  { id: 2, nome: "Chá Mate", descricao: "Chá gelado e refrescante", preco: 4.0, quantidade: 1, imagem: "https://ciclovivo.com.br/wp-content/uploads/2021/05/plantas-Brasil-cha-1024x714.jpg" },
];

// === SALVAR NO LOCALSTORAGE ===
function saveProdutos() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
}

// === RENDERIZAR PRODUTOS ===
function renderProdutos() {
  const container = document.getElementById("produtos-container");
  container.innerHTML = "";

  produtos.forEach(prod => {
    const div = document.createElement("div");
    div.className = "produto";
    const isAdmin = currentUser && currentUser.email === "administrador@gmail.com";

    div.innerHTML = `
      <img src="${prod.imagem}" alt="${prod.nome}">
      <h3>${prod.nome}</h3>
      <p>${prod.descricao}</p>
      <p><strong>Preço:</strong> R$ ${prod.preco.toFixed(2)}</p>
      ${
        isAdmin
          ? `<div class="admin-actions">
               <button class="btn-produto admin" onclick="editProduto(${prod.id})">✏️ Editar</button>
               <button class="btn-produto admin" onclick="removeProduto(${prod.id})">🗑️ Remover</button>
             </div>`
          : `<div class="quantity">
               <button onclick="decreaseQtyInput(this)">-</button>
               <input type="number" min="1" value="${prod.quantidade}">
               <button onclick="increaseQtyInput(this)">+</button>
             </div>
             <button class="btn-produto" onclick="addToCart('${prod.nome}', ${prod.preco}, this.parentElement.querySelector('input').value)">🛒 Adicionar</button>`
      }
    `;
    container.appendChild(div);
  });
}

// === QUANTIDADE + / - ===
function increaseQtyInput(btn) { btn.previousElementSibling.value++; }
function decreaseQtyInput(btn) {
  const input = btn.nextElementSibling;
  if (input.value > 1) input.value--;
}

// === SCROLL LOCK ===
function lockScroll() { document.body.style.overflow = "hidden"; }
function unlockScroll() { document.body.style.overflow = "auto"; }

// === MODAIS ===
function addProductModal() {
  openProductModal("Adicionar Produto", "Cadastrar", "submitProduct()");
  clearProductForm();
}

function openProductModal(title, buttonText, action) {
  document.getElementById("product-overlay").style.display = "flex";
  document.getElementById("product-modal-title").textContent = title;
  const btn = document.getElementById("product-submit-btn");
  btn.textContent = buttonText;
  btn.setAttribute("onclick", action);
  lockScroll();
}

function closeProductModal() {
  document.getElementById("product-overlay").style.display = "none";
  clearProductForm();
  unlockScroll();
}

// === ADICIONAR / EDITAR ===
function submitProduct() {
  const data = getProductFormData();
  if (!data) return;

  data.id = produtos.length ? produtos[produtos.length - 1].id + 1 : 1;
  produtos.push(data);
  saveProdutos();
  showToast("Produto adicionado com sucesso!");
  closeProductModal();
  renderProdutos();
}

function editProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;

  openProductModal("Editar Produto", "Salvar Alterações", `updateProduto(${id})`);
  fillProductForm(produto);
}

function updateProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;

  const data = getProductFormData();
  if (!data) return;

  Object.assign(produto, data);
  saveProdutos();
  showToast("Produto atualizado com sucesso!");
  closeProductModal();
  renderProdutos();
}

// === REMOVER ===
function removeProduto(id) {
  produtos = produtos.filter(p => p.id !== id);
  saveProdutos();
  renderProdutos();
  showToast("Produto removido com sucesso!");
}

// === FORMULÁRIO ===
function getProductFormData() {
  const name = getValue("product-name");
  const desc = getValue("product-description");
  const price = parseFloat(getValue("product-price"));
  const img = getValue("product-image") || "https://img.freepik.com/fotos-gratis/fundo-de-textura-de-papel-branco-em-branco_53876-128399.jpg";

  // --- Validação de campos obrigatórios ---
  const requiredFields = ["product-name", "product-description", "product-price"];
  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove("invalid-field");
  });

  if (!name || !desc || isNaN(price)) {
    showToast("Preencha todos os campos corretamente!");
    highlightInvalidFields();
    return null;
  }

  // --- Validação de preço negativo ---
  if (price < 0) {
    showToast("O preço não pode ser menor que zero!");
    document.getElementById("product-price").classList.add("invalid-field");
    return null;
  }

  return { nome: name, descricao: desc, preco: price, quantidade: 1, imagem: img };
}

// === DESTACAR CAMPOS INVÁLIDOS ===
function highlightInvalidFields() {
  const fields = ["product-name", "product-description", "product-price"];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) el.classList.add("invalid-field");
  });
}

function fillProductForm(prod) {
  setValue("product-name", prod.nome);
  setValue("product-description", prod.descricao);
  setValue("product-price", prod.preco);
  setValue("product-image", prod.imagem);
}

function clearProductForm() {
  ["product-name", "product-description", "product-price", "product-image"].forEach(id => {
    const el = document.getElementById(id);
    el.value = "";
    el.classList.remove("invalid-field");
  });
}

// === UTILS ===
function getValue(id) { return document.getElementById(id).value.trim(); }
function setValue(id, val) { document.getElementById(id).value = val; }

// === INICIALIZAÇÃO ===
window.addEventListener("load", renderProdutos);