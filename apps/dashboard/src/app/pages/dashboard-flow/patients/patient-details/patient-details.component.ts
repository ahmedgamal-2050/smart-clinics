import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PatientService } from '../services/patient.service';
import {
  Patient,
  Gender,
  MaritalStatus,
  BloodType,
} from '../models/patient.model';
import { AppRoutes } from '../../../../common/enums/app-routes';

@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss',
})
export class PatientDetailsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly patientService = inject(PatientService);

  // Signals for state management
  readonly patient = signal<Patient | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly patientId = signal<string | null>(null);

  // Enum references for template
  readonly Gender = Gender;
  readonly MaritalStatus = MaritalStatus;
  readonly BloodType = BloodType;
  readonly AppRoutes = AppRoutes;

  ngOnInit(): void {
    this.checkRouteParams();
  }

  private checkRouteParams(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientId.set(id);
      this.loadPatient(id);
    } else {
      this.error.set('Patient ID is required');
    }
  }

  private loadPatient(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.patientService.getPatientById(id).subscribe({
      next: patient => {
        if (patient) {
          this.patient.set(patient);
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

  // Navigation methods
  goBack(): void {
    this.router.navigate([`/${AppRoutes.Dashboard}/${AppRoutes.Patients}`]);
  }

  editPatient(): void {
    const patient = this.patient();
    if (patient) {
      this.router.navigate([
        `/${AppRoutes.Dashboard}/${AppRoutes.Patients}/${patient.id}/edit`,
      ]);
    }
  }

  deletePatient(): void {
    const patient = this.patient();
    if (patient && confirm('Are you sure you want to delete this patient?')) {
      this.patientService.deletePatient(patient.id).subscribe({
        next: () => {
          this.router.navigate([
            `/${AppRoutes.Dashboard}/${AppRoutes.Patients}`,
          ]);
        },
        error: error => {
          this.error.set('Failed to delete patient');
          console.error('Error deleting patient:', error);
        },
      });
    }
  }

  // Utility methods
  getPatientFullName(patient: Patient): string {
    return `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`;
  }

  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  getGenderLabel(gender: Gender): string {
    switch (gender) {
      case Gender.Male:
        return 'Male';
      case Gender.Female:
        return 'Female';
      case Gender.Other:
        return 'Other';
      default:
        return 'Unknown';
    }
  }

  getMaritalStatusLabel(status: MaritalStatus): string {
    switch (status) {
      case MaritalStatus.Single:
        return 'Single';
      case MaritalStatus.Married:
        return 'Married';
      case MaritalStatus.Divorced:
        return 'Divorced';
      case MaritalStatus.Widowed:
        return 'Widowed';
      default:
        return 'Unknown';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  printPatientInfo(): void {
    window.print();
  }
}
