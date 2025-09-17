// Dashboard Application - Simplified Version
const STORAGE_KEY = 'dashboardProdutos';

function parsePercentageValue(rawValue) {
    if (rawValue === undefined || rawValue === null) {
        return null;
    }

    if (typeof rawValue === 'string') {
        const sanitized = rawValue.replace('%', '').replace(',', '.').trim();
        if (sanitized === '') {
            return null;
        }
        rawValue = sanitized;
    }

    const parsed = parseFloat(rawValue);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizePercentageValue(value) {
    const parsed = parsePercentageValue(value);
    if (parsed === null) {
        return null;
    }

    return Math.round(parsed * 10) / 10;
}

function calculateDiscountPercentage(precoTabela, precoPromocional) {
    const tabela = Number(precoTabela);
    const promocional = Number(precoPromocional);

    if (!Number.isFinite(tabela) || !Number.isFinite(promocional) || tabela <= 0) {
        return null;
    }

    const desconto = ((tabela - promocional) / tabela) * 100;
    return Number.isFinite(desconto) ? desconto : null;
}

function ensureProdutoDescontos(produto) {
    if (!produto) {
        return { descontoLider: null, descontoConcorrente: null };
    }

    const descontoLider = normalizePercentageValue(
        produto.descontoLider ?? calculateDiscountPercentage(produto.otima?.precoTabela, produto.otima?.precoPromocional)
    );
    const descontoConcorrente = normalizePercentageValue(
        produto.descontoConcorrente ?? calculateDiscountPercentage(produto.concorrente?.precoTabela, produto.concorrente?.precoPromocional)
    );

    produto.descontoLider = descontoLider;
    produto.descontoConcorrente = descontoConcorrente;

    if (Object.prototype.hasOwnProperty.call(produto, 'diffPesquisa')) {
        delete produto.diffPesquisa;
    }

    return { descontoLider, descontoConcorrente };
}

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
            foto: null
        },
        concorrente: {
            nome: "Herman Miller Aeron",
            precoTabela: 11500.00,
            precoPromocional: 9250.00,
            foto: null
        },
        pesquisador: "João Silva",
        descontoLider: normalizePercentageValue(calculateDiscountPercentage(50000.00, 7500.00)),
        descontoConcorrente: normalizePercentageValue(calculateDiscountPercentage(11500.00, 9250.00)),
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
            foto: null
        },
        concorrente: {
            nome: "La-Z-Boy Classic",
            precoTabela: 22000.00,
            precoPromocional: 18500.00,
            foto: null
        },
        pesquisador: "Maria Santos",
        descontoLider: normalizePercentageValue(calculateDiscountPercentage(35000.00, 12500.00)),
        descontoConcorrente: normalizePercentageValue(calculateDiscountPercentage(22000.00, 18500.00)),
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
            foto: null
        },
        concorrente: {
            nome: "DXRacer Formula",
            precoTabela: 19500.00,
            precoPromocional: 16200.00,
            foto: null
        },
        pesquisador: "Pedro Costa",
        descontoLider: normalizePercentageValue(calculateDiscountPercentage(28000.00, 15800.00)),
        descontoConcorrente: normalizePercentageValue(calculateDiscountPercentage(19500.00, 16200.00)),
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

function normalizeCsvHeaderValue(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '');
}

const csvFieldLabels = {
    tipo: 'Linha de Receita/Tipo',
    mes: 'Mês',
    ano: 'Ano',
    localizacao: 'Localização',
    pesquisador: 'Pesquisador',
    record: 'Record',
    otimaNome: 'Produto Líder',
    otimaPrecoTabela: 'Preço Tabela Líder',
    otimaPrecoPromocional: 'Preço Promocional Líder',
    concorrenteNome: 'Concorrente',
    concorrentePrecoTabela: 'Preço Tabela Concorrente',
    concorrentePrecoPromocional: 'Preço Promocional Concorrente'
};

