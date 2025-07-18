export interface Patient {
  id: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  medicalInfo: MedicalInfo;
  emergencyContact: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  nationalId: string;
  maritalStatus: MaritalStatus;
  occupation?: string;
  nationality: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface MedicalInfo {
  bloodType: BloodType;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  insuranceInfo?: InsuranceInfo;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  validUntil: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum MaritalStatus {
  Single = 'single',
  Married = 'married',
  Divorced = 'divorced',
  Widowed = 'widowed',
}

export enum BloodType {
  APositive = 'A+',
  ANegative = 'A-',
  BPositive = 'B+',
  BNegative = 'B-',
  ABPositive = 'AB+',
  ABNegative = 'AB-',
  OPositive = 'O+',
  ONegative = 'O-',
}

export interface CreatePatientRequest {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  medicalInfo: MedicalInfo;
  emergencyContact: EmergencyContact;
}

export interface UpdatePatientRequest {
  id: string;
  personalInfo?: Partial<PersonalInfo>;
  contactInfo?: Partial<ContactInfo>;
  medicalInfo?: Partial<MedicalInfo>;
  emergencyContact?: Partial<EmergencyContact>;
}

export interface PatientSearchFilters {
  search?: string;
  gender?: Gender;
  bloodType?: BloodType;
  isActive?: boolean;
  ageRange?: {
    min: number;
    max: number;
  };
}

export interface PatientListResponse {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
}

export interface PatientFormData {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  medicalInfo: MedicalInfo;
  emergencyContact: EmergencyContact;
}
