// Dashboard Application - Simplified Version
let produtos = [
    {
        id: 1,
        tipo: "Cadeira",
        mes: "Agosto",
        localizacao: "Belo Horizonte",
        otima: {
            nome: "Cadeira Executiva Premium",
            precoTabela: 50000.00,
            precoPromocional: 7500.00,
            percentualTabela: 95,
            percentualPromocional: 30,
            foto: null
        },
        concorrente: {
            nome: "Herman Miller Aeron",
            precoTabela: 11500.00,
            precoPromocional: 9250.00,
            percentualHacker: 90,
            percentualPromocional: 95,
            foto: null
        },
        pesquisador: "João Silva",
        diffPesquisa: "15%",
        record: "001"
    },
    {
        id: 2,
        tipo: "Poltrona",
        mes: "Agosto",
        localizacao: "São Paulo",
        otima: {
            nome: "Poltrona Reclinável Luxo",
            precoTabela: 35000.00,
            precoPromocional: 12500.00,
            percentualTabela: 88,
            percentualPromocional: 45,
            foto: null
        },
        concorrente: {
            nome: "La-Z-Boy Classic",
            precoTabela: 22000.00,
            precoPromocional: 18500.00,
            percentualHacker: 85,
            percentualPromocional: 92,
            foto: null
        },
        pesquisador: "Maria Santos",
        diffPesquisa: "8%",
        record: "002"
    },
    {
        id: 3,
        tipo: "Cadeira",
        mes: "Setembro",
        localizacao: "Belo Horizonte",
        otima: {
            nome: "Cadeira Gamer Pro",
            precoTabela: 28000.00,
            precoPromocional: 15800.00,
            percentualTabela: 82,
            percentualPromocional: 55,
            foto: null
        },
        concorrente: {
            nome: "DXRacer Formula",
            precoTabela: 19500.00,
            precoPromocional: 16200.00,
            percentualHacker: 78,
            percentualPromocional: 88,
            foto: null
        },
        pesquisador: "Pedro Costa",
        diffPesquisa: "22%",
        record: "003"
    }
];