const csvColumnAliases = {
    tipo: ['tipo', 'linhareceita', 'linha_receita', 'linha de receita'],
    mes: ['mes', 'mesref', 'mesreferencia'],
    ano: ['ano'],
    localizacao: ['localizacao', 'localidade', 'cidade'],
    pesquisador: ['pesquisador', 'responsavel', 'responsável'],
    record: ['record', 'codigo', 'código'],
    otimaNome: ['produtolider', 'produto lider', 'produtootima', 'produtoótima', 'lider'],
    otimaPrecoTabela: ['precotabelalider', 'preco tabela lider', 'precotabelaotima'],
    otimaPrecoPromocional: ['precopromocionallider', 'preco promocional lider', 'precopromocionalotima'],
    concorrenteNome: ['concorrente', 'produtoconcorrente'],
    concorrentePrecoTabela: ['precotabelaconcorrente', 'preco tabela concorrente'],
    concorrentePrecoPromocional: ['precopromocionalconcorrente', 'preco promocional concorrente']
};

const requiredCsvFields = [
    'tipo',
    'mes',
    'ano',
    'localizacao',
    'otimaNome',
    'otimaPrecoTabela',
    'otimaPrecoPromocional',
    'concorrenteNome',
    'concorrentePrecoTabela',
    'concorrentePrecoPromocional'
];

function parseCsvContent(text) {
    const sanitizedText = String(text || '').replace(/^\uFEFF/, '');
    const rows = [];
    let currentValue = '';
    let currentRow = [];
    let insideQuotes = false;

    for (let i = 0; i < sanitizedText.length; i++) {
        const char = sanitizedText[i];

        if (char === '"') {
            if (insideQuotes && sanitizedText[i + 1] === '"') {
                currentValue += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentValue);
            currentValue = '';
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
            if (char === '\r' && sanitizedText[i + 1] === '\n') {
                i++;
            }
            currentRow.push(currentValue);
            rows.push(currentRow);
            currentRow = [];
            currentValue = '';
        } else {
            currentValue += char;
        }
    }

    if (currentValue !== '' || currentRow.length) {
        currentRow.push(currentValue);
        rows.push(currentRow);
    }

    return rows.map(row => row.map(cell => String(cell || '').trim()));
}

function mapCsvColumns(headerRow) {
    const normalizedHeaderMap = {};

    headerRow.forEach((header, index) => {
        const normalized = normalizeCsvHeaderValue(header);
        if (!normalized) return;
        if (!normalizedHeaderMap[normalized]) {
            normalizedHeaderMap[normalized] = { index, header };
        }
    });

    const mapping = {};

    Object.entries(csvColumnAliases).forEach(([field, aliases]) => {
        for (const alias of aliases) {
            const normalizedAlias = normalizeCsvHeaderValue(alias);
            if (normalizedHeaderMap[normalizedAlias]) {
                mapping[field] = {
                    index: normalizedHeaderMap[normalizedAlias].index,
                    header: normalizedHeaderMap[normalizedAlias].header
                };
                break;
            }
        }
    });

    const missingFields = requiredCsvFields.filter(field => !mapping[field]);
    if (missingFields.length) {
        const missingLabels = missingFields.map(field => csvFieldLabels[field] || field);
        throw new Error(`Colunas obrigatórias ausentes: ${missingLabels.join(', ')}`);
    }

    return mapping;
}

function parseCsvNumber(rawValue, fieldLabel, rowNumber) {
    const sanitized = String(rawValue || '')
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .trim();

    if (!sanitized) {
        throw new Error(`O campo "${fieldLabel}" é obrigatório na linha ${rowNumber}.`);
    }

    const parsed = parseFloat(sanitized);
    if (!Number.isFinite(parsed)) {
        throw new Error(`Valor inválido para "${fieldLabel}" na linha ${rowNumber}.`);
    }

    return parsed;
}

function getCsvFieldValue(row, mapping, field) {
    if (!mapping[field]) return '';
    const value = row[mapping[field].index];
    return typeof value === 'string' ? value.trim() : String(value || '').trim();
}

