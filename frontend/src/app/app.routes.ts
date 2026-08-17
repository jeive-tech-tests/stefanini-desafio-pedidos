import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pedidos',
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./features/pedidos/pedidos-list/pedidos-list').then(
        (component) => component.PedidosList,
      ),
  },
  {
    path: 'pedidos/novo',
    loadComponent: () =>
      import('./features/pedidos/pedido-form/pedido-form').then(
        (component) => component.PedidoForm,
      ),
  },
  {
    path: 'pedidos/:id/editar',
    loadComponent: () =>
      import('./features/pedidos/pedido-form/pedido-form').then(
        (component) => component.PedidoForm,
      ),
  },
  {
    path: '**',
    redirectTo: 'pedidos',
  },
];
