document.addEventListener("DOMContentLoaded", function () {
  // Obter ID do produto da URL
  const urlParams = new URLSearchParams(window.location.search);
  const produtoId = urlParams.get("id");

  if (!produtoId) {
    mostrarErro("Produto não encontrado.");
    return;
  }

  carregarProduto(produtoId);
});

function carregarProduto(produtoId) {
  // Simular carregamento
  setTimeout(() => {
    const produto = window.produtosData?.find((p) => p.id === produtoId);

    if (!produto) {
      mostrarErro("Produto não encontrado.");
      return;
    }

    exibirProduto(produto);
    carregarComentarios(produtoId);
    carregarProdutosRelacionados(produto.categoria);

    // Esconder loading e mostrar conteúdo
    document.getElementById("loading-container").style.display = "none";
    document.getElementById("produto-principal").style.display = "block";
    document.getElementById("secao-comentarios").style.display = "block";
    document.getElementById("produtos-relacionados").style.display = "block";

    // Incrementar visualizações
    incrementarVisualizacoes(produtoId);
  }, 1000);
}

function exibirProduto(produto) {
  // Atualizar breadcrumb
  document.getElementById("breadcrumb-produto").textContent = produto.nome;

  // Informações básicas
  document.getElementById("produto-nome").textContent = produto.nome;
  document.getElementById("produto-preco").textContent = `Kz ${formatarPreco(
    produto.preco
  )}`;
  document.getElementById("produto-categoria").textContent =
    produto.subcategoria;
  document.getElementById("produto-descricao").textContent = produto.descricao;
  document.getElementById("produto-visualizacoes").textContent = produto.clicks;

  // Especificações
  document.getElementById("spec-categoria").textContent = produto.categoria;
  document.getElementById("spec-subcategoria").textContent =
    produto.subcategoria;

  // Imagem principal
  document.getElementById("imagem-principal").src = produto.imagem;
  document.getElementById("imagem-principal").alt = produto.nome;

  // Configurar botões
  document.getElementById("btn-favorito").dataset.produtoId = produto.id;
  document.getElementById("btn-carrinho").onclick = () =>
    adicionarAoCarrinho(produto.id);
  document.getElementById("btn-comprar").onclick = () =>
    comprarAgora(produto.id);
  document.getElementById("btn-compartilhar").onclick = () =>
    compartilharProduto(produto.id);
  document.getElementById("btn-whatsapp").onclick = () =>
    contatarWhatsApp(produto);

  // Atualizar título da página
  document.title = `${produto.nome} | LisBeauty`;
}

function contatarWhatsApp(produto) {
  const mensagem = `Olá! Tenho interesse no produto: ${
    produto.nome
  } - Kz ${formatarPreco(produto.preco)}`;
  const url = `https://wa.me/244927194654?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

function compartilharProduto(produtoId) {
  if (navigator.share) {
    navigator.share({
      title: document.getElementById("produto-nome").textContent,
      text: "Confira este produto da LisBeauty!",
      url: window.location.href,
    });
  } else {
    // Fallback - copiar URL
    navigator.clipboard.writeText(window.location.href);
    mostrarNotificacao("Link copiado para a área de transferência!", "success");
  }
}

function carregarComentarios(produtoId) {
  // Simular comentários (substituir por dados reais)
  const comentarios = [
    {
      nome: "Maria Silva",
      estrelas: 5,
      comentario: "Produto excelente! Muito boa qualidade.",
      data: "2025-01-10",
    },
    {
      nome: "Ana Costa",
      estrelas: 4,
      comentario: "Gostei muito, recomendo!",
      data: "2025-01-08",
    },
  ];

  exibirComentarios(comentarios);
  calcularMediaAvaliacoes(comentarios);
}

function exibirComentarios(comentarios) {
  const container = document.getElementById("comentarios-lista");
  container.innerHTML = "";

  comentarios.forEach((comentario) => {
    const comentarioHTML = `
            <div class="comentario mb-3 p-3 border rounded">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${comentario.nome}</strong>
                        <div class="estrelas">${gerarEstrelas(
                          comentario.estrelas
                        )}</div>
                    </div>
                    <small class="text-muted">${formatarData(
                      comentario.data
                    )}</small>
                </div>
                <p class="mt-2 mb-0">${comentario.comentario}</p>
            </div>
        `;
    container.insertAdjacentHTML("beforeend", comentarioHTML);
  });
}

function gerarEstrelas(quantidade) {
  let estrelas = "";
  for (let i = 1; i <= 5; i++) {
    estrelas += i <= quantidade ? "⭐" : "☆";
  }
  return estrelas;
}

function mostrarErro(mensagem) {
  document.getElementById("loading-container").innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
            <h3 class="mt-3">Produto não encontrado</h3>
            <p>${mensagem}</p>
            <a href="index.html" class="btn btn-primary">Voltar ao Início</a>
        </div>
    `;
}

// Formulário de comentários
document
  .getElementById("comentario-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("comentario-nome").value;
    const estrelas = document.getElementById("comentario-estrelas").value;
    const texto = document.getElementById("comentario-texto").value;

    // Simular envio (substituir por lógica real)
    mostrarNotificacao("Comentário enviado com sucesso!", "success");
    this.reset();
  });
