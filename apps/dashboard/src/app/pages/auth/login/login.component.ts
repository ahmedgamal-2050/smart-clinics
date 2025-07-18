import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { LoginFormData, LoginResponse } from './login.model';
import { AppRoutes } from '../../../common/enums/app-routes';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslocoModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const formData: LoginFormData = this.loginForm.value;
      const response = this.performLogin(formData);

      if (response.success) {
        // Store user data if remember me is checked
        if (formData.rememberMe && response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Navigate to dashboard
        this.router.navigate([`/${AppRoutes.Dashboard}/${AppRoutes.Home}`]);
      } else {
        this.errorMessage.set(response.message || 'Login failed');
      }
    } catch (error) {
      this.errorMessage.set('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  protected getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return this.transloco.translate('validation.required');
      }
      if (field.errors['email']) {
        return this.transloco.translate('validation.email');
      }
      if (field.errors['minlength']) {
        return this.transloco.translate('validation.minLength', {
          min: field.errors['minlength'].requiredLength,
        });
      }
    }

    return null;
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private performLogin(formData: LoginFormData): LoginResponse {
    // Simulate API call - replace with actual authentication service
    new Promise(resolve => setTimeout(resolve, 1500));

    // Mock authentication - replace with real implementation
    if (
      formData.email === 'admin@smartclinics.com' &&
      formData.password === 'password123'
    ) {
      return {
        success: true,
        user: {
          id: '1',
          email: formData.email,
          name: 'Admin User',
        },
      };
    }

    return {
      success: false,
      message: 'Invalid email or password',
    };
  }
}
