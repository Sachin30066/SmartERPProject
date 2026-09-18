import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  {
    path: 'items',
    loadComponent: () =>
      import('./pages/items/items.component')
        .then(m => m.ItemsComponent)
  },

  {
    path: 'purchase',
    loadComponent: () =>
      import('./pages/purchase/purchase.component')
        .then(m => m.PurchaseComponent)
  },

  {
    path: 'stock-issue',
    loadComponent: () =>
      import('./pages/stock-issue/stock-issue.component')
        .then(m => m.StockIssueComponent)
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];