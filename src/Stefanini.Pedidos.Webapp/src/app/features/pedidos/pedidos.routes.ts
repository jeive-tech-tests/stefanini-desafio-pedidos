import { Routes } from '@angular/router';

export const PEDIDOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pedido-list/pedido-list.component').then((m) => m.PedidoListComponent),
    children: [
      {
        path: 'novo',
        loadComponent: () =>
          import('./pages/pedido-create/pedido-create.component').then(
            (m) => m.PedidoCreateComponent,
          ),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./pages/pedido-edit/pedido-edit.component').then((m) => m.PedidoEditComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/pedido-details/pedido-details.component').then(
            (m) => m.PedidoDetailsComponent,
          ),
      },
    ],
  },
];