const filtros = {
    tipos: ["Todos", "Cadeira", "Poltrona", "Banqueta", "Mesa"],
    meses: ["Todos", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    localizacoes: ["Todos", "Belo Horizonte", "São Paulo", "Rio de Janeiro", "Brasília"]
};

let currentProductIndex = 0;
let nextId = 4;

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function setupFilters() {
    console.log('Configurando filtros...');
    
    const tipoFilter = document.getElementById('tipoFilter');
    const mesFilter = document.getElementById('mesFilter');
    const localizacaoFilter = document.getElementById('localizacaoFilter');
    const modalTipo = document.getElementById('modalTipo');
    const modalMes = document.getElementById('modalMes');
    const modalLocalizacao = document.getElementById('modalLocalizacao');

    // Populate main filters
    if (tipoFilter) {
        tipoFilter.innerHTML = '<option value="Todos">Todos</option>';
        filtros.tipos.slice(1).forEach(tipo => {
            tipoFilter.innerHTML += `<option value="${tipo}">${tipo}</option>`;
        });
    }

    if (mesFilter) {
        mesFilter.innerHTML = '<option value="Todos">Todos</option>';
        filtros.meses.slice(1).forEach(mes => {
            mesFilter.innerHTML += `<option value="${mes}">${mes}</option>`;
        });
    }

    if (localizacaoFilter) {
        localizacaoFilter.innerHTML = '<option value="Todos">Todos</option>';
        filtros.localizacoes.slice(1).forEach(loc => {
            localizacaoFilter.innerHTML += `<option value="${loc}">${loc}</option>`;
        });
    }

    // Populate modal filters
    if (modalTipo) {
        modalTipo.innerHTML = '<option value="">Selecione...</option>';
        filtros.tipos.slice(1).forEach(tipo => {
            modalTipo.innerHTML += `<option value="${tipo}">${tipo}</option>`;
        });
    }

    if (modalMes) {
        modalMes.innerHTML = '<option value="">Selecione...</option>';
        filtros.meses.slice(1).forEach(mes => {
            modalMes.innerHTML += `<option value="${mes}">${mes}</option>`;
        });
    }

    if (modalLocalizacao) {
        modalLocalizacao.innerHTML = '<option value="">Selecione...</option>';
        filtros.localizacoes.slice(1).forEach(loc => {
            modalLocalizacao.innerHTML += `<option value="${loc}">${loc}</option>`;
        });
    }
}

function updateDisplay() {
    if (produtos.length === 0) return;

    const produto = produtos[currentProductIndex];
    
    // Update product names
    const otimaName = document.getElementById('otimaName');
    const concorrenteName = document.getElementById('concorrenteName');
    
    if (otimaName) otimaName.textContent = produto.otima.nome;
    if (concorrenteName) concorrenteName.textContent = produto.concorrente.nome;

    // Update product images
    updateProductImage('otimaImage', produto.otima.foto);
    updateProductImage('concorrenteImage', produto.concorrente.foto);

    // Update values
    updateValue('otimaPrecoTabela', formatCurrency(produto.otima.precoTabela));
    updateValue('otimaPrecoPromocional', formatCurrency(produto.otima.precoPromocional));
    updateValue('otimaPercentualTabela', produto.otima.percentualTabela + '%');
    updateValue('otimaPercentualPromocional', produto.otima.percentualPromocional + '%');

    updateValue('concorrentePrecoTabela', formatCurrency(produto.concorrente.precoTabela));
    updateValue('concorrentePrecoPromocional', formatCurrency(produto.concorrente.precoPromocional));
    updateValue('concorrentePercentualHacker', produto.concorrente.percentualHacker + '%');
    updateValue('concorrentePercentualPromocional', produto.concorrente.percentualPromocional + '%');
}

function updateValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function updateProductImage(imageId, src) {
    const imageElement = document.getElementById(imageId);
    if (!imageElement) return;

    if (src) {
        imageElement.innerHTML = `<img src="${src}" alt="Produto">`;
    } else {
        imageElement.innerHTML = `
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="camera-icon">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
            </svg>
        `;
    }
}

function navigateNext() {
    if (produtos.length === 0) return;
    currentProductIndex = (currentProductIndex + 1) % produtos.length;
    updateDisplay();
}

function navigatePrevious() {
    if (produtos.length === 0) return;
    currentProductIndex = currentProductIndex === 0 ? produtos.length - 1 : currentProductIndex - 1;
    updateDisplay();
}

function getFilteredProducts() {
    const tipoFilter = document.getElementById('tipoFilter');
    const mesFilter = document.getElementById('mesFilter');
    const localizacaoFilter = document.getElementById('localizacaoFilter');

    const tipoValue = tipoFilter ? tipoFilter.value : 'Todos';
    const mesValue = mesFilter ? mesFilter.value : 'Todos';
    const localizacaoValue = localizacaoFilter ? localizacaoFilter.value : 'Todos';

    return produtos.filter(produto => {
        return (tipoValue === 'Todos' || produto.tipo === tipoValue) &&
               (mesValue === 'Todos' || produto.mes === mesValue) &&
               (localizacaoValue === 'Todos' || produto.localizacao === localizacaoValue);
    });
}

function updateTable() {
    const filteredProducts = getFilteredProducts();
    const tbody = document.getElementById('tableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredProducts.forEach(produto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${produto.tipo}</td>
            <td>${produto.mes}</td>
            <td>${produto.localizacao}</td>
            <td>${produto.otima.nome}</td>
            <td>${produto.concorrente.nome}</td>
            <td class="diff-positive">${produto.diffPesquisa}</td>
            <td>${produto.pesquisador}</td>
            <td>${produto.record}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateExportInfo() {
    const filteredCount = getFilteredProducts().length;
    const exportInfo = document.getElementById('exportInfo');
    const itemCount = document.getElementById('itemCount');

    if (exportInfo) exportInfo.textContent = `${filteredCount} itens exportáveis`;
    if (itemCount) itemCount.textContent = `${produtos.length} ITENS`;
}

function applyFilters() {
    updateTable();
    updateExportInfo();
}

function openCadastroModal() {
    const modal = document.getElementById('cadastroModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeCadastroModal() {
    const modal = document.getElementById('cadastroModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        resetCadastroForm();
    }
}

function resetCadastroForm() {
    const form = document.getElementById('cadastroForm');
    if (form) form.reset();
    
    document.querySelectorAll('.upload-preview').forEach(preview => preview.remove());
    document.querySelectorAll('.upload-area').forEach(area => delete area.dataset.imageData);
}

function openExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function handleCadastro(e) {
    e.preventDefault();
    
    const uploadOtima = document.getElementById('uploadOtima');
    const uploadConcorrente = document.getElementById('uploadConcorrente');

    const novoProduto = {
        id: nextId++,
        tipo: document.getElementById('modalTipo').value,
        mes: document.getElementById('modalMes').value,
        localizacao: document.getElementById('modalLocalizacao').value,
        pesquisador: document.getElementById('modalPesquisador').value,
        otima: {
            nome: document.getElementById('modalOtimaNome').value,
            precoTabela: parseFloat(document.getElementById('modalOtimaPrecoTabela').value),
            precoPromocional: parseFloat(document.getElementById('modalOtimaPrecoPromocional').value),
            percentualTabela: parseInt(document.getElementById('modalOtimaPercentualTabela').value),
            percentualPromocional: parseInt(document.getElementById('modalOtimaPercentualPromocional').value),
            foto: uploadOtima ? uploadOtima.dataset.imageData || null : null
        },
        concorrente: {
            nome: document.getElementById('modalConcorrenteNome').value,
            precoTabela: parseFloat(document.getElementById('modalConcorrentePrecoTabela').value),
            precoPromocional: parseFloat(document.getElementById('modalConcorrentePrecoPromocional').value),
            percentualHacker: parseInt(document.getElementById('modalConcorrentePercentualHacker').value),
            percentualPromocional: parseInt(document.getElementById('modalConcorrentePercentualPromocional').value),
            foto: uploadConcorrente ? uploadConcorrente.dataset.imageData || null : null
        },
        diffPesquisa: document.getElementById('modalDiffPesquisa').value + '%',
        record: String(nextId - 1).padStart(3, '0')
    };

    produtos.push(novoProduto);
    updateTable();
    updateExportInfo();
    closeCadastroModal();
    
    showSuccessMessage('Item cadastrado com sucesso!');
}

function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'status-message success';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function handleExport(format) {
    const filteredProducts = getFilteredProducts();
    
    if (filteredProducts.length === 0) {
        alert('Nenhum item para exportar com os filtros aplicados.');
        return;
    }

    if (format === 'csv') {
        exportToCSV(filteredProducts);
    } else if (format === 'excel') {
        exportToExcel(filteredProducts);
    }
    
    closeExportModal();
}

function exportToCSV(products) {
    const headers = [
        'Tipo', 'Mês', 'Localização', 'Produto Ótimo', 'Preço Tabela Ótimo', 'Preço Promocional Ótimo',
        '% Tabela Ótimo', '% Promocional Ótimo', 'Concorrente', 'Preço Tabela Concorrente', 
        'Preço Promocional Concorrente', '% Hacker', '% Promocional Concorrente', 'Diff Pesquisa', 
        'Pesquisador', 'Record'
    ];

    let csv = headers.join(',') + '\n';

    products.forEach(produto => {
        const row = [
            produto.tipo,
            produto.mes,
            produto.localizacao,
            `"${produto.otima.nome}"`,
            produto.otima.precoTabela,
            produto.otima.precoPromocional,
            produto.otima.percentualTabela,
            produto.otima.percentualPromocional,
            `"${produto.concorrente.nome}"`,
            produto.concorrente.precoTabela,
            produto.concorrente.precoPromocional,
            produto.concorrente.percentualHacker,
            produto.concorrente.percentualPromocional,
            produto.diffPesquisa,
            `"${produto.pesquisador}"`,
            produto.record
        ];
        csv += row.join(',') + '\n';
    });

    downloadFile(csv, 'analise_produtos.csv', 'text/csv');
}

function exportToExcel(products) {
    const headers = [
        'Tipo', 'Mês', 'Localização', 'Produto Ótimo', 'Preço Tabela Ótimo', 'Preço Promocional Ótimo',
        '% Tabela Ótimo', '% Promocional Ótimo', 'Concorrente', 'Preço Tabela Concorrente', 
        'Preço Promocional Concorrente', '% Hacker', '% Promocional Concorrente', 'Diff Pesquisa', 
        'Pesquisador', 'Record'
    ];

    let tsv = headers.join('\t') + '\n';

    products.forEach(produto => {
        const row = [
            produto.tipo,
            produto.mes,
            produto.localizacao,
            produto.otima.nome,
            produto.otima.precoTabela,
            produto.otima.precoPromocional,
            produto.otima.percentualTabela,
            produto.otima.percentualPromocional,
            produto.concorrente.nome,
            produto.concorrente.precoTabela,
            produto.concorrente.precoPromocional,
            produto.concorrente.percentualHacker,
            produto.concorrente.percentualPromocional,
            produto.diffPesquisa,
            produto.pesquisador,
            produto.record
        ];
        tsv += row.join('\t') + '\n';
    });

    downloadFile(tsv, 'analise_produtos.xlsx', 'application/vnd.ms-excel');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

function setupUploadArea(uploadId) {
    const uploadArea = document.getElementById(uploadId);
    if (!uploadArea) return;

    const fileInput = uploadArea.querySelector('input[type="file"]');
    if (!fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0], uploadArea);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0], uploadArea);
        }
    });
}

