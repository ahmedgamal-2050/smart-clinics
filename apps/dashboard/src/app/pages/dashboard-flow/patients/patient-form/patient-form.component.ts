import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PatientService } from '../services/patient.service';
import {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  Gender,
  MaritalStatus,
  BloodType,
} from '../models/patient.model';
import { AppRoutes } from '../../../../common/enums/app-routes';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
})
export class PatientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly patientService = inject(PatientService);

  // Signals for state management
  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly isEditMode = signal<boolean>(false);
  readonly patientId = signal<string | null>(null);
  readonly currentStep = signal<number>(1);
  readonly totalSteps = signal<number>(4);

  // Enum references for template
  readonly Gender = Gender;
  readonly MaritalStatus = MaritalStatus;
  readonly BloodType = BloodType;
  readonly AppRoutes = AppRoutes;

  // Form groups
  patientForm!: FormGroup;
  personalInfoForm!: FormGroup;
  contactInfoForm!: FormGroup;
  medicalInfoForm!: FormGroup;
  emergencyContactForm!: FormGroup;

  // Form validation
  readonly formErrors = signal<{ [key: string]: string }>({});

  // Countries and nationalities data
  readonly countries = [
    'Saudi Arabia',
    'UAE',
    'Kuwait',
    'Qatar',
    'Bahrain',
    'Oman',
    'Jordan',
    'Lebanon',
    'Syria',
    'Iraq',
    'Egypt',
    'Yemen',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Netherlands',
    'India',
    'Pakistan',
    'Bangladesh',
    'Philippines',
    'Indonesia',
  ];

  readonly relationships = [
    'Spouse',
    'Father',
    'Mother',
    'Son',
    'Daughter',
    'Brother',
    'Sister',
    'Uncle',
    'Aunt',
    'Cousin',
    'Friend',
    'Neighbor',
    'Colleague',
    'Other',
  ];

  ngOnInit(): void {
    this.initializeForms();
    this.checkRouteParams();
  }

  private initializeForms(): void {
    // Personal Information Form
    this.personalInfoForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      maritalStatus: ['', [Validators.required]],
      occupation: [''],
      nationality: ['', [Validators.required]],
    });

    // Contact Information Form
    this.contactInfoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[+]?[\d\s-()]{10,}$/)],
      ],
      alternatePhone: ['', [Validators.pattern(/^[+]?[\d\s-()]{10,}$/)]],
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        zipCode: ['', [Validators.required]],
        country: ['', [Validators.required]],
      }),
    });

    // Medical Information Form
    this.medicalInfoForm = this.fb.group({
      bloodType: ['', [Validators.required]],
      allergies: [''],
      chronicConditions: [''],
      currentMedications: [''],
      insuranceInfo: this.fb.group({
        provider: [''],
        policyNumber: [''],
        groupNumber: [''],
        validUntil: [''],
      }),
    });

    // Emergency Contact Form
    this.emergencyContactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      relationship: ['', [Validators.required]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[+]?[\d\s-()]{10,}$/)],
      ],
      email: ['', [Validators.email]],
    });

    // Main form combining all sub-forms
    this.patientForm = this.fb.group({
      personalInfo: this.personalInfoForm,
      contactInfo: this.contactInfoForm,
      medicalInfo: this.medicalInfoForm,
      emergencyContact: this.emergencyContactForm,
    });
  }

  get addressForm(): FormGroup {
    return this.contactInfoForm.get('address') as FormGroup;
  }

  private checkRouteParams(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.patientId.set(id);
      this.loadPatient(id);
    }
  }

  private loadPatient(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.patientService.getPatientById(id).subscribe({
      next: patient => {
        if (patient) {
          this.populateForm(patient);
        } else {
          this.error.set('Patient not found');
        }
        this.loading.set(false);
      },
      error: error => {
        this.error.set('Failed to load patient');
        this.loading.set(false);
        console.error('Error loading patient:', error);
      },
    });
  }

  private populateForm(patient: Patient): void {
    // Personal Information
    this.personalInfoForm.patchValue({
      firstName: patient.personalInfo.firstName,
      lastName: patient.personalInfo.lastName,
      dateOfBirth: this.formatDateForInput(patient.personalInfo.dateOfBirth),
      gender: patient.personalInfo.gender,
      nationalId: patient.personalInfo.nationalId,
      maritalStatus: patient.personalInfo.maritalStatus,
      occupation: patient.personalInfo.occupation,
      nationality: patient.personalInfo.nationality,
    });

    // Contact Information
    this.contactInfoForm.patchValue({
      email: patient.contactInfo.email,
      phone: patient.contactInfo.phone,
      alternatePhone: patient.contactInfo.alternatePhone,
      address: {
        street: patient.contactInfo.address.street,
        city: patient.contactInfo.address.city,
        state: patient.contactInfo.address.state,
        zipCode: patient.contactInfo.address.zipCode,
        country: patient.contactInfo.address.country,
      },
    });

    // Medical Information
    this.medicalInfoForm.patchValue({
      bloodType: patient.medicalInfo.bloodType,
      allergies: patient.medicalInfo.allergies.join(', '),
      chronicConditions: patient.medicalInfo.chronicConditions.join(', '),
      currentMedications: patient.medicalInfo.currentMedications.join(', '),
      insuranceInfo: {
        provider: patient.medicalInfo.insuranceInfo?.provider || '',
        policyNumber: patient.medicalInfo.insuranceInfo?.policyNumber || '',
        groupNumber: patient.medicalInfo.insuranceInfo?.groupNumber || '',
        validUntil: patient.medicalInfo.insuranceInfo?.validUntil
          ? this.formatDateForInput(
              patient.medicalInfo.insuranceInfo.validUntil
            )
          : '',
      },
    });

    // Emergency Contact
    this.emergencyContactForm.patchValue({
      name: patient.emergencyContact.name,
      relationship: patient.emergencyContact.relationship,
      phone: patient.emergencyContact.phone,
      email: patient.emergencyContact.email,
    });
  }

  // Step navigation
  nextStep(): void {
    if (this.currentStep() < this.totalSteps()) {
      if (this.isCurrentStepValid()) {
        this.currentStep.set(this.currentStep() + 1);
      }
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps()) {
      this.currentStep.set(step);
    }
  }

  private isCurrentStepValid(): boolean {
    switch (this.currentStep()) {
      case 1:
        return this.personalInfoForm.valid;
      case 2:
        return this.contactInfoForm.valid;
      case 3:
        return this.medicalInfoForm.valid;
      case 4:
        return this.emergencyContactForm.valid;
      default:
        return false;
    }
  }

  // Form submission
  onSubmit(): void {
    if (this.patientForm.valid) {
      this.saving.set(true);
      this.error.set(null);

      const formData = this.prepareFormData();

      if (this.isEditMode()) {
        this.updatePatient(formData);
      } else {
        this.createPatient(formData);
      }
    } else {
      this.validateAllFormFields();
    }
  }

  private prepareFormData(): CreatePatientRequest {
    const formValue = this.patientForm.value;

    return {
      personalInfo: {
        ...formValue.personalInfo,
        dateOfBirth: new Date(formValue.personalInfo.dateOfBirth),
      },
      contactInfo: formValue.contactInfo,
      medicalInfo: {
        ...formValue.medicalInfo,
        allergies: this.parseStringArray(formValue.medicalInfo.allergies),
        chronicConditions: this.parseStringArray(
          formValue.medicalInfo.chronicConditions
        ),
        currentMedications: this.parseStringArray(
          formValue.medicalInfo.currentMedications
        ),
        insuranceInfo: formValue.medicalInfo.insuranceInfo.provider
          ? {
              ...formValue.medicalInfo.insuranceInfo,
              validUntil: formValue.medicalInfo.insuranceInfo.validUntil
                ? new Date(formValue.medicalInfo.insuranceInfo.validUntil)
                : undefined,
            }
          : undefined,
      },
      emergencyContact: formValue.emergencyContact,
    };
  }

  private createPatient(formData: CreatePatientRequest): void {
    this.patientService.createPatient(formData).subscribe({
      next: patient => {
        this.saving.set(false);
        this.router.navigate([
          `/${AppRoutes.Dashboard}/${AppRoutes.Patients}/${patient.id}`,
        ]);
      },
      error: error => {
        this.error.set('Failed to create patient');
        this.saving.set(false);
        console.error('Error creating patient:', error);
      },
    });
  }

  private updatePatient(formData: CreatePatientRequest): void {
    const updateData: UpdatePatientRequest = {
      id: this.patientId() ?? '',
      ...formData,
    };

    this.patientService.updatePatient(updateData).subscribe({
      next: patient => {
        this.saving.set(false);
        this.router.navigate([
          `/${AppRoutes.Dashboard}/${AppRoutes.Patients}/${patient.id}`,
        ]);
      },
      error: error => {
        this.error.set('Failed to update patient');
        this.saving.set(false);
        console.error('Error updating patient:', error);
      },
    });
  }

  // Form validation
  private validateAllFormFields(): void {
    Object.keys(this.patientForm.controls).forEach(field => {
      const control = this.patientForm.get(field);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.validateFormGroup(control);
        }
      }
    });
  }

  private validateFormGroup(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.validateFormGroup(control);
        }
      }
    });
  }

  // Field validation helpers
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['pattern']) return 'Please enter a valid format';
      if (field.errors['minlength'])
        return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    }
    return '';
  }

  // Navigation
  cancel(): void {
    if (this.isEditMode()) {
      this.router.navigate([
        `/${AppRoutes.Dashboard}/${AppRoutes.Patients}/${this.patientId()}`,
      ]);
    } else {
      this.router.navigate([`/${AppRoutes.Dashboard}/${AppRoutes.Patients}`]);
    }
  }

  // Utility methods
  private formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private parseStringArray(input: string): string[] {
    return input
      ? input
          .split(',')
          .map(item => item.trim())
          .filter(item => item)
      : [];
  }

  // Getters for template
  get isFirstStep(): boolean {
    return this.currentStep() === 1;
  }

  get isLastStep(): boolean {
    return this.currentStep() === this.totalSteps();
  }

  get canProceed(): boolean {
    return this.isCurrentStepValid();
  }

  get formTitle(): string {
    return this.isEditMode() ? 'Edit Patient' : 'Add New Patient';
  }

  get submitButtonText(): string {
    return this.isEditMode() ? 'Update Patient' : 'Create Patient';
  }
}
