// Sistema Principal da LisBeauty
class LisBeautyApp {
  constructor() {
    this.produtos = [];
    this.carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    this.favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    this.filtros = {
      categoria: "",
      subcategoria: "",
      precoMax: 100000,
      ordenacao: "relevance",
      busca: "",
    };

    this.init();
  }

  init() {
    this.showLoadingScreen();
    this.initializeData();
    this.setupEventListeners();
    this.updateCarrinhoCounter();
    this.updateNavbarAuth();
    this.hideLoadingScreen();
  }

  showLoadingScreen() {
    document.getElementById("loading-screen").style.display = "flex";
  }

  hideLoadingScreen() {
    setTimeout(() => {
      document.getElementById("loading-screen").style.display = "none";
    }, 1500);
  }

  initializeData() {
    // Produtos de exemplo expandidos
    const produtosExemplo = [
      {
        id: "1",
        nome: "Peruca Lace Front Castanha",
        descricao: "Cabelo humano natural, 50cm, cor castanha",
        preco: 50000,
        imagem: "./img/uploads/peruca1.jpg",
        categoria: "Perucas",
        subcategoria: "Lace Front",
        clicks: 12,
        criadoEm: "2025-01-10",
        tags: ["cabelo", "natural", "castanha", "lace", "front"],
      },
      {
        id: "2",
        nome: "Peruca Loira Lisa",
        descricao: "Cabelo humano 100%, 60cm, loira platinada",
        preco: 60000,
        imagem: "./img/uploads/peruca2.jpg",
        categoria: "Perucas",
        subcategoria: "Full Lace",
        clicks: 25,
        criadoEm: "2025-01-08",
        tags: ["loira", "lisa", "platinada", "full", "lace"],
      },
      {
        id: "3",
        nome: "Peruca Cacheada Preta",
        descricao: "Cabelo cacheado natural, 55cm, textura afro",
        preco: 55000,
        imagem: "./img/uploads/peruca3.jpg",
        categoria: "Perucas",
        subcategoria: "Lace Front",
        clicks: 18,
        criadoEm: "2025-01-12",
        tags: ["cacheada", "preta", "afro", "natural", "textura"],
      },
      {
        id: "4",
        nome: "Kit Maquiagem Profissional",
        descricao: "Kit completo para maquilhagem profissional",
        preco: 45000,
        imagem: "./img/uploads/makeup1.jpg",
        categoria: "MakeUp",
        subcategoria: "Kits",
        clicks: 8,
        criadoEm: "2025-01-14",
        tags: ["maquiagem", "kit", "profissional", "completo"],
      },
      {
        id: "5",
        nome: "Base Líquida Premium",
        descricao: "Base de alta cobertura, diversos tons",
        preco: 25000,
        imagem: "./img/uploads/makeup2.jpg",
        categoria: "MakeUp",
        subcategoria: "Base",
        clicks: 15,
        criadoEm: "2025-01-11",
        tags: ["base", "líquida", "cobertura", "tons"],
      },
      {
        id: "6",
        nome: "Peruca Bob Ruiva",
        descricao: "Corte moderno bob, cor ruiva intensa, 35cm",
        preco: 48000,
        imagem: "./img/uploads/peruca4.jpg",
        categoria: "Perucas",
        subcategoria: "Lace Front",
        clicks: 22,
        criadoEm: "2025-01-09",
        tags: ["bob", "ruiva", "moderno", "curto"],
      },
    ];

    // Salvar produtos se não existirem
    const existingProducts = localStorage.getItem("produtosData");
    if (!existingProducts) {
      localStorage.setItem("produtosData", JSON.stringify(produtosExemplo));
    }

    this.produtos =
      JSON.parse(localStorage.getItem("produtosData")) || produtosExemplo;
    window.produtosData = this.produtos;

    // Renderizar produtos iniciais
    this.renderProductsWithLoading();
  }

