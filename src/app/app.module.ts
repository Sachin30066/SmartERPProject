import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ItemsComponent } from './pages/items/items.component';
import { PurchaseComponent } from './pages/purchase/purchase.component';
import { StockIssueComponent } from './pages/stock-issue/stock-issue.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    DashboardComponent,
    PurchaseComponent,
    StockIssueComponent
  ],
  imports: [
    BrowserModule,FormsModule,
    AppRoutingModule,ItemsComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