function requireCsvFieldValue(row, mapping, field, rowNumber) {
    const value = getCsvFieldValue(row, mapping, field);
    if (!value) {
        throw new Error(`O campo "${csvFieldLabels[field] || field}" é obrigatório na linha ${rowNumber}.`);
    }
    return value;
}

function buildProdutoFromCsvRow(row, mapping, rowNumber, nextIdentifier) {
    const tipo = requireCsvFieldValue(row, mapping, 'tipo', rowNumber);
    const mes = requireCsvFieldValue(row, mapping, 'mes', rowNumber);
    const anoBruto = requireCsvFieldValue(row, mapping, 'ano', rowNumber);
    const anoNormalizado = normalizeAnoValue(anoBruto);

    if (anoNormalizado === null) {
        throw new Error(`Valor inválido para "${csvFieldLabels.ano}" na linha ${rowNumber}.`);
    }

    const localizacao = requireCsvFieldValue(row, mapping, 'localizacao', rowNumber);
    const pesquisador = getCsvFieldValue(row, mapping, 'pesquisador');
    const record = getCsvFieldValue(row, mapping, 'record');

    const otimaNome = requireCsvFieldValue(row, mapping, 'otimaNome', rowNumber);
    const otimaPrecoTabela = parseCsvNumber(
        requireCsvFieldValue(row, mapping, 'otimaPrecoTabela', rowNumber),
        csvFieldLabels.otimaPrecoTabela,
        rowNumber
    );
    const otimaPrecoPromocional = parseCsvNumber(
        requireCsvFieldValue(row, mapping, 'otimaPrecoPromocional', rowNumber),
        csvFieldLabels.otimaPrecoPromocional,
        rowNumber
    );

    const concorrenteNome = requireCsvFieldValue(row, mapping, 'concorrenteNome', rowNumber);
    const concorrentePrecoTabela = parseCsvNumber(
        requireCsvFieldValue(row, mapping, 'concorrentePrecoTabela', rowNumber),
        csvFieldLabels.concorrentePrecoTabela,
        rowNumber
    );
    const concorrentePrecoPromocional = parseCsvNumber(
        requireCsvFieldValue(row, mapping, 'concorrentePrecoPromocional', rowNumber),
        csvFieldLabels.concorrentePrecoPromocional,
        rowNumber
    );

    const novoProduto = {
        id: nextIdentifier,
        tipo,
        mes,
        ano: anoNormalizado,
        localizacao,
        pesquisador: pesquisador || '',
        otima: {
            nome: otimaNome,
            precoTabela: otimaPrecoTabela,
            precoPromocional: otimaPrecoPromocional,
            foto: null
        },
        concorrente: {
            nome: concorrenteNome,
            precoTabela: concorrentePrecoTabela,
            precoPromocional: concorrentePrecoPromocional,
            foto: null
        },
        record: record || String(nextIdentifier).padStart(3, '0')
    };

    ensureProdutoDescontos(novoProduto);

    return novoProduto;
}

function cloneProdutos(data) {
    return data.map(produto => {
        const { diffPesquisa, ...rest } = produto;
        const cloned = {
            ...rest,
            ano: normalizeAnoValue(produto.ano),
            otima: { ...(produto.otima || {}) },
            concorrente: { ...(produto.concorrente || {}) }
        };

        ensureProdutoDescontos(cloned);

        return cloned;
    });
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

function saveProdutos(produtosParaSalvar, { showFeedback = false } = {}) {
    if (typeof localStorage === 'undefined') {
        if (showFeedback) {
            showSuccessMessage('Dados atualizados apenas durante esta sessão.', { variant: 'success' });
        }
        return false;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(produtosParaSalvar));
        if (showFeedback) {
            showSuccessMessage('Dados salvos com sucesso!');
        }
        return true;
    } catch (error) {
        console.warn('Não foi possível salvar os produtos no armazenamento local.', error);
        showSuccessMessage('Não foi possível salvar os produtos no armazenamento local.', { variant: 'error' });
        return false;
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

const icFormatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
});

