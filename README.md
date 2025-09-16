# Dashboard Líder Interiores

Este projeto exibe um dashboard comparativo de produtos com filtros e um formulário de cadastro. Os dados são carregados do navegador e podem ser exportados em formatos CSV ou Excel.

## Persistência de dados

Os itens cadastrados são salvos automaticamente no `localStorage` do navegador utilizando a chave `dashboardProdutos`. Isso permite manter o histórico de cadastros entre sessões sem necessidade de backend.

### Limpando o banco local

Para limpar os itens cadastrados:

1. Abra o dashboard no navegador.
2. Acesse as ferramentas de desenvolvedor (geralmente `F12` ou `Ctrl+Shift+I`).
3. No painel **Application** (Chrome) ou **Armazenamento** (Firefox), localize o item **Local Storage**.
4. Selecione a origem correspondente ao site e remova a chave `dashboardProdutos` ou use a opção de limpar todo o armazenamento local.
5. Recarregue a página para restaurar os dados padrão.

## Scripts disponíveis

```bash
npm test
```

Executa os testes automatizados que validam a lógica de filtragem dos produtos.
