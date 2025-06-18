// Sistema de Autenticação
class AuthSystem {
  constructor() {
    this.init();
  }

  init() {
    // Inicializar admins padrão se não existirem
    this.initDefaultAdmins();

    // Event listeners
    this.setupEventListeners();

    // Verificar se está logado
    this.checkAuthStatus();
  }

  initDefaultAdmins() {
    const existingAdmins = JSON.parse(localStorage.getItem("admins")) || [];

    if (existingAdmins.length === 0) {
      const defaultAdmins = [
        {
          id: "1",
          firstName: "Elisabete",
          lastName: "Ambrósio",
          email: "elisabete@lisbeauty.ao",
          phone: "927194654",
          password: this.hashPassword("123456"),
          role: "admin",
          createdAt: new Date().toISOString(),
          isActive: true,
          lastLogin: null,
        },
        {
          id: "2",
          firstName: "Erikson",
          lastName: "Teixeira",
          email: "erikson@lisbeauty.ao",
          phone: "949100325",
          password: this.hashPassword("123456"),
          role: "admin",
          createdAt: new Date().toISOString(),
          isActive: true,
          lastLogin: null,
        },
      ];

      localStorage.setItem("admins", JSON.stringify(defaultAdmins));
    }
  }

  setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // Register Form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    // Password Toggle
    const togglePassword = document.getElementById("togglePassword");
    if (togglePassword) {
      togglePassword.addEventListener("click", () =>
        this.togglePasswordVisibility()
      );
    }

    // Password Strength
    const passwordInput = document.getElementById("password");
    if (passwordInput && document.getElementById("passwordStrength")) {
      passwordInput.addEventListener("input", () =>
        this.checkPasswordStrength()
      );
    }

