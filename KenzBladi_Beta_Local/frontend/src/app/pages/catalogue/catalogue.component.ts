import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SliderModule } from 'primeng/slider';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SliderModule, ProductCardComponent],
  templateUrl: './catalogue.component.html'
})
export class CatalogueComponent implements OnInit {
  allProduits: any[] = [];
  filtered: any[]   = [];
  taxonomies: any[]  = [];
  loading = true;

  searchText    = '';
  selectedCats: string[] = [];
  priceRange    = [0, 5000];
  maxPrice      = 5000;
  filterOpen    = true;
  stockOnly     = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getTaxonomies().subscribe({
      next: t => this.taxonomies = t,
      error: () => {}
    });
    this.productService.getProduits().subscribe({
      next: p => {
        this.allProduits = p;
        const prices = p.map((x: any) => this.productService.getPriceTTC(x));
        this.maxPrice = Math.ceil(Math.max(...prices, 100) / 100) * 100;
        this.priceRange = [0, this.maxPrice];
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    this.filtered = this.allProduits.filter(p => {
      const fr    = this.productService.getFrTranslation(p);
      const name  = (fr.designationProduit || p.refProduit || '').toLowerCase();
      const price = this.productService.getPriceTTC(p);
      const inCat = this.selectedCats.length === 0 || this.selectedCats.includes(p.classe);
      const inSearch = !this.searchText || name.includes(this.searchText.toLowerCase())
                       || p.refProduit?.toLowerCase().includes(this.searchText.toLowerCase());
      const inPrice  = price >= this.priceRange[0] && price <= this.priceRange[1];
      const inStock  = !this.stockOnly || (p.indicationDuStock?.quantiteDisponible ?? 0) > 0;
      return inCat && inSearch && inPrice && inStock;
    });
  }

  toggleCat(ref: string): void {
    const idx = this.selectedCats.indexOf(ref);
    if (idx === -1) this.selectedCats.push(ref);
    else this.selectedCats.splice(idx, 1);
    this.applyFilters();
  }

  isCatSelected(ref: string): boolean { return this.selectedCats.includes(ref); }

  resetFilters(): void {
    this.searchText   = '';
    this.selectedCats = [];
    this.priceRange   = [0, this.maxPrice];
    this.stockOnly    = false;
    this.applyFilters();
  }

  getTaxFr(tax: any): any {
    return tax?.translations?.find((t: any) => t.language === 'fr') || {};
  }
}
