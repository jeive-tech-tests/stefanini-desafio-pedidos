import { apiUrl } from './api-url';

describe('apiUrl', () => {
  let base: HTMLBaseElement;

  beforeEach(() => {
    base = document.createElement('base');
    document.head.appendChild(base);
  });

  afterEach(() => {
    base.remove();
  });

  it('mantém a API na raiz durante o desenvolvimento', () => {
    base.setAttribute('href', '/');

    expect(apiUrl('/pedidos')).toBe('/api/pedidos');
  });

  it('inclui o caminho-base no ambiente publicado', () => {
    base.setAttribute('href', '/stefanini-desafio-pedidos/');

    expect(apiUrl('produtos')).toBe('/stefanini-desafio-pedidos/api/produtos');
  });
});
