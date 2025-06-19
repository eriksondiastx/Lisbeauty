class AdminDashboard {
  constructor() {
    this.currentSection = "dashboard";
    this.charts = {};
    this.init();
  }

  init() {
    // Verificar autenticação
    if (!this.checkAuth()) return;

    // Carregar dados iniciais
    this.loadDashboardData();

    // Setup event listeners
    this.setupEventListeners();

    // Carregar seção inicial
    this.showSection("dashboard");

    // Inicializar gráficos
    this.initCharts();
  }

  checkAuth() {
    const session =
      localStorage.getItem("adminSession") ||
      sessionStorage.getItem("adminSession");
    if (!session) {
      window.location.href = "../login.html";
      return false;
    }

    const user = JSON.parse(session);
    document.getElementById("admin-name").textContent = user.firstName;
    return true;
  }

  setupEventListeners() {
    // Sidebar navigation
    document
      .querySelectorAll(".sidebar .nav-link[data-section]")
      .forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const section = e.target.closest("[data-section]").dataset.section;
          this.showSection(section);
        });
      });

    // Sidebar toggle
    document.getElementById("sidebarToggle")?.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("show");
    });

    // Forms
    document.getElementById("produtoForm")?.addEventListener("submit", (e) => {
      this.handleProdutoSubmit(e);
    });

    // Filters
    document
      .getElementById("buscar-produto")
      ?.addEventListener("input", (e) => {
        this.filterProdutos(e.target.value);
      });

    document
      .getElementById("filtro-categoria")
      ?.addEventListener("change", (e) => {
        this.filterProdutosByCategory(e.target.value);
      });
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll(".content-section").forEach((section) => {
      section.style.display = "none";
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
      targetSection.style.display = "block";
    }

    // Update active nav
    document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNav) {
      activeNav.classList.add("active");
    }

    this.currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
      case "dashboard":
        this.loadDashboardData();
        break;
      case "produtos":
        this.loadProdutos();
        break;
      case "encomendas":
        this.loadEncomendas();
        break;
      case "clientes":
        this.loadClientes();
        break;
    }
  }

  loadDashboardData() {
    // Simular dados do dashboard
    const produtos = JSON.parse(localStorage.getItem("produtosData")) || [];
    const encomendas = JSON.parse(localStorage.getItem("encomendas")) || [];
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    // Atualizar contadores
    document.getElementById("total-produtos").textContent = produtos.length;
    document.getElementById("produtos-count").textContent = produtos.length;
    document.getElementById("encomendas-count").textContent = encomendas.length;
    document.getElementById("clientes-count").textContent = clientes.length;
    document.getElementById("clientes-ativos").textContent = clientes.filter(
      (c) => c.ativo
    ).length;

    // Calcular estatísticas do mês
    const thisMonth = new Date().getMonth();
    const encomendasMes = encomendas.filter(
      (e) => new Date(e.data).getMonth() === thisMonth
    ).length;
    document.getElementById("encomendas-mes").textContent = encomendasMes;

    // Calcular receita
    const receitaMes = encomendas
      .filter(
        (e) =>
          new Date(e.data).getMonth() === thisMonth && e.status === "entregue"
      )
      .reduce((total, e) => total + e.valor, 0);
    document.getElementById(
      "receita-mes"
    ).textContent = `Kz ${this.formatCurrency(receitaMes)}`;

    // Atualizar produtos populares
    this.updateProdutosPopulares(produtos);

    // Atualizar encomendas recentes
    this.updateEncomendasRecentes(encomendas);
  }

  updateProdutosPopulares(produtos) {
    const produtosPopulares = produtos
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    const container = document.getElementById("produtos-populares-list");
    container.innerHTML = "";

    produtosPopulares.forEach((produto, index) => {
      const item = document.createElement("div");
      item.className = "d-flex align-items-center mb-3";
      item.innerHTML = `
                <div class="me-3">
                    <span class="badge bg-primary">${index + 1}</span>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0">${produto.nome}</h6>
                    <small class="text-muted">${
                      produto.clicks
                    } visualizações</small>
                </div>
                <div>
                    <span class="text-success">Kz ${this.formatCurrency(
                      produto.preco
                    )}</span>
                </div>
            `;
      container.appendChild(item);
    });
  }

  updateEncomendasRecentes(encomendas) {
    const encomendasRecentes = encomendas
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 10);

    const tbody = document.querySelector("#encomendas-recentes-table tbody");
    tbody.innerHTML = "";

    encomendasRecentes.forEach((encomenda) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>#${encomenda.id}</td>
                <td>${encomenda.cliente}</td>
                <td>${encomenda.produto}</td>
                <td>Kz ${this.formatCurrency(encomenda.valor)}</td>
                <td><span class="badge status-${encomenda.status}">${
        encomenda.status
      }</span></td>
                <td>${this.formatDate(encomenda.data)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewEncomenda('${
                      encomenda.id
                    }')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });
  }

  loadProdutos() {
    const produtos = JSON.parse(localStorage.getItem("produtosData")) || [];
    const tbody = document.getElementById("produtos-tbody");
    tbody.innerHTML = "";

    produtos.forEach((produto) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>
                    <img src="${produto.imagem}" alt="${
        produto.nome
      }" class="img-preview">
                </td>
                <td>
                    <strong>${produto.nome}</strong>
                    <br><small class="text-muted">${produto.descricao}</small>
                </td>
                <td>${produto.categoria}</td>
                <td>Kz ${this.formatCurrency(produto.preco)}</td>
                <td>${produto.clicks}</td>
                <td>
                    <span class="badge ${
                      produto.ativo ? "bg-success" : "bg-secondary"
                    }">
                        ${produto.ativo ? "Ativo" : "Inativo"}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="editProduto('${
                      produto.id
                    }')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteProduto('${
                      produto.id
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info btn-action" onclick="toggleProdutoStatus('${
                      produto.id
                    }')">
                        <i class="fas fa-toggle-${
                          produto.ativo ? "on" : "off"
                        }"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });
  }

  handleProdutoSubmit(e) {
    e.preventDefault();

    const produtoData = {
      id: Date.now().toString(),
      nome: document.getElementById("produto-nome").value,
      categoria: document.getElementById("produto-categoria").value,
      subcategoria: document.getElementById("produto-subcategoria").value,
      preco: parseFloat(document.getElementById("produto-preco").value) * 100, // Convert to cents
      descricao: document.getElementById("produto-descricao").value,
      imagem: document.getElementById("produto-imagem").files[0]
        ? URL.createObjectURL(
            document.getElementById("produto-imagem").files[0]
          )
        : "../img/placeholder.jpg",
      clicks: 0,
      criadoEm: new Date().toISOString(),
      ativo: true,
    };

    // Save to localStorage (simulating database)
    let produtos = JSON.parse(localStorage.getItem("produtosData")) || [];
    produtos.push(produtoData);
    localStorage.setItem("produtosData", JSON.stringify(produtos));

    // Update global products data
    if (window.produtosData) {
      window.produtosData.push(produtoData);
    }

    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("produtoModal")
    );
    modal.hide();

    document.getElementById("produtoForm").reset();
    this.loadProdutos();
    this.showNotification("Produto adicionado com sucesso!", "success");
  }

  initCharts() {
    // Sales Chart
    const ctx = document.getElementById("salesChart");
    if (ctx) {
      this.charts.sales = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
          datasets: [
            {
              label: "Vendas",
              data: [12, 19, 3, 5, 2, 3, 9],
              borderColor: "rgb(240, 140, 176)",
              backgroundColor: "rgba(240, 140, 176, 0.1)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }

  // Utility functions
  formatCurrency(amount) {
    return (amount / 100).toLocaleString("pt-AO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("pt-PT");
  }

  showNotification(message, type = "info") {
    // Toast notification (implement as needed)
    const toast = document.createElement("div");
    toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = "9999";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Global functions for button actions
function editProduto(id) {
  console.log("Edit produto:", id);
  // Implement edit functionality
}

// Continuação do admin-dashboard.js

function deleteProduto(id) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    let produtos = JSON.parse(localStorage.getItem("produtosData")) || [];
    produtos = produtos.filter((p) => p.id !== id);
    localStorage.setItem("produtosData", JSON.stringify(produtos));

    if (window.adminDashboard) {
      window.adminDashboard.loadProdutos();
      window.adminDashboard.loadDashboardData();
      window.adminDashboard.showNotification(
        "Produto excluído com sucesso!",
        "success"
      );
    }
  }
}

function toggleProdutoStatus(id) {
  let produtos = JSON.parse(localStorage.getItem("produtosData")) || [];
  const produto = produtos.find((p) => p.id === id);

  if (produto) {
    produto.ativo = !produto.ativo;
    localStorage.setItem("produtosData", JSON.stringify(produtos));

    if (window.adminDashboard) {
      window.adminDashboard.loadProdutos();
      window.adminDashboard.loadDashboardData();
      const status = produto.ativo ? "ativado" : "desativado";
      window.adminDashboard.showNotification(
        `Produto ${status} com sucesso!`,
        "info"
      );
    }
  }
}

function viewEncomenda(id) {
  console.log("View encomenda:", id);
  // Implementar visualização de encomenda
  if (window.adminDashboard) {
    window.adminDashboard.showNotification(
      "Funcionalidade em desenvolvimento",
      "info"
    );
  }
}

function exportarProdutos() {
  const produtos = JSON.parse(localStorage.getItem("produtosData")) || [];

  if (produtos.length === 0) {
    if (window.adminDashboard) {
      window.adminDashboard.showNotification(
        "Não há produtos para exportar!",
        "warning"
      );
    }
    return;
  }

  // Criar CSV
  const headers = [
    "ID",
    "Nome",
    "Categoria",
    "Subcategoria",
    "Preço (Kz)",
    "Status",
    "Visualizações",
    "Data Criação",
  ];
  const csvContent = [
    headers.join(","),
    ...produtos.map((produto) =>
      [
        produto.id,
        `"${produto.nome}"`,
        produto.categoria,
        produto.subcategoria || "",
        (produto.preco / 100).toFixed(2),
        produto.ativo ? "Ativo" : "Inativo",
        produto.clicks || 0,
        produto.criadoEm
          ? new Date(produto.criadoEm).toLocaleDateString("pt-PT")
          : "",
      ].join(",")
    ),
  ].join("\n");

  // Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `produtos_lisbeauty_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  link.click();

  if (window.adminDashboard) {
    window.adminDashboard.showNotification(
      "Produtos exportados com sucesso!",
      "success"
    );
  }
}

function exportarEncomendas() {
  const encomendas = JSON.parse(localStorage.getItem("encomendas")) || [];

  if (encomendas.length === 0) {
    if (window.adminDashboard) {
      window.adminDashboard.showNotification(
        "Não há encomendas para exportar!",
        "warning"
      );
    }
    return;
  }

  // Criar CSV
  const headers = ["ID", "Cliente", "Produto", "Valor (Kz)", "Status", "Data"];
  const csvContent = [
    headers.join(","),
    ...encomendas.map((encomenda) =>
      [
        encomenda.id,
        `"${encomenda.cliente}"`,
        `"${encomenda.produto}"`,
        (encomenda.valor / 100).toFixed(2),
        encomenda.status,
        new Date(encomenda.data).toLocaleDateString("pt-PT"),
      ].join(",")
    ),
  ].join("\n");

  // Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `encomendas_lisbeauty_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  link.click();

  if (window.adminDashboard) {
    window.adminDashboard.showNotification(
      "Encomendas exportadas com sucesso!",
      "success"
    );
  }
}

function refreshDashboard() {
  if (window.adminDashboard) {
    window.adminDashboard.loadDashboardData();
    window.adminDashboard.showNotification("Dashboard atualizado!", "info");
  }
}

// Adicionar métodos que faltavam na classe AdminDashboard
AdminDashboard.prototype.loadEncomendas = function () {
  console.log("🛒 Carregando encomendas...");

  // Dados de exemplo para encomendas
  let encomendas = JSON.parse(localStorage.getItem("encomendas")) || [];

  if (encomendas.length === 0) {
    // Criar dados de exemplo
    const produtos = JSON.parse(localStorage.getItem("produtosData")) || [];
    const clientesExemplo = [
      "Maria Silva",
      "Ana Costa",
      "Joana Santos",
      "Carla Pereira",
      "Sofia Rodrigues",
      "Beatriz Lima",
      "Catarina Alves",
    ];

    encomendas = [
      {
        id: "ENC001",
        cliente: "Maria Silva",
        produto: "Peruca Lace Front Castanha",
        valor: 50000,
        status: "pendente",
        data: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        telefone: "+244 927 123 456",
      },
      {
        id: "ENC002",
        cliente: "Ana Costa",
        produto: "Kit Maquiagem Profissional",
        valor: 45000,
        status: "processando",
        data: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        telefone: "+244 927 654 321",
      },
      {
        id: "ENC003",
        cliente: "Joana Santos",
        produto: "Peruca Loira Lisa",
        valor: 60000,
        status: "enviada",
        data: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        telefone: "+244 927 987 654",
      },
      {
        id: "ENC004",
        cliente: "Carla Pereira",
        produto: "Base Líquida Premium",
        valor: 25000,
        status: "entregue",
        data: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        telefone: "+244 927 456 789",
      },
    ];

    localStorage.setItem("encomendas", JSON.stringify(encomendas));
  }

  this.renderEncomendasTable(encomendas);
  this.updateEncomendasStats(encomendas);
};

AdminDashboard.prototype.renderEncomendasTable = function (encomendas) {
  const tbody = document.getElementById("encomendas-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (encomendas.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5>Nenhuma encomenda encontrada</h5>
                    <p class="text-muted">As encomendas aparecerão aqui quando forem realizadas</p>
                </td>
            </tr>
        `;
    return;
  }

  encomendas.forEach((encomenda) => {
    const row = document.createElement("tr");
    const statusClass = this.getStatusClass(encomenda.status);

    row.innerHTML = `
            <td>
                <strong>#${encomenda.id}</strong>
                <br><small class="text-muted">${this.formatDate(
                  encomenda.data
                )}</small>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2">
                        ${encomenda.cliente.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <strong>${encomenda.cliente}</strong>
                        ${
                          encomenda.telefone
                            ? `<br><small class="text-muted">${encomenda.telefone}</small>`
                            : ""
                        }
                    </div>
                </div>
            </td>
            <td>
                <span class="fw-bold">${encomenda.produto}</span>
                <br><small class="text-muted">Qtd: 1</small>
            </td>
            <td>
                <strong class="text-success">Kz ${this.formatCurrency(
                  encomenda.valor
                )}</strong>
            </td>
            <td>
                <span class="badge bg-${statusClass}">${this.getStatusText(
      encomenda.status
    )}</span>
            </td>
            <td>
                <small class="text-muted">${this.formatDate(
                  encomenda.data
                )}</small>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewEncomenda('${
                      encomenda.id
                    }')" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="updateEncomendaStatus('${
                      encomenda.id
                    }', 'processando')" title="Processar">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="updateEncomendaStatus('${
                      encomenda.id
                    }', 'enviada')" title="Enviar">
                        <i class="fas fa-shipping-fast"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="contactClient('${
                      encomenda.telefone
                    }')" title="Contactar">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </td>
        `;

    tbody.appendChild(row);
  });
};

AdminDashboard.prototype.updateEncomendasStats = function (encomendas) {
  const pendentes = encomendas.filter((e) => e.status === "pendente").length;
  const processando = encomendas.filter(
    (e) => e.status === "processando"
  ).length;
  const enviadas = encomendas.filter((e) => e.status === "enviada").length;
  const entregues = encomendas.filter((e) => e.status === "entregue").length;

  document.getElementById("pendentes-count").textContent = pendentes;
  document.getElementById("processando-count").textContent = processando;
  document.getElementById("enviadas-count").textContent = enviadas;
  document.getElementById("entregues-count").textContent = entregues;
};

AdminDashboard.prototype.getStatusClass = function (status) {
  const statusClasses = {
    pendente: "warning",
    processando: "info",
    enviada: "primary",
    entregue: "success",
    cancelada: "danger",
  };
  return statusClasses[status] || "secondary";
};

AdminDashboard.prototype.getStatusText = function (status) {
  const statusTexts = {
    pendente: "Pendente",
    processando: "Processando",
    enviada: "Enviada",
    entregue: "Entregue",
    cancelada: "Cancelada",
  };
  return statusTexts[status] || status;
};

AdminDashboard.prototype.loadClientes = function () {
  console.log("👥 Carregando clientes...");

  // Dados de exemplo para clientes
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  if (clientes.length === 0) {
    clientes = [
      {
        id: "CLI001",
        nome: "Maria Silva",
        email: "maria.silva@email.com",
        telefone: "+244 927 123 456",
        endereco: "Luanda, Ingombota",
        totalCompras: 2,
        valorTotal: 95000,
        ultimaCompra: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        ativo: true,
      },
      {
        id: "CLI002",
        nome: "Ana Costa",
        email: "ana.costa@email.com",
        telefone: "+244 927 654 321",
        endereco: "Luanda, Maianga",
        totalCompras: 1,
        valorTotal: 45000,
        ultimaCompra: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        ativo: true,
      },
      {
        id: "CLI003",
        nome: "Joana Santos",
        email: "joana.santos@email.com",
        telefone: "+244 927 987 654",
        endereco: "Luanda, Viana",
        totalCompras: 3,
        valorTotal: 180000,
        ultimaCompra: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        ativo: true,
      },
    ];

    localStorage.setItem("clientes", JSON.stringify(clientes));
  }

  console.log(`✅ ${clientes.length} clientes carregados`);
};

// Funções globais adicionais
function updateEncomendaStatus(id, newStatus) {
  let encomendas = JSON.parse(localStorage.getItem("encomendas")) || [];
  const encomenda = encomendas.find((e) => e.id === id);

  if (encomenda) {
    encomenda.status = newStatus;
    encomenda.atualizadoEm = new Date().toISOString();
    localStorage.setItem("encomendas", JSON.stringify(encomendas));

    if (window.adminDashboard) {
      window.adminDashboard.loadEncomendas();
      window.adminDashboard.showNotification(
        `Encomenda ${id} atualizada para ${newStatus}!`,
        "success"
      );
    }
  }
}

function contactClient(telefone) {
  if (telefone) {
    const whatsappUrl = `https://wa.me/${telefone.replace(
      /\D/g,
      ""
    )}?text=Olá! Entrando em contacto sobre a sua encomenda na LisBeauty.`;
    window.open(whatsappUrl, "_blank");
  } else {
    if (window.adminDashboard) {
      window.adminDashboard.showNotification(
        "Número de telefone não disponível",
        "warning"
      );
    }
  }
}

// Inicializar dashboard quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dashboard-section")) {
    window.adminDashboard = new AdminDashboard();
    console.log("✅ AdminDashboard inicializado globalmente");
  }
});

// Completar a classe AdminDashboard (continuação)
AdminDashboard.prototype.showNotification = function (message, type = "info") {
  // Toast notification melhorado
  const toastContainer =
    document.getElementById("toast-container") || this.createToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
  toast.role = "alert";
  toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${this.getToastIcon(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

  toastContainer.appendChild(toast);

  // Auto-remove após 4 segundos
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 4000);
};

AdminDashboard.prototype.createToastContainer = function () {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "toast-container position-fixed top-0 end-0 p-3";
  container.style.zIndex = "9999";
  document.body.appendChild(container);
  return container;
};

AdminDashboard.prototype.getToastIcon = function (type) {
  const icons = {
    success: "check-circle",
    danger: "exclamation-triangle",
    warning: "exclamation-circle",
    info: "info-circle",
  };
  return icons[type] || "info-circle";
};

console.log("✅ admin-dashboard.js carregado completamente");
