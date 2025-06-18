// Middleware para proteger páginas administrativas
function requireAuth() {
  const session =
    localStorage.getItem("adminSession") ||
    sessionStorage.getItem("adminSession");

  if (!session) {
    window.location.href = "../login.html";
    return false;
  }

  return true;
}

// Verificar autenticação ao carregar páginas admin
document.addEventListener("DOMContentLoaded", function () {
  // Verificar se estamos em uma página administrativa
  if (window.location.pathname.includes("/admin/")) {
    requireAuth();
  }
});