function calculateIcPercentage(liderPrice, concorrentePrice) {
    const lider = Number(liderPrice);
    const concorrente = Number(concorrentePrice);

    if (!Number.isFinite(lider) || !Number.isFinite(concorrente) || concorrente <= 0) {
        return null;
    }

    return (lider / concorrente) * 100;
}

function formatIc(value) {
    if (value === null) {
        return '—';
    }

    return `${icFormatter.format(value)}%`;
}

function formatPercentage(value, { emptyPlaceholder = '—', suffix = '%' } = {}) {
    const normalized = normalizePercentageValue(value);
    if (normalized === null) {
        return emptyPlaceholder;
    }

    return `${icFormatter.format(normalized)}${suffix}`;
}

const discountClassList = ['discount-high', 'discount-medium', 'discount-low', 'discount-neutral'];

function getDiscountClass(value) {
    const normalized = normalizePercentageValue(value);
    if (normalized === null) {
        return 'discount-neutral';
    }

    if (normalized >= 30) {
        return 'discount-high';
    }

    if (normalized <= 10) {
        return 'discount-low';
    }

    return 'discount-medium';
}

function createDiscountIndicatorMarkup(value) {
    return `<span class="discount-indicator ${getDiscountClass(value)}">${formatPercentage(value)}</span>`;
}

function updateDiscountIndicatorElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    element.classList.add('discount-indicator');
    discountClassList.forEach(cls => element.classList.remove(cls));
    element.classList.add(getDiscountClass(value));
    element.textContent = formatPercentage(value);
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

