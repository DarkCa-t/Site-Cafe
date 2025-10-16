/* === LOGIN.JS ===
   Responsável pelo login, cadastro, logout, perfil e controle do painel admin
*/

let currentUser = null;
const ADMIN = { name: "Administrador", email: "administrador@gmail.com", password: "admin123" };

// ======================= UTILITÁRIOS =======================
function getValue(id) { return document.getElementById(id).value.trim(); }
function setText(id, text) { document.getElementById(id).textContent = text; }
function toggleDisplay(id, val) { document.getElementById(id).style.display = val; }
function show(id) { document.getElementById(id).style.display = "flex"; }
function hide(id) { document.getElementById(id).style.display = "none"; }
function showError(el, msg) { el.textContent = msg; el.style.display = "block"; }

// ======================= BLOQUEIO DE ROLAGEM =======================
function disableScroll() { document.body.style.overflow = "hidden"; }
function enableScroll() { document.body.style.overflow = ""; }

// Bloqueia scroll apenas quando modal de login ou perfil do usuário está aberto
function checkScrollLock() {
  const loginOpen = document.getElementById("login-container").style.display === "flex";
  const userFormVisible = document.getElementById("user-form").style.display === "flex";

  if (loginOpen || userFormVisible) {
    disableScroll();
  } else {
    enableScroll();
  }
}

// ======================= MODAIS LOGIN =======================
function openLogin() {
  if (currentUser) return showUserInfo();

  toggleDisplay("login-overlay", "flex");
  toggleDisplay("login-container", "flex");
  checkScrollLock();
}

function closeLogin() {
  toggleDisplay("login-overlay", "none");
  toggleDisplay("login-container", "none");
  enableScroll();
}

// ======================= TROCAR LOGIN / CADASTRO =======================
function switchTab(tab) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-register").classList.toggle("active", tab === "register");

  loginForm.style.display = tab === "login" ? "flex" : "none";
  registerForm.style.display = tab === "login" ? "none" : "flex";
}

// ======================= VERIFICAÇÃO DE EMAIL =======================
function isValidEmail(email) {
  return email.includes("@") && email.includes(".com");
}

// ======================= CADASTRAR =======================
function registerUser() {
  const name = getValue("register-name");
  const email = getValue("register-email");
  const password = getValue("register-password");
  const error = document.getElementById("register-error");

  if (!name || !email || !password) return showError(error, "Preencha todos os campos!");
  if (!isValidEmail(email)) return showError(error, "Digite um e-mail válido (deve conter '@' e '.com')!");
  if (password.length < 6) return showError(error, "A senha deve ter pelo menos 6 caracteres!");

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  if (users.some(u => u.email === email)) return showError(error, "Este e-mail já está cadastrado!");

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  showToast("Usuário cadastrado com sucesso!");
  switchTab("login");
}

// ======================= LOGIN =======================
function login() {
  const email = getValue("login-email");
  const password = getValue("login-password");
  const error = document.getElementById("login-error");

  if (!email || !password) return showError(error, "Preencha todos os campos!");
  if (!isValidEmail(email)) return showError(error, "Digite um e-mail válido (deve conter '@' e '.com')!");

  // Admin
  if (email === ADMIN.email && password === ADMIN.password) {
    currentUser = ADMIN;
    afterLogin(true);
    return;
  }

  // Usuário comum
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return showError(error, "E-mail ou senha incorretos!");

  currentUser = user;
  afterLogin(false);
}

// ======================= PÓS LOGIN =======================
function afterLogin(isAdmin) {
  localStorage.setItem("user", JSON.stringify(currentUser));
  showToast(`Bem-vindo, ${currentUser.name}!`);
  updateLoginUI();
  showAdminPanel(isAdmin);

  if (!isAdmin) {
    showUserInfo(); // mostra modal do usuário
  } else {
    closeLogin(); // admin não precisa de overlay
  }

  renderProdutos();
}

// ======================= PERFIL DO USUÁRIO =======================
function showUserInfo() {
  if (!currentUser) return;

  const overlay = document.getElementById("login-overlay");
  const container = document.getElementById("login-container");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const userForm = document.getElementById("user-form");

  overlay.style.display = "flex";
  overlay.style.zIndex = "1000";

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.opacity = "1";
  container.style.zIndex = "1010";

  loginForm.style.display = "none";
  registerForm.style.display = "none";
  userForm.style.display = "flex";

  setText("user-name", currentUser.name);
  setText("user-email", currentUser.email);
  setText("user-password", currentUser.password || "******");

  checkScrollLock();
}

// ======================= LOGOUT =======================
function logout() {
  localStorage.removeItem("user");
  currentUser = null;
  updateLoginUI();
  showAdminPanel(false);
  showToast("Você saiu da conta.");
  closeLogin();
  renderProdutos();
  enableScroll();
}

// ======================= UI LOGIN =======================
function updateLoginUI() {
  const loginLink = document.getElementById('login-link');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const userForm = document.getElementById('user-form');

  if (currentUser) {
    if (loginLink) loginLink.innerHTML = `<a href="#" onclick="openUserInfo()">${currentUser.name}</a>`;
    if (tabLogin) tabLogin.style.display = 'none';
    if (tabRegister) tabRegister.style.display = 'none';
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'none';
    if (userForm) userForm.style.display = 'none';
  } else {
    if (loginLink) loginLink.innerHTML = `<a href="#" onclick="openLogin()">Login</a>`;
    if (tabLogin) tabLogin.style.display = 'inline-block';
    if (tabRegister) tabRegister.style.display = 'inline-block';
    if (loginForm) loginForm.style.display = 'flex';
    if (registerForm) registerForm.style.display = 'none';
    if (userForm) userForm.style.display = 'none';
  }

  checkScrollLock();
}

// ======================= EVENTOS =======================
document.getElementById('login-overlay').addEventListener('click', e => {
  if (!document.getElementById('login-container').contains(e.target)) closeLogin();
});

function openUserInfo() {
  if (!currentUser) return;
  showUserInfo();
}

// ======================= ADMIN PAINEL =======================
function showAdminPanel(show) {
  toggleDisplay("admin-header", show ? "block" : "none");
  toggleDisplay("admin-controls", show ? "block" : "none");
  toggleDisplay("cart-btn", show ? "none" : "inline-block");
  if (show) hide("cart-overlay");
}

// ======================= TOAST =======================
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "show";
  setTimeout(() => toast.className = toast.className.replace("show", ""), 3000);
}

// ======================= INICIALIZAÇÃO =======================
window.addEventListener("load", () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    updateLoginUI();
    if (currentUser.email === ADMIN.email) showAdminPanel(true);
  }
});