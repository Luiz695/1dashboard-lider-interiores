const test = require('node:test');
const assert = require('node:assert');
const {JSDOM} = require('jsdom');

// Helper to load module with a given DOM
function loadWithDOM(domHtml) {
  const dom = new JSDOM(domHtml, { url: 'http://localhost' });
  dom.window.localStorage.clear();
  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  delete require.cache[require.resolve('../app.js')];
  return require('../app.js');
}

test('getFilteredProducts filters by linha de receita, month, year, and location', () => {
  const { getFilteredProducts } = loadWithDOM(`<!DOCTYPE html>
    <select id="linhaReceitaFilter"><option value="SOFÁ">SOFÁ</option></select>
    <select id="mesFilter"><option value="Agosto">Agosto</option></select>
    <select id="anoFilter"><option value="2023">2023</option></select>
    <select id="localizacaoFilter"><option value="Belo Horizonte">Belo Horizonte</option></select>`);
  const result = getFilteredProducts();
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 1);
});

test('getFilteredProducts returns all items when filters are Todos', () => {
  const { getFilteredProducts, produtos } = loadWithDOM(`<!DOCTYPE html>
    <select id="linhaReceitaFilter"><option value="Todos">Todos</option></select>
    <select id="mesFilter"><option value="Todos">Todos</option></select>
    <select id="anoFilter"><option value="Todos">Todos</option></select>
    <select id="localizacaoFilter"><option value="Todos">Todos</option></select>`);
  const result = getFilteredProducts();
  assert.strictEqual(result.length, produtos.length);
});

test('getFilteredProducts filters by competitor', () => {
  const { getFilteredProducts } = loadWithDOM(`<!DOCTYPE html>
    <select id="linhaReceitaFilter"><option value="Todos">Todos</option></select>
    <select id="mesFilter"><option value="Todos">Todos</option></select>
    <select id="anoFilter"><option value="Todos">Todos</option></select>
    <select id="localizacaoFilter"><option value="Todos">Todos</option></select>
    <select id="concorrenteFilter"><option value="Herman Miller Aeron">Herman Miller Aeron</option></select>`);
  const result = getFilteredProducts();
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].concorrente.nome, 'Herman Miller Aeron');
});

test('getFilteredProducts filters by year independently', () => {
  const { getFilteredProducts } = loadWithDOM(`<!DOCTYPE html>
    <select id="linhaReceitaFilter"><option value="Todos">Todos</option></select>
    <select id="mesFilter"><option value="Todos">Todos</option></select>
    <select id="anoFilter"><option value="2023">2023</option></select>
    <select id="localizacaoFilter"><option value="Todos">Todos</option></select>`);
  const result = getFilteredProducts();
  assert.strictEqual(result.length, 2);
  assert.ok(result.every(produto => produto.ano === 2023));
});
