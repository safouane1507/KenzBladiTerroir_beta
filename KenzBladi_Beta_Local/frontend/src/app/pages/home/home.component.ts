import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CarouselModule, ProductCardComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  produits: any[] = [];
  taxonomies: any[] = [];
  loading = true;
  imagesUrl = 'http://localhost:4000/images';

  carouselResponsive = [
    { breakpoint: '1200px', numVisible: 4, numScroll: 1 },
    { breakpoint: '992px',  numVisible: 3, numScroll: 1 },
    { breakpoint: '768px',  numVisible: 2, numScroll: 1 },
    { breakpoint: '576px',  numVisible: 1, numScroll: 1 }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getTaxonomies().subscribe({
      next: t => this.taxonomies = t,
      error: () => this.taxonomies = []
    });
    this.productService.getProduits().subscribe({
      next: p => { this.produits = p; this.loading = false; },
      error: () => { this.produits = []; this.loading = false; }
    });
  }

  getTaxFr(tax: any): any {
    return tax?.translations?.find((t: any) => t.language === 'fr') || {};
  }
}