function handleFileUpload(file, uploadArea) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        showImagePreview(e.target.result, uploadArea);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(src, uploadArea) {
    const existingPreview = uploadArea.querySelector('.upload-preview');
    if (existingPreview) {
        existingPreview.remove();
    }

    const preview = document.createElement('div');
    preview.className = 'upload-preview';
    preview.innerHTML = `
        <img src="${src}" alt="Preview">
        <button type="button" class="upload-remove" onclick="this.parentElement.remove()">×</button>
    `;

    uploadArea.appendChild(preview);
    uploadArea.dataset.imageData = src;
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando dashboard...');
    
    // Setup filters
    setupFilters();
    
    // Setup event listeners
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const cadastrarBtn = document.getElementById('cadastrarBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', navigatePrevious);
    if (nextBtn) nextBtn.addEventListener('click', navigateNext);
    if (cadastrarBtn) cadastrarBtn.addEventListener('click', openCadastroModal);
    if (exportBtn) exportBtn.addEventListener('click', openExportModal);
    
    // Filter change events
    const tipoFilter = document.getElementById('tipoFilter');
    const mesFilter = document.getElementById('mesFilter');
    const localizacaoFilter = document.getElementById('localizacaoFilter');
    
    if (tipoFilter) tipoFilter.addEventListener('change', applyFilters);
    if (mesFilter) mesFilter.addEventListener('change', applyFilters);
    if (localizacaoFilter) localizacaoFilter.addEventListener('change', applyFilters);
    
    // Modal events
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const exportModalCloseBtn = document.getElementById('exportModalCloseBtn');
    const cadastroForm = document.getElementById('cadastroForm');
    
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCadastroModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeCadastroModal);
    if (exportModalCloseBtn) exportModalCloseBtn.addEventListener('click', closeExportModal);
    if (cadastroForm) cadastroForm.addEventListener('submit', handleCadastro);
    
    // Export option events
    document.querySelectorAll('.export-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleExport(e.currentTarget.dataset.format);
        });
    });
    
    // Modal backdrop clicks
    const cadastroModal = document.getElementById('cadastroModal');
    const exportModal = document.getElementById('exportModal');
    
    if (cadastroModal) {
        cadastroModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                closeCadastroModal();
            }
        });
    }
    
    if (exportModal) {
        exportModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                closeExportModal();
            }
        });
    }
    
    // Setup upload areas
    setupUploadArea('uploadOtima');
    setupUploadArea('uploadConcorrente');
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCadastroModal();
            closeExportModal();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigatePrevious();
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            navigateNext();
        }
    });
    
    // Initial display update
    updateDisplay();
    updateTable();
    updateExportInfo();
    
    console.log('Dashboard inicializado com sucesso!');
});