    // Forgot Password
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener("submit", (e) =>
        this.handleForgotPassword(e)
      );
    }
  }

  handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // Validação
    if (!email || !password) {
      this.showAlert("Por favor, preencha todos os campos.", "danger");
      return;
    }

    // Buscar admin
    const admins = JSON.parse(localStorage.getItem("admins")) || [];
    const admin = admins.find((a) => a.email === email);

    if (!admin) {
      this.showAlert("Email não encontrado.", "danger");
      return;
    }

    if (!admin.isActive) {
      this.showAlert("Conta desativada. Contacte o administrador.", "danger");
      return;
    }

    // Verificar senha
    if (!this.verifyPassword(password, admin.password)) {
      this.showAlert("Palavra-passe incorreta.", "danger");
      return;
    }

    // Login bem-sucedido
    this.loginSuccess(admin, rememberMe);
  }

  handleRegister(e) {
    e.preventDefault();

    const formData = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
      role: document.getElementById("role").value,
      accessCode: document.getElementById("accessCode").value,
    };

    // Validações
    if (!this.validateRegisterForm(formData)) {
      return;
    }

    // Verificar código de acesso
    if (formData.accessCode !== "LISBEAUTY2025") {
      this.showAlert("Código de acesso inválido.", "danger");
      return;
    }

    // Verificar se email já existe
    const admins = JSON.parse(localStorage.getItem("admins")) || [];
    if (admins.find((a) => a.email === formData.email)) {
      this.showAlert("Este email já está registrado.", "danger");
      return;
    }

    // Criar novo admin
    const newAdmin = {
      id: Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: this.hashPassword(formData.password),
      role: formData.role,
      createdAt: new Date().toISOString(),
      isActive: true,
      lastLogin: null,
    };

    admins.push(newAdmin);
    localStorage.setItem("admins", JSON.stringify(admins));

    this.showAlert(
      "Conta criada com sucesso! Redirecionando para login...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  }

  validateRegisterForm(formData) {
    // Verificar campos obrigatórios
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "role",
      "accessCode",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        this.showAlert("Por favor, preencha todos os campos.", "danger");
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      this.showAlert("Email inválido.", "danger");
      return false;
    }

    // Validar telefone
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      this.showAlert("Telefone deve ter 9 dígitos e começar com 9.", "danger");
      return false;
    }

    // Validar senha
    if (formData.password.length < 8) {
      this.showAlert(
        "A palavra-passe deve ter pelo menos 8 caracteres.",
        "danger"
      );
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      this.showAlert("As palavras-passe não coincidem.", "danger");
      return false;
    }

    // Verificar termos
    const acceptTerms = document.getElementById("acceptTerms");
    if (!acceptTerms.checked) {
      this.showAlert("Você deve aceitar os termos e condições.", "danger");
      return false;
    }

    return true;
  }

  checkPasswordStrength() {
    const password = document.getElementById("password").value;
    const strengthBar = document.getElementById("passwordStrength");
    const helpText = document.getElementById("passwordHelp");

    let strength = 0;
    let feedback = [];

    // Critérios de força
    if (password.length >= 8) strength++;
    else feedback.push("pelo menos 8 caracteres");

    if (/[a-z]/.test(password)) strength++;
    else feedback.push("letras minúsculas");

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push("letras maiúsculas");

    if (/\d/.test(password)) strength++;
    else feedback.push("números");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    else feedback.push("símbolos");

    // Atualizar barra visual
    const colors = ["#dc3545", "#fd7e14", "#ffc107", "#20c997", "#28a745"];
    const widths = [20, 40, 60, 80, 100];

    strengthBar.style.width = widths[strength - 1] + "%";
    strengthBar.style.backgroundColor = colors[strength - 1];

    // Atualizar texto de ajuda
    if (feedback.length > 0) {
      helpText.textContent = `Adicione: ${feedback.join(", ")}.`;
      helpText.className = "form-text text-danger";
    } else {
      helpText.textContent = "Palavra-passe forte!";
      helpText.className = "form-text text-success";
    }
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.querySelector("#togglePassword i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.replace("fa-eye-slash", "fa-eye");
    }
  }

  handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById("resetEmail").value;

    // Verificar se email existe
    const admins = JSON.parse(localStorage.getItem("admins")) || [];
    const admin = admins.find((a) => a.email === email);

    if (!admin) {
      this.showAlert("Email não encontrado.", "danger");
      return;
    }

    // Simular envio de email
    this.showAlert("Instruções enviadas para seu email!", "success");

    // Fechar modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("forgotPasswordModal")
    );
    modal.hide();
  }

  loginSuccess(admin, rememberMe) {
    // Atualizar último login
    const admins = JSON.parse(localStorage.getItem("admins")) || [];
    const adminIndex = admins.findIndex((a) => a.id === admin.id);

    if (adminIndex !== -1) {
      admins[adminIndex].lastLogin = new Date().toISOString();
      localStorage.setItem("admins", JSON.stringify(admins));
    }

    // Salvar sessão
    const sessionData = {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      loginTime: new Date().toISOString(),
    };

    if (rememberMe) {
      localStorage.setItem("adminSession", JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem("adminSession", JSON.stringify(sessionData));
    }

    this.showAlert("Login realizado com sucesso! Redirecionando...", "success");

    setTimeout(() => {
      window.location.href = "admin/dashboard.html";
    }, 1500);
  }

  checkAuthStatus() {
    const session =
      localStorage.getItem("adminSession") ||
      sessionStorage.getItem("adminSession");

    if (
      session &&
      (window.location.pathname.includes("login.html") ||
        window.location.pathname.includes("registro.html"))
    ) {
      window.location.href = "admin/dashboard.html";
    }
  }

  logout() {
    localStorage.removeItem("adminSession");
    sessionStorage.removeItem("adminSession");
    window.location.href = "admin/login.html";
  }

  // Utilitários
  hashPassword(password) {
    // Simulação de hash (em produção usar bcrypt ou similar)
    return btoa(password + "LISBEAUTY_SALT");
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  showAlert(message, type = "info") {
    const alertContainer = document.getElementById("alert-container");
    if (!alertContainer) return;

    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    alertContainer.innerHTML = "";
    alertContainer.appendChild(alertDiv);

    // Auto-dismiss após 5 segundos
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }

  // Verificar se usuário está logado (para outras páginas)
  isAuthenticated() {
    const session =
      localStorage.getItem("adminSession") ||
      sessionStorage.getItem("adminSession");
    return session !== null;
  }

  getCurrentUser() {
    const session =
      localStorage.getItem("adminSession") ||
      sessionStorage.getItem("adminSession");
    return session ? JSON.parse(session) : null;
  }
}

// Inicializar sistema
document.addEventListener("DOMContentLoaded", () => {
  window.authSystem = new AuthSystem();
});

// Função global para logout
function logout() {
  if (window.authSystem) {
    window.authSystem.logout();
  }
}
