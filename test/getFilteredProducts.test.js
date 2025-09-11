const test = require('node:test');
const assert = require('node:assert');
const {JSDOM} = require('jsdom');

// Helper to load module with a given DOM
function loadWithDOM(domHtml) {
  const dom = new JSDOM(domHtml);
  global.document = dom.window.document;
  return require('../app.js');
}

test('getFilteredProducts filters by type, month, and location', () => {
  const { getFilteredProducts } = loadWithDOM(`<!DOCTYPE html>
    <select id="tipoFilter"><option value="Cadeira">Cadeira</option></select>
    <select id="mesFilter"><option value="Agosto">Agosto</option></select>
    <select id="localizacaoFilter"><option value="Belo Horizonte">Belo Horizonte</option></select>`);
  const result = getFilteredProducts();
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 1);
});

test('getFilteredProducts returns all items when filters are Todos', () => {
  const { getFilteredProducts, produtos } = loadWithDOM(`<!DOCTYPE html>
    <select id="tipoFilter"><option value="Todos">Todos</option></select>
    <select id="mesFilter"><option value="Todos">Todos</option></select>
    <select id="localizacaoFilter"><option value="Todos">Todos</option></select>`);
  const result = getFilteredProducts();
  assert.strictEqual(result.length, produtos.length);
});
