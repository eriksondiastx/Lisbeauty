// Sistema de Gestão de Produtos
class ProductManager {
  constructor() {
    this.produtos = JSON.parse(localStorage.getItem("produtosData")) || [];
    this.currentProduct = null;
    this.filtros = {
      categoria: "",
      status: "",
      busca: "",
    };
    this.init();
  }

  init() {
    console.log("📦 ProductManager: Inicializando...");
    this.setupEventListeners();
    this.loadProducts();
    this.setupImageUpload();
    this.updateProductStats();
  }

  setupEventListeners() {
    // Formulário de produto
    document.getElementById("produtoForm")?.addEventListener("submit", (e) => {
      this.handleProductSubmit(e);
    });

    // Filtros
    document.getElementById("buscar-produto")?.addEventListener(
      "input",
      this.debounce((e) => this.filterProducts(), 300)
    );

    document
      .getElementById("filtro-categoria")
      ?.addEventListener("change", () => {
        this.filterProducts();
      });

    document.getElementById("filtro-status")?.addEventListener("change", () => {
      this.filterProducts();
    });

    // Upload de imagem
    document
      .getElementById("produto-imagem")
      ?.addEventListener("change", (e) => {
        this.previewImage(e.target);
      });

    // Botão de exportar
    document
      .getElementById("exportar-produtos")
      ?.addEventListener("click", () => {
        this.exportProducts();
      });
  }

  loadProducts() {
    console.log("📦 Carregando produtos...");
    this.renderProductsTable();
    this.updateProductStats();
  }

