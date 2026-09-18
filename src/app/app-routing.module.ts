import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ItemsComponent } from './pages/items/items.component';
import { PurchaseComponent } from './pages/purchase/purchase.component';
import { StockIssueComponent } from './pages/stock-issue/stock-issue.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'items',
    component: ItemsComponent
  },
  {
    path: 'purchase',
    component: PurchaseComponent
  },
  {
    path: 'stock-issue',
    component: StockIssueComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}