function refreshConcorrenteFilterOptions(preserveSelection = true, dataSource = produtos) {
    const concorrenteFilter = document.getElementById('concorrenteFilter');
    if (!concorrenteFilter) return;

    const currentValue = preserveSelection ? concorrenteFilter.value : 'Todos';
    const source = Array.isArray(dataSource) ? dataSource : produtos;
    const concorrentes = [...new Set(source.map(p => p.concorrente?.nome).filter(Boolean))];

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
        'otimaIcRegular',
        'otimaIcPromocional',
        'concorrentePrecoTabela',
        'concorrentePrecoPromocional',
        'concorrenteIcRegular',
        'concorrenteIcPromocional'
    ];

    valueFields.forEach(fieldId => updateValue(fieldId, '—'));
    updateProductImage('otimaImage', null);
    updateProductImage('concorrenteImage', null);
    updateDiscountIndicatorElement('otimaDescontoPolitica', null);
    updateDiscountIndicatorElement('concorrenteDesconto', null);
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
    const { descontoLider, descontoConcorrente } = ensureProdutoDescontos(produto);

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
    const icRegularLider = calculateIcPercentage(produto.otima.precoTabela, produto.concorrente.precoTabela);
    const icPromocionalLider = calculateIcPercentage(produto.otima.precoPromocional, produto.concorrente.precoPromocional);
    const icRegularConcorrente = calculateIcPercentage(produto.concorrente.precoTabela, produto.otima.precoTabela);
    const icPromocionalConcorrente = calculateIcPercentage(produto.concorrente.precoPromocional, produto.otima.precoPromocional);

    updateValue('otimaIcRegular', formatIc(icRegularLider));
    updateValue('otimaIcPromocional', formatIc(icPromocionalLider));

    updateValue('concorrentePrecoTabela', formatCurrency(produto.concorrente.precoTabela));
    updateValue('concorrentePrecoPromocional', formatCurrency(produto.concorrente.precoPromocional));
    updateValue('concorrenteIcRegular', formatIc(icRegularConcorrente));
    updateValue('concorrenteIcPromocional', formatIc(icPromocionalConcorrente));
    updateDiscountIndicatorElement('otimaDescontoPolitica', descontoLider);
    updateDiscountIndicatorElement('concorrenteDesconto', descontoConcorrente);
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
        const { descontoLider, descontoConcorrente } = ensureProdutoDescontos(produto);
        row.innerHTML = `
            <td>${produto.tipo}</td>
            <td>${periodo}</td>
            <td>${produto.localizacao}</td>
            <td>${produto.otima.nome}</td>
            <td>${produto.concorrente.nome}</td>
            <td>${createDiscountIndicatorMarkup(descontoLider)}</td>
            <td>${createDiscountIndicatorMarkup(descontoConcorrente)}</td>
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

function applyFilters({ showFeedback = false } = {}) {
    produtosFiltrados = getFilteredProducts();
    currentProductIndex = 0;
    updateDisplay();
    updateTable();
    updateExportInfo();
    if (showFeedback) {
        showSuccessMessage('Filtros aplicados com sucesso!');
    }
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
            document.getElementById('modalConcorrenteNome').value = produto.concorrente.nome;
            document.getElementById('modalConcorrentePrecoTabela').value = produto.concorrente.precoTabela;
            document.getElementById('modalConcorrentePrecoPromocional').value = produto.concorrente.precoPromocional;
        } else {
            editingProductId = null;
            resetCadastroForm();
        }

        updateModalICDisplay();
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

    updateModalICDisplay();
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

function getInputNumericValue(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const parsed = parseFloat(element.value);
    return Number.isFinite(parsed) ? parsed : null;
}

function updateModalICDisplay() {
    const otimaTabela = getInputNumericValue('modalOtimaPrecoTabela');
    const otimaPromocional = getInputNumericValue('modalOtimaPrecoPromocional');
    const concorrenteTabela = getInputNumericValue('modalConcorrentePrecoTabela');
    const concorrentePromocional = getInputNumericValue('modalConcorrentePrecoPromocional');

    updateValue('modalOtimaIcRegular', formatIc(calculateIcPercentage(otimaTabela, concorrenteTabela)));
    updateValue('modalOtimaIcPromocional', formatIc(calculateIcPercentage(otimaPromocional, concorrentePromocional)));
    updateValue('modalConcorrenteIcRegular', formatIc(calculateIcPercentage(concorrenteTabela, otimaTabela)));
    updateValue('modalConcorrenteIcPromocional', formatIc(calculateIcPercentage(concorrentePromocional, otimaPromocional)));
    updateDiscountIndicatorElement('modalOtimaDescontoPolitica', calculateDiscountPercentage(otimaTabela, otimaPromocional));
    updateDiscountIndicatorElement('modalConcorrenteDesconto', calculateDiscountPercentage(concorrenteTabela, concorrentePromocional));
}

function handleCadastro(e) {
    e.preventDefault();

    const uploadOtima = document.getElementById('uploadOtima');
    const uploadConcorrente = document.getElementById('uploadConcorrente');
    const anoInput = document.getElementById('modalAno');
    const anoValue = anoInput ? normalizeAnoValue(anoInput.value) : null;
    const otimaPrecoTabela = parseFloat(document.getElementById('modalOtimaPrecoTabela').value);
    const otimaPrecoPromocional = parseFloat(document.getElementById('modalOtimaPrecoPromocional').value);
    const concorrentePrecoTabela = parseFloat(document.getElementById('modalConcorrentePrecoTabela').value);
    const concorrentePrecoPromocional = parseFloat(document.getElementById('modalConcorrentePrecoPromocional').value);

    const produtoData = {
        tipo: document.getElementById('modalTipo').value,
        mes: document.getElementById('modalMes').value,
        ano: anoValue,
        localizacao: document.getElementById('modalLocalizacao').value,
        pesquisador: document.getElementById('modalPesquisador').value,
        otima: {
            nome: document.getElementById('modalOtimaNome').value,
            precoTabela: otimaPrecoTabela,
            precoPromocional: otimaPrecoPromocional,
            foto: uploadOtima ? uploadOtima.dataset.imageData || null : null
        },
        concorrente: {
            nome: document.getElementById('modalConcorrenteNome').value,
            precoTabela: concorrentePrecoTabela,
            precoPromocional: concorrentePrecoPromocional,
            foto: uploadConcorrente ? uploadConcorrente.dataset.imageData || null : null
        }
    };

    const descontoPolitica = calculateDiscountPercentage(otimaPrecoTabela, otimaPrecoPromocional);
    const descontoConcorrente = calculateDiscountPercentage(concorrentePrecoTabela, concorrentePrecoPromocional);

    produtoData.descontoLider = normalizePercentageValue(descontoPolitica);
    produtoData.descontoConcorrente = normalizePercentageValue(descontoConcorrente);

    ensureProdutoDescontos(produtoData);

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

function showSuccessMessage(message, { variant = 'success' } = {}) {
    if (typeof document === 'undefined') {
        const prefix = variant === 'error' ? '[ERRO]' : '[INFO]';
        console.log(`${prefix} ${message}`);
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${variant}`;
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

