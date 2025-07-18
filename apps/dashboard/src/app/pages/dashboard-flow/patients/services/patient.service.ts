import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, map, BehaviorSubject } from 'rxjs';
import {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientSearchFilters,
  PatientListResponse,
  Gender,
  MaritalStatus,
  BloodType,
} from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly patientsSubject = new BehaviorSubject<Patient[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // Signals for reactive state management
  readonly patients = signal<Patient[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed signals
  readonly activePatients = computed(() =>
    this.patients().filter(p => p.isActive)
  );

  readonly totalPatients = computed(() => this.patients().length);
  readonly totalActivePatients = computed(() => this.activePatients().length);

  constructor() {
    this.initializeMockData();
  }

  // Get all patients with optional filters
  getPatients(
    filters?: PatientSearchFilters,
    page = 1,
    limit = 10
  ): Observable<PatientListResponse> {
    this.loading.set(true);
    this.error.set(null);

    return of(this.patients()).pipe(
      delay(500), // Simulate API delay
      map(patients => {
        let filteredPatients = patients;

        // Apply filters
        if (filters) {
          filteredPatients = this.applyFilters(patients, filters);
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

        this.loading.set(false);

        return {
          patients: paginatedPatients,
          total: filteredPatients.length,
          page,
          limit,
        };
      })
    );
  }

  // Get patient by ID
  getPatientById(id: string): Observable<Patient | null> {
    this.loading.set(true);
    this.error.set(null);

    return of(this.patients().find(p => p.id === id) || null).pipe(
      delay(300),
      map(patient => {
        this.loading.set(false);
        return patient;
      })
    );
  }

  // Create new patient
  createPatient(request: CreatePatientRequest): Observable<Patient> {
    this.loading.set(true);
    this.error.set(null);

    const newPatient: Patient = {
      id: this.generateId(),
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    return of(newPatient).pipe(
      delay(800),
      map(patient => {
        const updatedPatients = [...this.patients(), patient];
        this.patients.set(updatedPatients);
        this.loading.set(false);
        return patient;
      })
    );
  }

  // Update existing patient
  updatePatient(request: UpdatePatientRequest): Observable<Patient> {
    this.loading.set(true);
    this.error.set(null);

    const existingPatient = this.patients().find(p => p.id === request.id);
    if (!existingPatient) {
      this.error.set('Patient not found');
      this.loading.set(false);
      throw new Error('Patient not found');
    }

    const updatedPatient: Patient = {
      ...existingPatient,
      personalInfo: {
        ...existingPatient.personalInfo,
        ...request.personalInfo,
      },
      contactInfo: { ...existingPatient.contactInfo, ...request.contactInfo },
      medicalInfo: { ...existingPatient.medicalInfo, ...request.medicalInfo },
      emergencyContact: {
        ...existingPatient.emergencyContact,
        ...request.emergencyContact,
      },
      updatedAt: new Date(),
    };

    return of(updatedPatient).pipe(
      delay(800),
      map(patient => {
        const updatedPatients = this.patients().map(p =>
          p.id === request.id ? patient : p
        );
        this.patients.set(updatedPatients);
        this.loading.set(false);
        return patient;
      })
    );
  }

  // Delete patient (soft delete)
  deletePatient(id: string): Observable<boolean> {
    this.loading.set(true);
    this.error.set(null);

    return of(true).pipe(
      delay(500),
      map(() => {
        const updatedPatients = this.patients().map(p =>
          p.id === id ? { ...p, isActive: false, updatedAt: new Date() } : p
        );
        this.patients.set(updatedPatients);
        this.loading.set(false);
        return true;
      })
    );
  }

  // Restore patient (activate)
  restorePatient(id: string): Observable<boolean> {
    this.loading.set(true);
    this.error.set(null);

    return of(true).pipe(
      delay(500),
      map(() => {
        const updatedPatients = this.patients().map(p =>
          p.id === id ? { ...p, isActive: true, updatedAt: new Date() } : p
        );
        this.patients.set(updatedPatients);
        this.loading.set(false);
        return true;
      })
    );
  }

  // Search patients
  searchPatients(searchTerm: string): Observable<Patient[]> {
    this.loading.set(true);
    this.error.set(null);

    return of(this.patients()).pipe(
      delay(300),
      map(patients => {
        const filtered = patients.filter(
          patient =>
            patient.personalInfo.firstName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            patient.personalInfo.lastName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            patient.contactInfo.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            patient.contactInfo.phone.includes(searchTerm) ||
            patient.personalInfo.nationalId.includes(searchTerm)
        );
        this.loading.set(false);
        return filtered;
      })
    );
  }

  // Private helper methods
  private applyFilters(
    patients: Patient[],
    filters: PatientSearchFilters
  ): Patient[] {
    return patients.filter(patient => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          patient.personalInfo.firstName.toLowerCase().includes(searchLower) ||
          patient.personalInfo.lastName.toLowerCase().includes(searchLower) ||
          patient.contactInfo.email.toLowerCase().includes(searchLower) ||
          patient.contactInfo.phone.includes(filters.search) ||
          patient.personalInfo.nationalId.includes(filters.search);

        if (!matchesSearch) return false;
      }

      if (filters.gender && patient.personalInfo.gender !== filters.gender) {
        return false;
      }

      if (
        filters.bloodType &&
        patient.medicalInfo.bloodType !== filters.bloodType
      ) {
        return false;
      }

      if (
        filters.isActive !== undefined &&
        patient.isActive !== filters.isActive
      ) {
        return false;
      }

      if (filters.ageRange) {
        const age = this.calculateAge(patient.personalInfo.dateOfBirth);
        if (age < filters.ageRange.min || age > filters.ageRange.max) {
          return false;
        }
      }

      return true;
    });
  }

  private calculateAge(dateOfBirth: Date): number {
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

  private generateId(): string {
    return (
      'PAT-' + Date.now().toString(36) + Math.random().toString(36).substr(2)
    );
  }

  private initializeMockData(): void {
    const mockPatients: Patient[] = [
      {
        id: 'PAT-001',
        personalInfo: {
          firstName: 'Ahmed',
          lastName: 'Al-Rashid',
          dateOfBirth: new Date('1985-03-15'),
          gender: Gender.Male,
          nationalId: '1234567890',
          maritalStatus: MaritalStatus.Married,
          occupation: 'Engineer',
          nationality: 'Saudi Arabia',
        },
        contactInfo: {
          email: 'ahmed.rashid@email.com',
          phone: '+966501234567',
          alternatePhone: '+966123456789',
          address: {
            street: '123 King Fahd Road',
            city: 'Riyadh',
            state: 'Riyadh Province',
            zipCode: '12345',
            country: 'Saudi Arabia',
          },
        },
        medicalInfo: {
          bloodType: BloodType.APositive,
          allergies: ['Peanuts', 'Shellfish'],
          chronicConditions: ['Hypertension'],
          currentMedications: ['Lisinopril 10mg'],
          insuranceInfo: {
            provider: 'Bupa Arabia',
            policyNumber: 'BA123456789',
            groupNumber: 'GR001',
            validUntil: new Date('2024-12-31'),
          },
        },
        emergencyContact: {
          name: 'Fatima Al-Rashid',
          relationship: 'Wife',
          phone: '+966507654321',
          email: 'fatima.rashid@email.com',
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        isActive: true,
      },
      {
        id: 'PAT-002',
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Al-Zahra',
          dateOfBirth: new Date('1992-07-22'),
          gender: Gender.Female,
          nationalId: '0987654321',
          maritalStatus: MaritalStatus.Single,
          occupation: 'Teacher',
          nationality: 'Saudi Arabia',
        },
        contactInfo: {
          email: 'sarah.zahra@email.com',
          phone: '+966502345678',
          address: {
            street: '456 Prince Mohammed Road',
            city: 'Jeddah',
            state: 'Makkah Province',
            zipCode: '23456',
            country: 'Saudi Arabia',
          },
        },
        medicalInfo: {
          bloodType: BloodType.ONegative,
          allergies: ['Latex'],
          chronicConditions: [],
          currentMedications: [],
          insuranceInfo: {
            provider: 'Tawuniya',
            policyNumber: 'TW987654321',
            validUntil: new Date('2024-08-31'),
          },
        },
        emergencyContact: {
          name: 'Omar Al-Zahra',
          relationship: 'Brother',
          phone: '+966503456789',
        },
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        isActive: true,
      },
      {
        id: 'PAT-003',
        personalInfo: {
          firstName: 'Mohammed',
          lastName: 'Al-Mansouri',
          dateOfBirth: new Date('1975-11-08'),
          gender: Gender.Male,
          nationalId: '5678901234',
          maritalStatus: MaritalStatus.Married,
          occupation: 'Business Owner',
          nationality: 'UAE',
        },
        contactInfo: {
          email: 'mohammed.mansouri@email.com',
          phone: '+971501234567',
          alternatePhone: '+971123456789',
          address: {
            street: '789 Sheikh Zayed Road',
            city: 'Dubai',
            state: 'Dubai',
            zipCode: '34567',
            country: 'UAE',
          },
        },
        medicalInfo: {
          bloodType: BloodType.BPositive,
          allergies: ['Penicillin'],
          chronicConditions: ['Diabetes Type 2'],
          currentMedications: ['Metformin 500mg', 'Glipizide 5mg'],
          insuranceInfo: {
            provider: 'Allianz Care',
            policyNumber: 'AC456789012',
            validUntil: new Date('2025-01-31'),
          },
        },
        emergencyContact: {
          name: 'Aisha Al-Mansouri',
          relationship: 'Wife',
          phone: '+971507654321',
          email: 'aisha.mansouri@email.com',
        },
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-03-01'),
        isActive: true,
      },
    ];

    this.patients.set(mockPatients);
  }
}
