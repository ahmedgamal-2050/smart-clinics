import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PatientService } from '../services/patient.service';
import {
  Patient,
  PatientSearchFilters,
  Gender,
  BloodType,
} from '../models/patient.model';
import { AppRoutes } from '../../../../common/enums/app-routes';
import { MinPipe } from '../../../../common/pipes/min-pipe';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslocoPipe, MinPipe],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
})
export class PatientListComponent implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);

  // Signals for state management
  readonly patients = signal<Patient[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly totalPatients = signal<number>(0);
  readonly pageSize = signal<number>(10);

  // Search and filter signals
  readonly searchTerm = signal<string>('');
  readonly selectedGender = signal<Gender | ''>('');
  readonly selectedBloodType = signal<BloodType | ''>('');
  readonly showInactive = signal<boolean>(false);
  readonly selectedPatients = signal<string[]>([]);

  // Computed values
  readonly hasFilters = computed(
    () =>
      this.searchTerm() !== '' ||
      this.selectedGender() !== '' ||
      this.selectedBloodType() !== '' ||
      this.showInactive()
  );

  readonly isAllSelected = computed(
    () =>
      this.patients().length > 0 &&
      this.patients().every(p => this.selectedPatients().includes(p.id))
  );

  readonly hasSelection = computed(() => this.selectedPatients().length > 0);

  // Enum references for template
  readonly Gender = Gender;
  readonly BloodType = BloodType;
  readonly AppRoutes = AppRoutes;

  // Pagination options
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadPatients();
  }

  // Load patients with current filters
  loadPatients(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: PatientSearchFilters = {
      search: this.searchTerm() || undefined,
      gender: this.selectedGender() || undefined,
      bloodType: this.selectedBloodType() || undefined,
      isActive: this.showInactive() ? undefined : true,
    };

    this.patientService
      .getPatients(filters, this.currentPage(), this.pageSize())
      .subscribe({
        next: response => {
          this.patients.set(response.patients);
          this.totalPatients.set(response.total);
          this.totalPages.set(Math.ceil(response.total / response.limit));
          this.loading.set(false);
        },
        error: error => {
          this.error.set('Failed to load patients');
          this.loading.set(false);
          console.error('Error loading patients:', error);
        },
      });
  }

  // Search functionality
  onSearch(): void {
    this.currentPage.set(1);
    this.loadPatients();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedGender.set('');
    this.selectedBloodType.set('');
    this.showInactive.set(false);
    this.currentPage.set(1);
    this.selectedPatients.set([]);
    this.loadPatients();
  }

  // Filter change handlers
  onGenderChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedGender.set(target.value as Gender);
    this.currentPage.set(1);
    this.loadPatients();
  }

  onBloodTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedBloodType.set(target.value as BloodType);
    this.currentPage.set(1);
    this.loadPatients();
  }

  onShowInactiveChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.showInactive.set(target.checked);
    this.currentPage.set(1);
    this.loadPatients();
  }

  // Pagination
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPatients();
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(parseInt(target.value));
    this.currentPage.set(1);
    this.loadPatients();
  }

  // Selection management
  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedPatients.set([]);
    } else {
      this.selectedPatients.set(this.patients().map(p => p.id));
    }
  }

  togglePatientSelection(patientId: string): void {
    const selected = this.selectedPatients();
    if (selected.includes(patientId)) {
      this.selectedPatients.set(selected.filter(id => id !== patientId));
    } else {
      this.selectedPatients.set([...selected, patientId]);
    }
  }

  // Navigation
  createPatient(): void {
    this.router.navigate([`/${AppRoutes.Dashboard}/${AppRoutes.Patients}/new`]);
  }

  viewPatient(patient: Patient): void {
    this.router.navigate([
      `/${AppRoutes.Dashboard}/${AppRoutes.Patients}/${patient.id}`,
    ]);
  }

  editPatient(patient: Patient): void {
    this.router.navigate([
      `/${AppRoutes.Dashboard}/${AppRoutes.Patients}/${patient.id}/edit`,
    ]);
  }

  // Patient actions
  deletePatient(patient: Patient): void {
    if (
      confirm(
        `Are you sure you want to delete ${patient.personalInfo.firstName} ${patient.personalInfo.lastName}?`
      )
    ) {
      this.patientService.deletePatient(patient.id).subscribe({
        next: () => {
          this.selectedPatients.set(
            this.selectedPatients().filter(id => id !== patient.id)
          );
          this.loadPatients();
        },
        error: error => {
          console.error('Error deleting patient:', error);
          alert('Failed to delete patient');
        },
      });
    }
  }

  restorePatient(patient: Patient): void {
    this.patientService.restorePatient(patient.id).subscribe({
      next: () => {
        this.loadPatients();
      },
      error: error => {
        console.error('Error restoring patient:', error);
        alert('Failed to restore patient');
      },
    });
  }

  // Bulk actions
  deleteSelectedPatients(): void {
    const selectedCount = this.selectedPatients().length;
    if (selectedCount === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedCount} selected patients?`
      )
    ) {
      const deleteObservables = this.selectedPatients().map(id =>
        this.patientService.deletePatient(id)
      );

      // Execute all delete operations
      Promise.all(deleteObservables.map(obs => obs.toPromise()))
        .then(() => {
          this.selectedPatients.set([]);
          this.loadPatients();
        })
        .catch(error => {
          console.error('Error deleting selected patients:', error);
          alert('Failed to delete some patients');
        });
    }
  }

  // Utility methods
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

  getPatientFullName(patient: Patient): string {
    return `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`;
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

  getMaritalStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Get pagination range
  getPaginationRange(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const range: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        range.push(i);
      }
    } else {
      if (current <= 4) {
        range.push(1, 2, 3, 4, 5, -1, total);
      } else if (current >= total - 3) {
        range.push(1, -1, total - 4, total - 3, total - 2, total - 1, total);
      } else {
        range.push(1, -1, current - 1, current, current + 1, -1, total);
      }
    }

    return range;
  }
}