  renderProductsTable() {
    const tbody = document.getElementById("produtos-tbody");
    if (!tbody) return;

    // Aplicar filtros
    let produtosFiltrados = this.applyFilters();

    tbody.innerHTML = "";

    if (produtosFiltrados.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                        <h5>Nenhum produto encontrado</h5>
                        <p class="text-muted">Adicione novos produtos ou ajuste os filtros</p>
                    </td>
                </tr>
            `;
      return;
    }

    produtosFiltrados.forEach((produto, index) => {
      const row = this.createProductRow(produto, index);
      tbody.appendChild(row);
    });

    // Atualizar contador
    document.getElementById("produtos-count").textContent =
      produtosFiltrados.length;
  }

  createProductRow(produto, index) {
    const row = document.createElement("tr");
    row.className = "produto-row";
    row.dataset.productId = produto.id;

    const statusClass = produto.ativo ? "success" : "secondary";
    const statusText = produto.ativo ? "Ativo" : "Inativo";
    const precoFormatado = this.formatCurrency(produto.preco);

    row.innerHTML = `
            <td>
                <img src="${produto.imagem}" alt="${produto.nome}" 
                     class="img-preview" 
                     onerror="this.src='../img/placeholder.jpg'">
                <div class="image-overlay">
                    <button class="btn btn-sm btn-primary" onclick="productManager.viewImageModal('${
                      produto.id
                    }')">
                        <i class="fas fa-search-plus"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="product-info">
                    <h6 class="mb-1">${produto.nome}</h6>
                    <small class="text-muted">${
                      produto.descricao || "Sem descrição"
                    }</small>
                    <div class="product-tags mt-1">
                        ${
                          produto.tags
                            ? produto.tags
                                .slice(0, 3)
                                .map(
                                  (tag) =>
                                    `<span class="badge bg-light text-dark">${tag}</span>`
                                )
                                .join(" ")
                            : ""
                        }
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-primary">${produto.categoria}</span>
                ${
                  produto.subcategoria
                    ? `<br><small class="text-muted">${produto.subcategoria}</small>`
                    : ""
                }
            </td>
            <td>
                <strong class="text-success">Kz ${precoFormatado}</strong>
                <br><small class="text-muted">ID: ${produto.id}</small>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-eye text-primary me-1"></i>
                    <span class="fw-bold">${produto.clicks || 0}</span>
                </div>
                <small class="text-muted">visualizações</small>
            </td>
            <td>
                <span class="badge bg-${statusClass}">${statusText}</span>
                <br><small class="text-muted">
                    ${
                      produto.criadoEm
                        ? this.formatDate(produto.criadoEm)
                        : "N/A"
                    }
                </small>
            </td>
            <td>
                <div class="btn-group-vertical" role="group">
                    <button class="btn btn-sm btn-outline-primary btn-action" 
                            onclick="productManager.editProduct('${
                              produto.id
                            }')"
                            title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-${
                      produto.ativo ? "warning" : "success"
                    } btn-action"
                            onclick="productManager.toggleStatus('${
                              produto.id
                            }')"
                            title="${produto.ativo ? "Desativar" : "Ativar"}">
                        <i class="fas fa-toggle-${
                          produto.ativo ? "on" : "off"
                        }"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info btn-action"
                            onclick="productManager.duplicateProduct('${
                              produto.id
                            }')"
                            title="Duplicar">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action"
                            onclick="productManager.deleteProduct('${
                              produto.id
                            }')"
                            title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

    // Adicionar hover effect
    row.addEventListener("mouseenter", () => {
      row.classList.add("table-hover-highlight");
    });

    row.addEventListener("mouseleave", () => {
      row.classList.remove("table-hover-highlight");
    });

    return row;
  }

  applyFilters() {
    let filtered = [...this.produtos];

    // Filtro de busca
    const searchTerm = document
      .getElementById("buscar-produto")
      ?.value.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(searchTerm) ||
          produto.descricao?.toLowerCase().includes(searchTerm) ||
          produto.categoria.toLowerCase().includes(searchTerm) ||
          produto.subcategoria?.toLowerCase().includes(searchTerm) ||
          produto.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro de categoria
    const categoria = document.getElementById("filtro-categoria")?.value;
    if (categoria) {
      filtered = filtered.filter((produto) => produto.categoria === categoria);
    }

    // Filtro de status
    const status = document.getElementById("filtro-status")?.value;
    if (status) {
      const isActive = status === "ativo";
      filtered = filtered.filter((produto) => produto.ativo === isActive);
    }

    return filtered;
  }

  filterProducts() {
    this.renderProductsTable();
  }

  handleProductSubmit(e) {
    e.preventDefault();
    console.log("📝 Enviando formulário de produto...");

    const formData = this.getFormData();

    if (!this.validateProductData(formData)) {
      return;
    }

    if (this.currentProduct) {
      this.updateProduct(formData);
    } else {
      this.createProduct(formData);
    }
  }

  getFormData() {
    const imageFile = document.getElementById("produto-imagem").files[0];

    return {
      nome: document.getElementById("produto-nome").value.trim(),
      categoria: document.getElementById("produto-categoria").value,
      subcategoria: document
        .getElementById("produto-subcategoria")
        .value.trim(),
      preco: parseFloat(document.getElementById("produto-preco").value) * 100, // centavos
      descricao: document.getElementById("produto-descricao").value.trim(),
      tags:
        document
          .getElementById("produto-tags")
          ?.value.split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag) || [],
      imagem: imageFile ? URL.createObjectURL(imageFile) : null,
      ativo: document.getElementById("produto-ativo")?.checked ?? true,
    };
  }

  validateProductData(data) {
    const errors = [];

    if (!data.nome) errors.push("Nome é obrigatório");
    if (!data.categoria) errors.push("Categoria é obrigatória");
    if (!data.preco || data.preco <= 0)
      errors.push("Preço deve ser maior que zero");
    if (data.nome.length < 3)
      errors.push("Nome deve ter pelo menos 3 caracteres");
    if (data.descricao && data.descricao.length > 500)
      errors.push("Descrição muito longa (máx. 500 caracteres)");

    if (errors.length > 0) {
      this.showAlert("Erros de validação:\n• " + errors.join("\n• "), "danger");
      return false;
    }

    return true;
  }

  createProduct(data) {
    const newProduct = {
      id: Date.now().toString(),
      ...data,
      imagem: data.imagem || "../img/placeholder.jpg",
      clicks: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      ativo: true,
    };

    this.produtos.push(newProduct);
    this.saveProducts();
    this.renderProductsTable();
    this.updateProductStats();
    this.closeModal();
    this.showAlert("Produto criado com sucesso!", "success");

    console.log("✅ Produto criado:", newProduct);
  }

  updateProduct(data) {
    const index = this.produtos.findIndex(
      (p) => p.id === this.currentProduct.id
    );

    if (index !== -1) {
      this.produtos[index] = {
        ...this.currentProduct,
        ...data,
        imagem: data.imagem || this.currentProduct.imagem,
        atualizadoEm: new Date().toISOString(),
      };

      this.saveProducts();
      this.renderProductsTable();
      this.updateProductStats();
      this.closeModal();
      this.showAlert("Produto atualizado com sucesso!", "success");

      console.log("✅ Produto atualizado:", this.produtos[index]);
    }
  }

  editProduct(productId) {
    const produto = this.produtos.find((p) => p.id === productId);
    if (!produto) return;

    this.currentProduct = produto;
    this.populateForm(produto);

    // Alterar título do modal
    document.querySelector("#produtoModal .modal-title").textContent =
      "Editar Produto";

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("produtoModal"));
    modal.show();
  }

  populateForm(produto) {
    document.getElementById("produto-nome").value = produto.nome;
    document.getElementById("produto-categoria").value = produto.categoria;
    document.getElementById("produto-subcategoria").value =
      produto.subcategoria || "";
    document.getElementById("produto-preco").value = (
      produto.preco / 100
    ).toFixed(2);
    document.getElementById("produto-descricao").value =
      produto.descricao || "";
    document.getElementById("produto-tags").value =
      produto.tags?.join(", ") || "";
    document.getElementById("produto-ativo").checked = produto.ativo;

    // Mostrar imagem atual
    if (produto.imagem) {
      this.showImagePreview(produto.imagem);
    }
  }

  toggleStatus(productId) {
    const produto = this.produtos.find((p) => p.id === productId);
    if (!produto) return;

    produto.ativo = !produto.ativo;
    produto.atualizadoEm = new Date().toISOString();

    this.saveProducts();
    this.renderProductsTable();

    const status = produto.ativo ? "ativado" : "desativado";
    this.showAlert(`Produto ${status} com sucesso!`, "info");
  }

  duplicateProduct(productId) {
    const produto = this.produtos.find((p) => p.id === productId);
    if (!produto) return;

    const duplicatedProduct = {
      ...produto,
      id: Date.now().toString(),
      nome: `${produto.nome} (Cópia)`,
      clicks: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    this.produtos.push(duplicatedProduct);
    this.saveProducts();
    this.renderProductsTable();
    this.updateProductStats();

    this.showAlert("Produto duplicado com sucesso!", "success");
  }

  deleteProduct(productId) {
    const produto = this.produtos.find((p) => p.id === productId);
    if (!produto) return;

    if (
      confirm(
        `Tem certeza que deseja excluir "${produto.nome}"?\n\nEsta ação não pode ser desfeita.`
      )
    ) {
      this.produtos = this.produtos.filter((p) => p.id !== productId);
      this.saveProducts();
      this.renderProductsTable();
      this.updateProductStats();

      this.showAlert("Produto excluído com sucesso!", "success");
    }
  }

  previewImage(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.showImagePreview(e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  showImagePreview(src) {
    let preview = document.getElementById("image-preview");
    if (!preview) {
      preview = document.createElement("div");
      preview.id = "image-preview";
      preview.className = "mt-2";
      document.getElementById("produto-imagem").parentNode.appendChild(preview);
    }

    preview.innerHTML = `
            <img src="${src}" alt="Preview" class="img-thumbnail" style="max-width: 200px;">
            <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="productManager.removeImagePreview()">
                <i class="fas fa-times"></i>
            </button>
        `;
  }

  removeImagePreview() {
    const preview = document.getElementById("image-preview");
    if (preview) {
      preview.remove();
    }
    document.getElementById("produto-imagem").value = "";
  }

  updateProductStats() {
    const totalProdutos = this.produtos.length;
    const produtosAtivos = this.produtos.filter((p) => p.ativo).length;
    const produtosInativos = totalProdutos - produtosAtivos;

    document.getElementById("total-produtos").textContent = totalProdutos;
    document.getElementById("produtos-ativos").textContent = produtosAtivos;
    document.getElementById("produtos-inativos").textContent = produtosInativos;

    // Atualizar badges na sidebar
    document.getElementById("produtos-count").textContent = totalProdutos;
  }

  closeModal() {
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("produtoModal")
    );
    modal.hide();
    this.resetForm();
    this.currentProduct = null;
  }

  resetForm() {
    document.getElementById("produtoForm").reset();
    document.querySelector("#produtoModal .modal-title").textContent =
      "Novo Produto";
    this.removeImagePreview();
  }

  exportProducts() {
    const dataStr = JSON.stringify(this.produtos, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `produtos_lisbeauty_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    this.showAlert("Produtos exportados com sucesso!", "success");
  }

  // Utilitários
  saveProducts() {
    localStorage.setItem("produtosData", JSON.stringify(this.produtos));
    // Atualizar referência global
    window.produtosData = this.produtos;
  }

  formatCurrency(amount) {
    return (amount / 100).toLocaleString("pt-AO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("pt-PT");
  }

  showAlert(message, type = "info") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = "80px";
    alertDiv.style.right = "20px";
    alertDiv.style.zIndex = "9999";
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.remove();
      }
    }, 5000);
  }

  debounce(func, wait) {
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
}

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("produtos-section")) {
    window.productManager = new ProductManager();
    console.log("✅ ProductManager inicializado");
  }
});
