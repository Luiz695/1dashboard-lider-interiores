// Dashboard Application - Simplified Version
const STORAGE_KEY = 'dashboardProdutos';

const defaultProdutos = [
    {
        id: 1,
        tipo: "Cadeira",
        mes: "Agosto",
        ano: 2023,
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
            percentualTabela: 90,
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
        ano: 2023,
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
            percentualTabela: 85,
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
        ano: 2024,
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
            percentualTabela: 78,
            percentualPromocional: 88,
            foto: null
        },
        pesquisador: "Pedro Costa",
        diffPesquisa: "22%",
        record: "003"
    }
];

function normalizeAnoValue(value) {
    if (value === undefined || value === null) {
        return null;
    }

    const parsed = parseInt(String(value).trim(), 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function cloneProdutos(data) {
    return data.map(produto => ({
        ...produto,
        ano: normalizeAnoValue(produto.ano),
        otima: { ...produto.otima },
        concorrente: { ...produto.concorrente }
    }));
}

function loadProdutos() {
    if (typeof localStorage !== 'undefined') {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return cloneProdutos(parsed);
                }
            }
        } catch (error) {
            console.warn('Não foi possível carregar os produtos do armazenamento local.', error);
        }
    }

    return cloneProdutos(defaultProdutos);
}

function saveProdutos(produtosParaSalvar) {
    if (typeof localStorage === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(produtosParaSalvar));
    } catch (error) {
        console.warn('Não foi possível salvar os produtos no armazenamento local.', error);
    }
}

let produtos = loadProdutos();
let produtosFiltrados = produtos.slice();