  setupEventListeners() {
    // Busca
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");

    searchInput?.addEventListener(
      "input",
      debounce(() => {
        this.handleSearchInput();
      }, 300)
    );

    searchInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.performSearch();
      }
    });

    searchBtn?.addEventListener("click", () => {
      this.performSearch();
    });

    // Filtros
    document
      .getElementById("filter-category")
      ?.addEventListener("change", (e) => {
        this.filtros.categoria = e.target.value;
        this.updateSubcategories();
        this.applyFilters();
      });

    document
      .getElementById("filter-subcategory")
      ?.addEventListener("change", (e) => {
        this.filtros.subcategoria = e.target.value;
        this.applyFilters();
      });

    document.getElementById("filter-price")?.addEventListener("input", (e) => {
      this.filtros.precoMax = parseInt(e.target.value);
      document.getElementById(
        "price-display"
      ).textContent = `Kz ${this.formatCurrency(this.filtros.precoMax)}`;
      this.applyFilters();
    });

    document.getElementById("filter-sort")?.addEventListener("change", (e) => {
      this.filtros.ordenacao = e.target.value;
      this.applyFilters();
    });

    // Botão voltar ao topo
    const backToTop = document.getElementById("back-to-top");
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        backToTop.style.display = "block";
      } else {
        backToTop.style.display = "none";
      }
    });

    backToTop?.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    // Smooth scrolling para âncoras
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  renderProductsWithLoading() {
    // Mostrar loading states
    document.getElementById("destaque-loading").style.display = "block";
    document.getElementById("recentes-loading").style.display = "block";

    // Simular carregamento
    setTimeout(() => {
      this.renderProducts();
      document.getElementById("destaque-loading").style.display = "none";
      document.getElementById("recentes-loading").style.display = "none";
    }, 1000);
  }

  renderProducts() {
    const produtosDestaque = document.getElementById("produtos-destaque");
    const produtosRecentes = document.getElementById("produtos-recentes");

    // Mais clicados (top 3)
    const maisClicados = [...this.produtos]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 3);

    // Mais recentes (top 3)
    const maisRecentes = [...this.produtos]
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
      .slice(0, 3);

    this.renderProductGrid(maisClicados, produtosDestaque);
    this.renderProductGrid(maisRecentes, produtosRecentes);
  }

  renderProductGrid(produtos, container) {
    if (!container) return;

    container.innerHTML = "";

    if (produtos.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-search fa-3x text-muted mb-3"></i>
          <h4>Nenhum produto encontrado</h4>
          <p class="text-muted">Tente ajustar os filtros ou faça uma nova busca</p>
        </div>
      `;
      return;
    }

    produtos.forEach((produto) => {
      const colDiv = document.createElement("div");
      colDiv.className = "col-lg-4 col-md-6 mb-4";

      const precoFormatado = this.formatCurrency(produto.preco);
      const isFavorito = this.favoritos.includes(produto.id);

      colDiv.innerHTML = `
        <div class="card h-100 produto-card shadow-sm" data-product-id="${
          produto.id
        }">
          <div class="position-relative">
            <img src="${produto.imagem}" class="card-img-top" alt="${
        produto.nome
      }" 
                 style="height: 300px; object-fit: cover;" loading="lazy"
                 onerror="this.src='img/placeholder.jpg'">
            
            <!-- Badges -->
            <div class="position-absolute top-0 start-0 p-2">
              ${
                produto.clicks > 20
                  ? '<span class="badge bg-success">Popular</span>'
                  : ""
              }
              ${
                this.isNewProduct(produto.criadoEm)
                  ? '<span class="badge bg-primary ms-1">Novo</span>'
                  : ""
              }
            </div>
            
            <!-- Botão Favorito -->
            <button class="btn btn-outline-danger btn-favorito position-absolute top-0 end-0 m-2" 
                    onclick="toggleFavorito('${
                      produto.id
                    }')" data-produto-id="${produto.id}">
              <i class="${isFavorito ? "fas" : "far"} fa-heart"></i>
            </button>
          </div>
          
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${produto.nome}</h5>
            <p class="card-text text-muted">${produto.descricao}</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <strong class="text-primary fs-5">Kz ${precoFormatado}</strong>
                <small class="text-muted">
                  <i class="fas fa-eye"></i> ${produto.clicks}
                </small>
              </div>
              <div class="d-grid gap-2">
                <button class="btn btn-primary" onclick="adicionarAoCarrinho('${
                  produto.id
                }')">
                  <i class="fas fa-shopping-cart"></i> Adicionar
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="verDetalhes('${
                  produto.id
                }')">
                  <i class="fas fa-eye"></i> Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Hover effects
      const card = colDiv.querySelector(".produto-card");
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px)";
        card.style.transition = "transform 0.3s ease";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });

      container.appendChild(colDiv);
    });
  }

  handleSearchInput() {
    const query = document.getElementById("search-input").value.trim();

    if (query.length >= 2) {
      this.showSearchSuggestions(query);
    } else {
      this.hideSearchSuggestions();
    }
  }

  showSearchSuggestions(query) {
    const suggestions = this.produtos
      .filter(
        (produto) =>
          produto.nome.toLowerCase().includes(query.toLowerCase()) ||
          produto.descricao.toLowerCase().includes(query.toLowerCase()) ||
          produto.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      )
      .slice(0, 5);

    const suggestionsContainer = document.getElementById("search-suggestions");

    if (suggestions.length === 0) {
      suggestionsContainer.innerHTML = `
        <div class="suggestion-item">
          <i class="fas fa-search text-muted"></i>
          <span>Nenhuma sugestão encontrada</span>
        </div>
      `;
    } else {
      suggestionsContainer.innerHTML = suggestions
        .map(
          (produto) => `
          <div class="suggestion-item" onclick="selectSuggestion('${
            produto.nome
          }')">
            <img src="${produto.imagem}" alt="${
            produto.nome
          }" class="suggestion-img">
            <div class="suggestion-text">
              <strong>${produto.nome}</strong>
              <small class="text-muted d-block">Kz ${this.formatCurrency(
                produto.preco
              )}</small>
            </div>
          </div>
        `
        )
        .join("");
    }

    suggestionsContainer.style.display = "block";
  }

  hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById("search-suggestions");
    suggestionsContainer.style.display = "none";
  }

  performSearch() {
    const query = document.getElementById("search-input").value.trim();

    if (!query) {
      this.showAllSections();
      return;
    }

    this.filtros.busca = query;
    this.hideSearchSuggestions();

    const resultados = this.produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(query.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(query.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(query.toLowerCase()) ||
        produto.subcategoria.toLowerCase().includes(query.toLowerCase()) ||
        produto.tags?.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    );

    this.showSearchResults(resultados, query);
    this.updateBreadcrumb(["Busca", query]);
  }

  showSearchResults(produtos, query) {
    // Esconder seções principais
    document.querySelector(".prod-destaque").style.display = "none";
    document.querySelector(".prod-recentes").style.display = "none";
    document.getElementById("sobre").style.display = "none";

    // Mostrar resultados e filtros
    document.getElementById("search-results").style.display = "block";
    document.getElementById("filtros-section").style.display = "block";
    document.getElementById("breadcrumb-container").style.display = "block";

    // Atualizar contador
    document.getElementById("search-results-count").textContent = `(${
      produtos.length
    } produto${produtos.length !== 1 ? "s" : ""} encontrado${
      produtos.length !== 1 ? "s" : ""
    })`;

    // Renderizar produtos
    this.renderProductGrid(
      produtos,
      document.getElementById("search-products-grid")
    );
  }

  applyFilters() {
    let produtosFiltrados = [...this.produtos];

    // Aplicar filtros
    if (this.filtros.categoria) {
      produtosFiltrados = produtosFiltrados.filter(
        (p) => p.categoria === this.filtros.categoria
      );
    }

    if (this.filtros.subcategoria) {
      produtosFiltrados = produtosFiltrados.filter(
        (p) => p.subcategoria === this.filtros.subcategoria
      );
    }

    if (this.filtros.precoMax < 100000) {
      produtosFiltrados = produtosFiltrados.filter(
        (p) => p.preco <= this.filtros.precoMax
      );
    }

    if (this.filtros.busca) {
      const query = this.filtros.busca.toLowerCase();
      produtosFiltrados = produtosFiltrados.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(query) ||
          produto.descricao.toLowerCase().includes(query) ||
          produto.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Aplicar ordenação
    switch (this.filtros.ordenacao) {
      case "price-asc":
        produtosFiltrados.sort((a, b) => a.preco - b.preco);
        break;
      case "price-desc":
        produtosFiltrados.sort((a, b) => b.preco - a.preco);
        break;
      case "name":
        produtosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case "popular":
        produtosFiltrados.sort((a, b) => b.clicks - a.clicks);
        break;
      case "recent":
        produtosFiltrados.sort(
          (a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)
        );
        break;
    }

    // Renderizar resultados
    this.renderProductGrid(
      produtosFiltrados,
      document.getElementById("search-products-grid")
    );

    // Atualizar contador
    document.getElementById("search-results-count").textContent = `(${
      produtosFiltrados.length
    } produto${produtosFiltrados.length !== 1 ? "s" : ""} encontrado${
      produtosFiltrados.length !== 1 ? "s" : ""
    })`;
  }

  updateSubcategories() {
    const categoria = this.filtros.categoria;
    const subcategorySelect = document.getElementById("filter-subcategory");

    if (!categoria) {
      subcategorySelect.innerHTML = '<option value="">Todas</option>';
      return;
    }

    const subcategorias = [
      ...new Set(
        this.produtos
          .filter((p) => p.categoria === categoria)
          .map((p) => p.subcategoria)
      ),
    ];

    subcategorySelect.innerHTML =
      '<option value="">Todas</option>' +
      subcategorias
        .map((sub) => `<option value="${sub}">${sub}</option>`)
        .join("");
  }

  updateBreadcrumb(items) {
    const breadcrumbList = document.getElementById("breadcrumb-list");
    breadcrumbList.innerHTML =
      '<li class="breadcrumb-item"><a href="index.html">Início</a></li>';

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const li = document.createElement("li");
      li.className = `breadcrumb-item ${isLast ? "active" : ""}`;

      if (isLast) {
        li.textContent = item;
        li.setAttribute("aria-current", "page");
      } else {
        li.innerHTML = `<a href="#" onclick="navigateTo('${item}')">${item}</a>`;
      }

      breadcrumbList.appendChild(li);
    });
  }

  // Sistema de Carrinho
  adicionarAoCarrinho(produtoId) {
    const produto = this.produtos.find((p) => p.id === produtoId);
    if (!produto) return;

    const itemExistente = this.carrinho.find((item) => item.id === produtoId);

    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      this.carrinho.push({
        ...produto,
        quantidade: 1,
      });
    }

    this.saveCarrinho();
    this.updateCarrinhoCounter();
    this.renderCarrinho();
    this.showNotification("Produto adicionado ao carrinho!", "success");
  }

  removeFromCarrinho(produtoId) {
    this.carrinho = this.carrinho.filter((item) => item.id !== produtoId);
    this.saveCarrinho();
    this.updateCarrinhoCounter();
    this.renderCarrinho();
  }

  updateQuantidade(produtoId, novaQuantidade) {
    const item = this.carrinho.find((item) => item.id === produtoId);
    if (item) {
      if (novaQuantidade <= 0) {
        this.removeFromCarrinho(produtoId);
      } else {
        item.quantidade = novaQuantidade;
        this.saveCarrinho();
        this.updateCarrinhoCounter();
        this.renderCarrinho();
      }
    }
  }

  renderCarrinho() {
    const container = document.getElementById("carrinho-items");
    const emptyState = document.getElementById("carrinho-empty");
    const footer = document.getElementById("carrinho-footer");

    if (this.carrinho.length === 0) {
      container.innerHTML = "";
      emptyState.style.display = "block";
      footer.style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    footer.style.display = "block";

    container.innerHTML = this.carrinho
      .map(
        (item) => `
      <div class="carrinho-item border-bottom pb-3 mb-3">
        <div class="row align-items-center">
          <div class="col-3">
            <img src="${item.imagem}" alt="${
          item.nome
        }" class="img-fluid rounded">
          </div>
          <div class="col-9">
            <h6 class="mb-1">${item.nome}</h6>
            <small class="text-muted">${item.categoria}</small>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div class="quantity-controls">
                <button class="btn btn-sm btn-outline-secondary" onclick="app.updateQuantidade('${
                  item.id
                }', ${item.quantidade - 1})">
                  <i class="fas fa-minus"></i>
                </button>
                <span class="mx-2">${item.quantidade}</span>
                <button class="btn btn-sm btn-outline-secondary" onclick="app.updateQuantidade('${
                  item.id
                }', ${item.quantidade + 1})">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div class="text-end">
                <div class="fw-bold">Kz ${this.formatCurrency(
                  item.preco * item.quantidade
                )}</div>
                <button class="btn btn-sm text-danger" onclick="app.removeFromCarrinho('${
                  item.id
                }')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // Atualizar total
    const total = this.carrinho.reduce(
      (sum, item) => sum + item.preco * item.quantidade,
      0
    );
    document.getElementById(
      "carrinho-total"
    ).textContent = `Kz ${this.formatCurrency(total)}`;
  }

  updateCarrinhoCounter() {
    const counter = document.getElementById("carrinho-count");
    const total = this.carrinho.reduce((sum, item) => sum + item.quantidade, 0);

    if (total > 0) {
      counter.textContent = total;
      counter.style.display = "inline";
    } else {
      counter.style.display = "none";
    }
  }

  saveCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(this.carrinho));
  }

  // Sistema de Favoritos
  toggleFavorito(produtoId) {
    const index = this.favoritos.indexOf(produtoId);

    if (index === -1) {
      this.favoritos.push(produtoId);
      this.showNotification("Produto adicionado aos favoritos!", "success");
    } else {
      this.favoritos.splice(index, 1);
      this.showNotification("Produto removido dos favoritos!", "info");
    }

    localStorage.setItem("favoritos", JSON.stringify(this.favoritos));
    this.updateFavoritoIcons();
  }

  updateFavoritoIcons() {
    document.querySelectorAll(".btn-favorito").forEach((btn) => {
      const produtoId = btn.dataset.produtoId;
      const isFavorito = this.favoritos.includes(produtoId);
      const icon = btn.querySelector("i");

      if (isFavorito) {
        icon.classList.remove("far");
        icon.classList.add("fas");
        btn.classList.remove("btn-outline-danger");
        btn.classList.add("btn-danger");
      } else {
        icon.classList.remove("fas");
        icon.classList.add("far");
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-outline-danger");
      }
    });
  }

  // Detalhes do Produto
  verDetalhes(produtoId) {
    // Incrementar cliques
    const produto = this.produtos.find((p) => p.id === produtoId);
    if (produto) {
      produto.clicks += 1;
      localStorage.setItem("produtosData", JSON.stringify(this.produtos));
    }

    // Redirecionar para página de detalhes
    window.location.href = `produto.html?id=${produtoId}`;
  }

  // Navegação
  showProductsSection(type) {
    if (type === "perucas") {
      this.filtros.categoria = "Perucas";
      document.getElementById("search-input").value = "perucas";
      this.performSearch();
    } else if (type === "makeup") {
      this.filtros.categoria = "MakeUp";
      document.getElementById("search-input").value = "maquiagem";
      this.performSearch();
    }
  }

  showAllProducts(section) {
    if (section === "destaque") {
      document.getElementById("search-input").value = "";
      this.filtros.ordenacao = "popular";
      this.performSearch();
    } else if (section === "recentes") {
      document.getElementById("search-input").value = "";
      this.filtros.ordenacao = "recent";
      this.performSearch();
    }
  }

  navigateTo(section) {
    // Implementar navegação baseada no breadcrumb
    console.log("Navigate to:", section);
  }

  // Autenticação
  updateNavbarAuth() {
    const authNavItem = document.getElementById("auth-nav-item");
    const authNavLink = document.getElementById("auth-nav-link");
    const authNavText = document.getElementById("auth-nav-text");

    if (!authNavItem || !authNavLink || !authNavText) return;

    const session =
      localStorage.getItem("adminSession") ||
      sessionStorage.getItem("adminSession");

    if (session) {
      const user = JSON.parse(session);
      authNavText.textContent = user.firstName;
      authNavLink.href = "admin/dashboard.html";

      // Adicionar dropdown de logout
      authNavItem.innerHTML = `
        <div class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
            <i class="fas fa-user-circle"></i> ${user.firstName}
          </a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="admin/dashboard.html">
              <i class="fas fa-tachometer-alt"></i> Dashboard
            </a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="logout()">
              <i class="fas fa-sign-out-alt"></i> Sair
            </a></li>
          </ul>
        </div>
      `;
    }
  }

  // Utilitários
  formatCurrency(amount) {
    return (amount / 100).toLocaleString("pt-AO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  isNewProduct(dateString) {
    const productDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - productDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Considerado novo se foi criado nos últimos 7 dias
  }

  showNotification(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3 show`;
    toast.style.zIndex = "9999";
    toast.innerHTML = `
      ${message}
      <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 4000);
  }
}

// Utilitários globais
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function hideCarouselLoading() {
  const loading = document.getElementById("carousel-loading");
  if (loading) {
    loading.style.display = "none";
  }
}

// Funções globais para compatibilidade
function adicionarAoCarrinho(produtoId) {
  if (window.app) {
    window.app.adicionarAoCarrinho(produtoId);
  }
}

function toggleFavorito(produtoId) {
  if (window.app) {
    window.app.toggleFavorito(produtoId);
  }
}

function verDetalhes(produtoId) {
  if (window.app) {
    window.app.verDetalhes(produtoId);
  }
}

function showProductsSection(type) {
  if (window.app) {
    window.app.showProductsSection(type);
  }
}

function showAllProducts(section) {
  if (window.app) {
    window.app.showAllProducts(section);
  }
}

function clearFilters() {
  if (window.app) {
    window.app.clearFilters();
  }
}

function finalizarCompra() {
  if (window.app) {
    window.app.finalizarCompra();
  }
}

function limparCarrinho() {
  if (window.app) {
    window.app.limparCarrinho();
  }
}

function logout() {
  if (window.authSystem) {
    window.authSystem.logout();
  }
}

// Inicializar aplicação
document.addEventListener("DOMContentLoaded", () => {
  window.app = new LisBeautyApp();
});