function handleImport(event) {
    const fileInput = event.target;
    const [file] = fileInput.files || [];

    if (!file) {
        return;
    }

    if (!/\.csv$/i.test(file.name)) {
        showSuccessMessage('Selecione um arquivo CSV válido.', { variant: 'error' });
        fileInput.value = '';
        return;
    }

    if (typeof FileReader === 'undefined') {
        showSuccessMessage('Importação de CSV não é suportada neste navegador.', { variant: 'error' });
        fileInput.value = '';
        return;
    }

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
        try {
            const content = loadEvent.target?.result;
            const rows = parseCsvContent(content);

            if (!rows.length) {
                throw new Error('O arquivo CSV está vazio.');
            }

            const [headerRow, ...dataRows] = rows;
            const filteredDataRows = dataRows.filter(row => row.some(cell => String(cell).trim() !== ''));

            if (!filteredDataRows.length) {
                throw new Error('Nenhum dado foi encontrado no arquivo CSV.');
            }

            const columnMapping = mapCsvColumns(headerRow);
            let tempNextId = nextId;
            const importedProdutos = filteredDataRows.map((row, index) => {
                const lineNumber = index + 2; // header is line 1
                const produto = buildProdutoFromCsvRow(row, columnMapping, lineNumber, tempNextId);
                tempNextId += 1;
                return produto;
            });

            if (!importedProdutos.length) {
                throw new Error('Nenhum item válido foi identificado no arquivo CSV.');
            }

            nextId = tempNextId;
            produtos = produtos.concat(importedProdutos);
            produtosFiltrados = produtos.slice();

            saveProdutos(produtos);
            refreshConcorrenteFilterOptions();
            refreshAnoFilterOptions();
            applyFilters();

            showSuccessMessage(`${importedProdutos.length} item(ns) importado(s) com sucesso!`);
        } catch (error) {
            console.error('Erro ao importar CSV:', error);
            const errorMessage = error instanceof Error ? error.message : 'Não foi possível importar o arquivo CSV.';
            showSuccessMessage(errorMessage, { variant: 'error' });
        } finally {
            fileInput.value = '';
        }
    };

    reader.onerror = () => {
        showSuccessMessage('Não foi possível ler o arquivo selecionado.', { variant: 'error' });
        fileInput.value = '';
    };

    reader.readAsText(file, 'utf-8');
}

