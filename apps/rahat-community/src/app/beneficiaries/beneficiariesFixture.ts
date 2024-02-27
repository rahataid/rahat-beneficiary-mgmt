interface Beneficiaries {
  firstName: string;

  lastName: string;

  birthDate?: string;

  gender?: string;

  location?: string;

  latitude?: number;

  longitude?: number;

  phone?: string;

  notes?: string;

  email?: string;
}

const mockBeneficiaries: Beneficiaries[] = [
  {
    firstName: 'Ram',
    lastName: 'Sharma',
    birthDate: '1997-03-08',
    gender: 'MALE',
    location: 'lalitpur',
    latitude: 26.24,
    longitude: 86.24,
    phone: '9785623749',
    notes: '9785623749',
    email: 'ram@mailinator.com',
  },
];

class MockBeneficiaries{
  private beneficiaries:Beneficiaries[];
  constructor(beneficiaries?:Beneficiaries[]){
    this.
  }
}