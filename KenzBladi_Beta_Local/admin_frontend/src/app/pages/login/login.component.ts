import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  login = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AdminAuthService, private router: Router) {
    if (this.auth.isAuthenticated()) this.router.navigate(['/']);
  }

  submit() {
    this.error = '';
    if (!this.login || !this.password) { this.error = 'Veuillez remplir tous les champs.'; return; }
    this.loading = true;
    this.auth.login(this.login, this.password).subscribe({
      next: res => {
        this.auth.storeSession(res.token, res.user);
        this.router.navigate(['/']);
      },
      error: () => {
        this.error = 'Identifiants incorrects.';
        this.loading = false;
      }
    });
  }
}