const filtros = {
    tipos: ["Todos", "Cadeira", "Poltrona", "Banqueta", "Mesa"],
    meses: ["Todos", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    localizacoes: ["Todos", "Belo Horizonte", "São Paulo", "Rio de Janeiro", "Brasília"]
};

let currentProductIndex = 0;
let nextId = produtos.reduce((max, produto) => Math.max(max, produto.id), 0) + 1;
let editingProductId = null;

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatPeriodo(produto) {
    const mes = typeof produto.mes === 'string' ? produto.mes.trim() : produto.mes;
    const ano = normalizeAnoValue(produto.ano);

    const hasMes = !!mes;
    const hasAno = ano !== null;

    if (hasMes && hasAno) {
        return `${mes} de ${ano}`;
    }

    if (hasMes) {
        return mes;
    }

    if (hasAno) {
        return String(ano);
    }

    return '--';
}

function setupFilters() {
    console.log('Configurando filtros...');

    const tipoFilter = document.getElementById('tipoFilter');
    const mesFilter = document.getElementById('mesFilter');
    const anoFilter = document.getElementById('anoFilter');
    const localizacaoFilter = document.getElementById('localizacaoFilter');
    const concorrenteFilter = document.getElementById('concorrenteFilter');
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

    if (anoFilter) {
        refreshAnoFilterOptions(false);
    }

    if (localizacaoFilter) {
        localizacaoFilter.innerHTML = '<option value="Todos">Todos</option>';
        filtros.localizacoes.slice(1).forEach(loc => {
            localizacaoFilter.innerHTML += `<option value="${loc}">${loc}</option>`;
        });
    }

    if (concorrenteFilter) {
        refreshConcorrenteFilterOptions(false);
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

function refreshConcorrenteFilterOptions(preserveSelection = true) {
    const concorrenteFilter = document.getElementById('concorrenteFilter');
    if (!concorrenteFilter) return;

    const currentValue = preserveSelection ? concorrenteFilter.value : 'Todos';
    const concorrentes = [...new Set(produtos.map(p => p.concorrente.nome))];

    concorrenteFilter.innerHTML = '<option value="Todos">Todos</option>';
    concorrentes.forEach(nome => {
        const option = document.createElement('option');
        option.value = nome;
        option.textContent = nome;
        concorrenteFilter.appendChild(option);
    });

    if (currentValue && (currentValue === 'Todos' || concorrentes.includes(currentValue))) {
        concorrenteFilter.value = currentValue;
    }
}

function refreshAnoFilterOptions(preserveSelection = true) {
    const anoFilter = document.getElementById('anoFilter');
    if (!anoFilter) return;

    const currentValue = preserveSelection ? anoFilter.value : 'Todos';
    const anos = produtos
        .map(produto => normalizeAnoValue(produto.ano))
        .filter(ano => ano !== null);

    const uniqueAnos = [...new Set(anos)].sort((a, b) => a - b);

    anoFilter.innerHTML = '<option value="Todos">Todos</option>';
    uniqueAnos.forEach(ano => {
        const option = document.createElement('option');
        option.value = String(ano);
        option.textContent = ano;
        anoFilter.appendChild(option);
    });

    const normalizedCurrent = currentValue === 'Todos' ? 'Todos' : String(normalizeAnoValue(currentValue));
    const availableValues = uniqueAnos.map(ano => String(ano));

    if (normalizedCurrent && (normalizedCurrent === 'Todos' || availableValues.includes(normalizedCurrent))) {
        anoFilter.value = normalizedCurrent;
    }
}

function getActiveProducts() {
    return Array.isArray(produtosFiltrados) ? produtosFiltrados : produtos;
}

function clearProductDisplay() {
    updateValue('otimaName', 'Nenhum produto selecionado');
    updateValue('concorrenteName', 'Nenhum concorrente selecionado');

    const valueFields = [
        'otimaPrecoTabela',
        'otimaPrecoPromocional',
        'otimaPercentualTabela',
        'otimaPercentualPromocional',
        'concorrentePrecoTabela',
        'concorrentePrecoPromocional',
        'concorrentePercentualTabela',
        'concorrentePercentualPromocional'
    ];

    valueFields.forEach(fieldId => updateValue(fieldId, '--'));
    updateProductImage('otimaImage', null);
    updateProductImage('concorrenteImage', null);
}

function updateDisplay() {
    const produtosAtivos = getActiveProducts();

    if (!produtosAtivos.length) {
        currentProductIndex = 0;
        clearProductDisplay();
        return;
    }

    if (currentProductIndex >= produtosAtivos.length) {
        currentProductIndex = 0;
    }

    const produto = produtosAtivos[currentProductIndex];

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
    updateValue('concorrentePercentualTabela', produto.concorrente.percentualTabela + '%');
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
    const produtosAtivos = getActiveProducts();
    if (!produtosAtivos.length) return;

    currentProductIndex = (currentProductIndex + 1) % produtosAtivos.length;
    updateDisplay();
}

function navigatePrevious() {
    const produtosAtivos = getActiveProducts();
    if (!produtosAtivos.length) return;

    currentProductIndex = currentProductIndex === 0 ? produtosAtivos.length - 1 : currentProductIndex - 1;
    updateDisplay();
}

function getFilteredProducts() {
    const tipoFilter = document.getElementById('tipoFilter');
    const mesFilter = document.getElementById('mesFilter');
    const anoFilter = document.getElementById('anoFilter');
    const localizacaoFilter = document.getElementById('localizacaoFilter');
    const concorrenteFilter = document.getElementById('concorrenteFilter');

    const tipoValue = tipoFilter ? tipoFilter.value : 'Todos';
    const mesValue = mesFilter ? mesFilter.value : 'Todos';
    const anoValue = anoFilter ? anoFilter.value : 'Todos';
    const localizacaoValue = localizacaoFilter ? localizacaoFilter.value : 'Todos';
    const concorrenteValue = concorrenteFilter ? concorrenteFilter.value : 'Todos';

    return produtos.filter(produto => {
        const produtoAno = normalizeAnoValue(produto.ano);
        return (tipoValue === 'Todos' || produto.tipo === tipoValue) &&
               (mesValue === 'Todos' || produto.mes === mesValue) &&
               (anoValue === 'Todos' || (produtoAno !== null && String(produtoAno) === anoValue)) &&
               (localizacaoValue === 'Todos' || produto.localizacao === localizacaoValue) &&
               (concorrenteValue === 'Todos' || produto.concorrente.nome === concorrenteValue);
    });
}

function updateTable() {
    const produtosAtivos = getActiveProducts();
    const tbody = document.getElementById('tableBody');

    if (!tbody) return;

    tbody.innerHTML = '';

    produtosAtivos.forEach(produto => {
        const row = document.createElement('tr');
        const periodo = formatPeriodo(produto);
        row.innerHTML = `
            <td>${produto.tipo}</td>
            <td>${periodo}</td>
            <td>${produto.localizacao}</td>
            <td>${produto.otima.nome}</td>
            <td>${produto.concorrente.nome}</td>
            <td class="diff-positive">${produto.diffPesquisa}</td>
            <td>${produto.pesquisador}</td>
            <td>${produto.record}</td>
            <td><button class="btn btn--outline btn--sm edit-btn" data-id="${produto.id}">Editar</button></td>
        `;
        tbody.appendChild(row);
    });
}

function updateExportInfo() {
    const filteredCount = getActiveProducts().length;
    const exportInfo = document.getElementById('exportInfo');
    const itemCount = document.getElementById('itemCount');

    if (exportInfo) exportInfo.textContent = `${filteredCount} itens exportáveis`;
    if (itemCount) itemCount.textContent = `${filteredCount} ITENS`;
}

function applyFilters() {
    produtosFiltrados = getFilteredProducts();
    currentProductIndex = 0;
    updateDisplay();
    updateTable();
    updateExportInfo();
}

function clearFilters() {
    const tipoFilter = document.getElementById('tipoFilter');
    const mesFilter = document.getElementById('mesFilter');
    const anoFilter = document.getElementById('anoFilter');
    const localizacaoFilter = document.getElementById('localizacaoFilter');
    const concorrenteFilter = document.getElementById('concorrenteFilter');

    if (tipoFilter) tipoFilter.value = 'Todos';
    if (mesFilter) mesFilter.value = 'Todos';
    if (anoFilter) anoFilter.value = 'Todos';
    if (localizacaoFilter) localizacaoFilter.value = 'Todos';
    if (concorrenteFilter) concorrenteFilter.value = 'Todos';

    applyFilters();
}

function openCadastroModal(produto = null) {
    const modal = document.getElementById('cadastroModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        if (produto) {
            editingProductId = produto.id;
            document.getElementById('modalTipo').value = produto.tipo;
            document.getElementById('modalMes').value = produto.mes;
            const modalAno = document.getElementById('modalAno');
            if (modalAno) {
                modalAno.value = produto.ano !== null && produto.ano !== undefined ? produto.ano : '';
            }
            document.getElementById('modalLocalizacao').value = produto.localizacao;
            document.getElementById('modalPesquisador').value = produto.pesquisador;
            document.getElementById('modalOtimaNome').value = produto.otima.nome;
            document.getElementById('modalOtimaPrecoTabela').value = produto.otima.precoTabela;
            document.getElementById('modalOtimaPrecoPromocional').value = produto.otima.precoPromocional;
            document.getElementById('modalOtimaPercentualTabela').value = produto.otima.percentualTabela;
            document.getElementById('modalOtimaPercentualPromocional').value = produto.otima.percentualPromocional;
            document.getElementById('modalConcorrenteNome').value = produto.concorrente.nome;
            document.getElementById('modalConcorrentePrecoTabela').value = produto.concorrente.precoTabela;
            document.getElementById('modalConcorrentePrecoPromocional').value = produto.concorrente.precoPromocional;
            document.getElementById('modalConcorrentePercentualTabela').value = produto.concorrente.percentualTabela;
            document.getElementById('modalConcorrentePercentualPromocional').value = produto.concorrente.percentualPromocional;
            document.getElementById('modalDiffPesquisa').value = parseFloat(produto.diffPesquisa);
        } else {
            editingProductId = null;
            resetCadastroForm();
        }
    }
}

function closeCadastroModal() {
    const modal = document.getElementById('cadastroModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        resetCadastroForm();
        editingProductId = null;
    }
}

function resetCadastroForm() {
    const form = document.getElementById('cadastroForm');
    if (form) form.reset();

    const modalAno = document.getElementById('modalAno');
    if (modalAno) modalAno.value = '';

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
    const anoInput = document.getElementById('modalAno');
    const anoValue = anoInput ? normalizeAnoValue(anoInput.value) : null;

    const produtoData = {
        tipo: document.getElementById('modalTipo').value,
        mes: document.getElementById('modalMes').value,
        ano: anoValue,
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
            percentualTabela: parseInt(document.getElementById('modalConcorrentePercentualTabela').value),
            percentualPromocional: parseInt(document.getElementById('modalConcorrentePercentualPromocional').value),
            foto: uploadConcorrente ? uploadConcorrente.dataset.imageData || null : null
        },
        diffPesquisa: document.getElementById('modalDiffPesquisa').value + '%'
    };

    if (editingProductId) {
        const index = produtos.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            produtos[index] = { id: editingProductId, record: produtos[index].record, ...produtoData };
        }
        showSuccessMessage('Item atualizado com sucesso!');
    } else {
        const novoProduto = { id: nextId++, record: String(nextId - 1).padStart(3, '0'), ...produtoData };
        produtos.push(novoProduto);
        showSuccessMessage('Item cadastrado com sucesso!');
    }

    saveProdutos(produtos);
    refreshConcorrenteFilterOptions();
    refreshAnoFilterOptions();
    applyFilters();
    closeCadastroModal();
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
    const filteredProducts = getActiveProducts();

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
        'Tipo', 'Mês', 'Ano', 'Localização', 'Produto Lider', 'Preço Tabela Lider', 'Preço Promocional Lider',
        'IC de % Tabela Lider', 'IC de % Promocional Lider', 'Concorrente', 'Preço Tabela Concorrente',
        'Preço Promocional Concorrente', 'IC de % Tabela Concorrente', 'IC de % Promocional Concorrente', 'Diff Pesquisa',
        'Pesquisador', 'Record'
    ];

    let csv = headers.join(',') + '\n';

    products.forEach(produto => {
        const ano = normalizeAnoValue(produto.ano);
        const row = [
            produto.tipo,
            produto.mes,
            ano !== null ? ano : '',
            produto.localizacao,
            `"${produto.otima.nome}"`,
            produto.otima.precoTabela,
            produto.otima.precoPromocional,
            produto.otima.percentualTabela,
            produto.otima.percentualPromocional,
            `"${produto.concorrente.nome}"`,
            produto.concorrente.precoTabela,
            produto.concorrente.precoPromocional,
            produto.concorrente.percentualTabela,
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
        'Tipo', 'Mês', 'Ano', 'Localização', 'Produto Lider', 'Preço Tabela Lider', 'Preço Promocional Lider',
        'IC de % Tabela Lider', 'IC de % Promocional Lider', 'Concorrente', 'Preço Tabela Concorrente',
        'Preço Promocional Concorrente', 'IC de % Tabela Concorrente', 'IC de % Promocional Concorrente', 'Diff Pesquisa',
        'Pesquisador', 'Record'
    ];

    let tsv = headers.join('\t') + '\n';

    products.forEach(produto => {
        const ano = normalizeAnoValue(produto.ano);
        const row = [
            produto.tipo,
            produto.mes,
            ano !== null ? ano : '',
            produto.localizacao,
            produto.otima.nome,
            produto.otima.precoTabela,
            produto.otima.precoPromocional,
            produto.otima.percentualTabela,
            produto.otima.percentualPromocional,
            produto.concorrente.nome,
            produto.concorrente.precoTabela,
            produto.concorrente.precoPromocional,
            produto.concorrente.percentualTabela,
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
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', navigatePrevious);
    if (nextBtn) nextBtn.addEventListener('click', navigateNext);
    if (cadastrarBtn) cadastrarBtn.addEventListener('click', () => openCadastroModal());
    if (exportBtn) exportBtn.addEventListener('click', openExportModal);
    if (applyFilterBtn) applyFilterBtn.addEventListener('click', applyFilters);
    if (clearFilterBtn) clearFilterBtn.addEventListener('click', clearFilters);

    // Edit button events
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const id = parseInt(e.target.dataset.id);
                const produto = produtos.find(p => p.id === id);
                if (produto) openCadastroModal(produto);
            }
        });
    }
    
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getFilteredProducts, produtos };
}