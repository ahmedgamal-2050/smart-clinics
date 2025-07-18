import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { signal } from '@angular/core';

import {
  LoginComponent,
  LoginFormData,
  LoginResponse,
} from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTransloco: jasmine.SpyObj<TranslocoService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translocoSpy = jasmine.createSpyObj('TranslocoService', [
      'translate',
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, TranslocoModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TranslocoService, useValue: translocoSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockTransloco = TestBed.inject(
      TranslocoService
    ) as jasmine.SpyObj<TranslocoService>;

    // Setup default translations
    mockTransloco.translate.and.returnValue('Translated Text');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
      expect(component.loginForm.get('rememberMe')?.value).toBe(false);
    });

    it('should have required validators on email and password fields', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      emailControl?.setValue('');
      passwordControl?.setValue('');

      expect(emailControl?.hasError('required')).toBe(true);
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.loginForm.get('password');

      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Setup valid form data
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });

    it('should not submit if form is invalid', async () => {
      component.loginForm.patchValue({
        email: 'invalid-email',
        password: '123',
      });

      spyOn(component as any, 'performLogin');

      await component.onSubmit();

      expect((component as any).performLogin).not.toHaveBeenCalled();
    });

    it('should set loading state during submission', async () => {
      spyOn(component as any, 'performLogin').and.returnValue(
        Promise.resolve({ success: true })
      );

      expect(component.isLoading()).toBe(false);

      const submitPromise = component.onSubmit();
      expect(component.isLoading()).toBe(true);

      await submitPromise;
      expect(component.isLoading()).toBe(false);
    });

    it('should navigate to dashboard on successful login', async () => {
      spyOn(component as any, 'performLogin').and.returnValue(
        Promise.resolve({
          success: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
        })
      );

      await component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should store user data in localStorage when rememberMe is true', async () => {
      component.loginForm.patchValue({ rememberMe: true });
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      spyOn(component as any, 'performLogin').and.returnValue(
        Promise.resolve({ success: true, user: mockUser })
      );
      spyOn(localStorage, 'setItem');

      await component.onSubmit();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockUser)
      );
    });

    it('should not store user data when rememberMe is false', async () => {
      component.loginForm.patchValue({ rememberMe: false });
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      spyOn(component as any, 'performLogin').and.returnValue(
        Promise.resolve({ success: true, user: mockUser })
      );
      spyOn(localStorage, 'setItem');

      await component.onSubmit();

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should set error message on failed login', async () => {
      spyOn(component as any, 'performLogin').and.returnValue(
        Promise.resolve({ success: false, message: 'Invalid credentials' })
      );

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Invalid credentials');
    });

    it('should handle unexpected errors', async () => {
      spyOn(component as any, 'performLogin').and.returnValue(
        Promise.reject(new Error('Network error'))
      );
      spyOn(console, 'error');

      await component.onSubmit();

      expect(component.errorMessage()).toBe(
        'An unexpected error occurred. Please try again.'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Login error:',
        jasmine.any(Error)
      );
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword()).toBe(false);

      component.togglePasswordVisibility();
      expect(component.showPassword()).toBe(true);

      component.togglePasswordVisibility();
      expect(component.showPassword()).toBe(false);
    });
  });

  describe('Form Validation Helpers', () => {
    it('should return correct field error messages', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      mockTransloco.translate.and.returnValue('Field is required');

      const error = component.getFieldError('email');
      expect(error).toBe('Field is required');
      expect(mockTransloco.translate).toHaveBeenCalledWith(
        'validation.required'
      );
    });

    it('should return null when field has no errors', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('valid@email.com');
      emailControl?.markAsTouched();

      const error = component.getFieldError('email');
      expect(error).toBeNull();
    });

    it('should return correct email validation error', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();

      mockTransloco.translate.and.returnValue('Invalid email format');

      const error = component.getFieldError('email');
      expect(error).toBe('Invalid email format');
      expect(mockTransloco.translate).toHaveBeenCalledWith('validation.email');
    });

    it('should return correct minlength validation error', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('123');
      passwordControl?.markAsTouched();

      mockTransloco.translate.and.returnValue('Minimum length is 6');

      const error = component.getFieldError('password');
      expect(error).toBe('Minimum length is 6');
      expect(mockTransloco.translate).toHaveBeenCalledWith(
        'validation.minLength',
        { min: 6 }
      );
    });

    it('should correctly identify invalid fields', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();

      expect(component.isFieldInvalid('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(component.isFieldInvalid('email')).toBe(false);
    });
  });

  describe('Mock Authentication', () => {
    it('should authenticate valid credentials', async () => {
      const formData: LoginFormData = {
        email: 'admin@smartclinics.com',
        password: 'password123',
        rememberMe: false,
      };

      const result = await (component as any).performLogin(formData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('admin@smartclinics.com');
    });

    it('should reject invalid credentials', async () => {
      const formData: LoginFormData = {
        email: 'wrong@email.com',
        password: 'wrongpassword',
        rememberMe: false,
      };

      const result = await (component as any).performLogin(formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email or password');
    });
  });

  describe('Template Integration', () => {
    it('should display error message when present', () => {
      component.errorMessage.set('Test error message');
      fixture.detectChanges();

      const errorElement =
        fixture.debugElement.nativeElement.querySelector('.bg-red-50');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Test error message');
    });

    it('should show loading state on submit button', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const submitButton = fixture.debugElement.nativeElement.querySelector(
        'button[type="submit"]'
      );
      expect(submitButton.disabled).toBe(true);
      expect(submitButton.textContent).toContain('Translated Text'); // Loading text
    });

    it('should toggle password input type', () => {
      const passwordInput =
        fixture.debugElement.nativeElement.querySelector('#password');
      expect(passwordInput.type).toBe('password');

      component.togglePasswordVisibility();
      fixture.detectChanges();

      expect(passwordInput.type).toBe('text');
    });
  });
});
