class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
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
        this.showSection('dashboard');
        
        // Inicializar gráficos
        this.initCharts();
    }

    checkAuth() {
        const session = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
        if (!session) {
            window.location.href = '../login.html';
            return false;
        }

        const user = JSON.parse(session);
        document.getElementById('admin-name').textContent = user.firstName;
        return true;
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar .nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('[data-section]').dataset.section;
                this.showSection(section);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('show');
        });

        // Forms
        document.getElementById('produtoForm')?.addEventListener('submit', (e) => {
            this.handleProdutoSubmit(e);
        });

        // Filters
        document.getElementById('buscar-produto')?.addEventListener('input', (e) => {
            this.filterProdutos(e.target.value);
        });

        document.getElementById('filtro-categoria')?.addEventListener('change', (e) => {
            this.filterProdutosByCategory(e.target.value);
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Update active nav
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        this.currentSection = sectionName;

        // Load section-specific data
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'produtos':
                this.loadProdutos();
                break;
            case 'encomendas':
                this.loadEncomendas();
                break;
            case 'clientes':
                this.loadClientes();
                break;
        }
    }

    loadDashboardData() {
        // Simular dados do dashboard
        const produtos = JSON.parse(localStorage.getItem('produtosData')) || [];
        const encomendas = JSON.parse(localStorage.getItem('encomendas')) || [];
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

        // Atualizar contadores
        document.getElementById('total-produtos').textContent = produtos.length;
        document.getElementById('produtos-count').textContent = produtos.length;
        document.getElementById('encomendas-count').textContent = encomendas.length;
        document.getElementById('clientes-count').textContent = clientes.length;
        document.getElementById('clientes-ativos').textContent = clientes.filter(c => c.ativo).length;

        // Calcular estatísticas do mês
        const thisMonth = new Date().getMonth();
        const encomendasMes = encomendas.filter(e => 
            new Date(e.data).getMonth() === thisMonth
        ).length;
        document.getElementById('encomendas-mes').textContent = encomendasMes;

        // Calcular receita
        const receitaMes = encomendas
            .filter(e => new Date(e.data).getMonth() === thisMonth && e.status === 'entregue')
            .reduce((total, e) => total + e.valor, 0);
        document.getElementById('receita-mes').textContent = `Kz ${this.formatCurrency(receitaMes)}`;

        // Atualizar produtos populares
        this.updateProdutosPopulares(produtos);

        // Atualizar encomendas recentes
        this.updateEncomendasRecentes(encomendas);
    }

    updateProdutosPopulares(produtos) {
        const produtosPopulares = produtos
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5);

        const container = document.getElementById('produtos-populares-list');
        container.innerHTML = '';

        produtosPopulares.forEach((produto, index) => {
            const item = document.createElement('div');
            item.className = 'd-flex align-items-center mb-3';
            item.innerHTML = `
                <div class="me-3">
                    <span class="badge bg-primary">${index + 1}</span>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0">${produto.nome}</h6>
                    <small class="text-muted">${produto.clicks} visualizações</small>
                </div>
                <div>
                    <span class="text-success">Kz ${this.formatCurrency(produto.preco)}</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateEncomendasRecentes(encomendas) {
        const encomendasRecentes = encomendas
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 10);

        const tbody = document.querySelector('#encomendas-recentes-table tbody');
        tbody.innerHTML = '';

        encomendasRecentes.forEach(encomenda => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${encomenda.id}</td>
                <td>${encomenda.cliente}</td>
                <td>${encomenda.produto}</td>
                <td>Kz ${this.formatCurrency(encomenda.valor)}</td>
                <td><span class="badge status-${encomenda.status}">${encomenda.status}</span></td>
                <td>${this.formatDate(encomenda.data)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewEncomenda('${encomenda.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadProdutos() {
        const produtos = JSON.parse(localStorage.getItem('produtosData')) || [];
        const tbody = document.getElementById('produtos-tbody');
        tbody.innerHTML = '';

        produtos.forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${produto.imagem}" alt="${produto.nome}" class="img-preview">
                </td>
                <td>
                    <strong>${produto.nome}</strong>
                    <br><small class="text-muted">${produto.descricao}</small>
                </td>
                <td>${produto.categoria}</td>
                <td>Kz ${this.formatCurrency(produto.preco)}</td>
                <td>${produto.clicks}</td>
                <td>
                    <span class="badge ${produto.ativo ? 'bg-success' : 'bg-secondary'}">
                        ${produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="editProduto('${produto.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteProduto('${produto.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info btn-action" onclick="toggleProdutoStatus('${produto.id}')">
                        <i class="fas fa-toggle-${produto.ativo ? 'on' : 'off'}"></i>
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
            nome: document.getElementById('produto-nome').value,
            categoria: document.getElementById('produto-categoria').value,
            subcategoria: document.getElementById('produto-subcategoria').value,
            preco: parseFloat(document.getElementById('produto-preco').value) * 100, // Convert to cents
            descricao: document.getElementById('produto-descricao').value,
            imagem: document.getElementById('produto-imagem').files[0] ? 
                   URL.createObjectURL(document.getElementById('produto-imagem').files[0]) : 
                   '../img/placeholder.jpg',
            clicks: 0,
            criadoEm: new Date().toISOString(),
            ativo: true
        };

        // Save to localStorage (simulating database)
        let produtos = JSON.parse(localStorage.getItem('produtosData')) || [];
        produtos.push(produtoData);
        localStorage.setItem('produtosData', JSON.stringify(produtos));

        // Update global products data
        if (window.produtosData) {
            window.produtosData.push(produtoData);
        }

        // Close modal and refresh
        const modal = bootstrap.Modal.getInstance(document.getElementById('produtoModal'));
        modal.hide();
        
        document.getElementById('produtoForm').reset();
        this.loadProdutos();
        this.showNotification('Produto adicionado com sucesso!', 'success');
    }

    initCharts() {
        // Sales Chart
        const ctx = document.getElementById('salesChart');
        if (ctx) {
            this.charts.sales = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Vendas',
                        data: [12, 19, 3, 5, 2, 3, 9],
                        borderColor: 'rgb(240, 140, 176)',
                        backgroundColor: 'rgba(240, 140, 176, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Utility functions
    formatCurrency(amount) {
        return (amount / 100).toLocaleString('pt-AO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-PT');
    }

    showNotification(message, type = 'info') {
        // Toast notification (implement as needed)
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        toast.style.zIndex = '9999';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global functions for button actions
function editProduto(id) {
    console.log('Edit produto:', id);
    // Implement edit functionality
}

function deleteProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        let produtos = JSON.parse(localStorage.getItem('produtosData')) || [];
        produtos = produtos.filter(p => p.id !== id);
        localStorage.setItem('produtosData', JSON.stringify(produtos));
        
        if (window.adminDashboard) {
            window.adminDashboard.loadProdutos();
            window.adminDashboard.
        
    