function exportToCSV(products) {
    const headers = [
        'Tipo', 'Mês', 'Ano', 'Localização', 'Produto Lider', 'Preço Tabela Lider', 'Preço Promocional Lider',
        'IC REGULAR Lider', 'IC PROMOCIONAL Lider', 'Concorrente', 'Preço Tabela Concorrente',
        'Preço Promocional Concorrente', 'IC REGULAR Concorrente', 'IC PROMOCIONAL Concorrente',
        'Desconto Política (%)', 'Desconto Concorrente (%)',
        'Pesquisador', 'Record'
    ];

    let csv = headers.join(',') + '\n';

    products.forEach(produto => {
        const ano = normalizeAnoValue(produto.ano);
        const icRegularLider = calculateIcPercentage(produto.otima.precoTabela, produto.concorrente.precoTabela);
        const icPromocionalLider = calculateIcPercentage(produto.otima.precoPromocional, produto.concorrente.precoPromocional);
        const icRegularConcorrente = calculateIcPercentage(produto.concorrente.precoTabela, produto.otima.precoTabela);
        const icPromocionalConcorrente = calculateIcPercentage(produto.concorrente.precoPromocional, produto.otima.precoPromocional);
        const { descontoLider, descontoConcorrente } = ensureProdutoDescontos(produto);

        const row = [
            produto.tipo,
            produto.mes,
            ano !== null ? ano : '',
            produto.localizacao,
            `"${produto.otima.nome}"`,
            produto.otima.precoTabela,
            produto.otima.precoPromocional,
            formatIc(icRegularLider),
            formatIc(icPromocionalLider),
            `"${produto.concorrente.nome}"`,
            produto.concorrente.precoTabela,
            produto.concorrente.precoPromocional,
            formatIc(icRegularConcorrente),
            formatIc(icPromocionalConcorrente),
            formatPercentage(descontoLider, { emptyPlaceholder: '', suffix: '%' }),
            formatPercentage(descontoConcorrente, { emptyPlaceholder: '', suffix: '%' }),
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
        'IC REGULAR Lider', 'IC PROMOCIONAL Lider', 'Concorrente', 'Preço Tabela Concorrente',
        'Preço Promocional Concorrente', 'IC REGULAR Concorrente', 'IC PROMOCIONAL Concorrente',
        'Desconto Política (%)', 'Desconto Concorrente (%)',
        'Pesquisador', 'Record'
    ];

    let tsv = headers.join('\t') + '\n';

    products.forEach(produto => {
        const ano = normalizeAnoValue(produto.ano);
        const icRegularLider = calculateIcPercentage(produto.otima.precoTabela, produto.concorrente.precoTabela);
        const icPromocionalLider = calculateIcPercentage(produto.otima.precoPromocional, produto.concorrente.precoPromocional);
        const icRegularConcorrente = calculateIcPercentage(produto.concorrente.precoTabela, produto.otima.precoTabela);
        const icPromocionalConcorrente = calculateIcPercentage(produto.concorrente.precoPromocional, produto.otima.precoPromocional);
        const { descontoLider, descontoConcorrente } = ensureProdutoDescontos(produto);

        const row = [
            produto.tipo,
            produto.mes,
            ano !== null ? ano : '',
            produto.localizacao,
            produto.otima.nome,
            produto.otima.precoTabela,
            produto.otima.precoPromocional,
            formatIc(icRegularLider),
            formatIc(icPromocionalLider),
            produto.concorrente.nome,
            produto.concorrente.precoTabela,
            produto.concorrente.precoPromocional,
            formatIc(icRegularConcorrente),
            formatIc(icPromocionalConcorrente),
            formatPercentage(descontoLider, { emptyPlaceholder: '', suffix: '%' }),
            formatPercentage(descontoConcorrente, { emptyPlaceholder: '', suffix: '%' }),
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
    const importInput = document.getElementById('importInput');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', navigatePrevious);
    if (nextBtn) nextBtn.addEventListener('click', navigateNext);
    if (cadastrarBtn) cadastrarBtn.addEventListener('click', () => openCadastroModal());
    if (exportBtn) exportBtn.addEventListener('click', openExportModal);
    if (importInput) importInput.addEventListener('change', handleImport);
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

    ['modalOtimaPrecoTabela', 'modalOtimaPrecoPromocional', 'modalConcorrentePrecoTabela', 'modalConcorrentePrecoPromocional']
        .forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', updateModalICDisplay);
            }
        });

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
    updateModalICDisplay();

    console.log('Dashboard inicializado com sucesso!');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getFilteredProducts, produtos };
}