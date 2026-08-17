import { PEDIDOS_ROUTES } from './pedidos.routes';

describe('PEDIDOS_ROUTES', () => {
  it('mantém a listagem como rota pai das modais', () => {
    const listRoute = PEDIDOS_ROUTES.find((route) => route.path === '');

    expect(listRoute?.children?.map((route) => route.path)).toEqual(['novo', ':id/editar', ':id']);
  });
});
