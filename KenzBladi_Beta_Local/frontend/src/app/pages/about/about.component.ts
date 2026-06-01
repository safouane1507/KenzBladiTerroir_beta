import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html'
})
export class AboutComponent {
  imagesUrl = 'http://localhost:4000/images';

  values = [
    { icon: 'pi pi-verified', title: 'Authenticité', desc: 'Chaque produit est vérifié à la source. Nous travaillons directement avec les coopératives et producteurs locaux.' },
    { icon: 'pi pi-heart', title: 'Impact Social', desc: 'Nous soutenons l\'économie locale marocaine et valorisons le travail des artisans et agricultrices.' },
    { icon: 'pi pi-globe', title: 'Patrimoine', desc: 'Préserver et promouvoir le patrimoine culturel et gastronomique du Maroc auprès du monde entier.' },
    { icon: 'pi pi-shield', title: 'Confiance', desc: 'Certifications AOP/IGP disponibles, traçabilité totale, et satisfaction client garantie.' }
  ];
}
