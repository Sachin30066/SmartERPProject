import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
interface Item {
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  rate: number;
  status: string;
}

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent {

  searchText = '';

  items: Item[] = [

    {
      code: 'ITM-001',
      name: 'Cement',
      category: 'Construction',
      unit: 'Bag',
      stock: 850,
      rate: 420,
      status: 'Active'
    },

    {
      code: 'ITM-002',
      name: 'Steel Bar 12mm',
      category: 'Construction',
      unit: 'Kg',
      stock: 4250,
      rate: 68,
      status: 'Active'
    },

    {
      code: 'ITM-003',
      name: 'PVC Pipe',
      category: 'Plumbing',
      unit: 'Meter',
      stock: 1250,
      rate: 145,
      status: 'Active'
    },

    {
      code: 'ITM-004',
      name: 'Safety Helmet',
      category: 'Safety',
      unit: 'Nos',
      stock: 120,
      rate: 350,
      status: 'Active'
    },

    {
      code: 'ITM-005',
      name: 'Electrical Cable',
      category: 'Electrical',
      unit: 'Meter',
      stock: 680,
      rate: 95,
      status: 'Inactive'
    }

  ];

  get filteredItems() {

    const search =
      this.searchText.toLowerCase();

    return this.items.filter(x =>
      x.name.toLowerCase().includes(search) ||
      x.code.toLowerCase().includes(search) ||
      x.category.toLowerCase().includes(search)
    );
  }

}