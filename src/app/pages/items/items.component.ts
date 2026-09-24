import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService, Item } from '../../services/item.service';
import { DinoGameComponent } from '../../components/dino-game/dino-game.component';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DinoGameComponent
  ],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {

  searchText = '';

  items: Item[] = [];

  loading = false;
  hasError = false;

  constructor(
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {

    this.loading = true;
    this.hasError = false;

    this.itemService.getItems().subscribe({
      
      next: (response) => {

        this.items = response || [];

        this.loading = false;
        this.hasError = false;

      },

      error: (error) => {

        console.error('Error loading items:', error);

        this.loading = false;
        this.hasError = true;

      }

    });

  }

  get filteredItems(): Item[] {

    const search = this.searchText
      .toLowerCase()
      .trim();

    if (!search) {
      return this.items;
    }

    return this.items.filter(x =>
      x.name?.toLowerCase().includes(search) ||
      x.code?.toLowerCase().includes(search) ||
      x.category?.toLowerCase().includes(search)
    );

  }

}