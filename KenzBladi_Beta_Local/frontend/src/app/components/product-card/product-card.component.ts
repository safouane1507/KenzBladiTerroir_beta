import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  @Input() produit: any;

  constructor(private router: Router, public productService: ProductService) {}

  navigate(): void {
    if (this.produit?.refProduit) {
      this.router.navigate(['/produit', this.produit.refProduit]);
    }
  }

  get fr(): any { return this.productService.getFrTranslation(this.produit); }
  get priceTTC(): number { return this.productService.getPriceTTC(this.produit); }
  get imageUrl(): string { return this.productService.getImageUrl(this.produit?.imageProduit); }
  get stockClass(): string { return this.productService.getStockClass(this.produit); }
  get stockLabel(): string { return this.produit?.indicationDuStock?.etatStock || 'N/A'; }
}
