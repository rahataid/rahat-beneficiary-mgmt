import axios from 'axios';
import { JwtGuard } from '@rahat/user';
import { ForbiddenException } from '@nestjs/common';

// jest.mock('axios');

const beneficiariesFixture = [
  {
    id: 1,
    firstName: 'Ram',
    lastName: 'Sharma',
    birthDate: '1997-03-08',
    gender: 'Male',
    location: 'lalitpur',
    latitude: 26.24,
    longitude: 86.24,
    phone: '9785623749',
    notes: '9785623749',
    email: 'ram@mailinator.com',
    extras: {
      home: '98670023857',
      work: '36526012',
    },
  },
  {
    id: 2,
    firstName: 'Rama',
    lastName: 'Doe',
    birthDate: '1985-12-15',
    gender: 'Male',
    location: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    phone: '1234567890',
    notes: 'Test notes',
    email: 'john@mailinator.com',
    extras: {
      home: '9876543210',
      work: '1234567890',
    },
  },
];

const data = {
  firstName: 'kjl',
  lastName: 'Doe',
  birthDate: '1985-12-15',
  gender: 'Male',
  location: 'New York',
  latitude: 40.7128,
  longitude: -74.006,
  phone: '1234567890',
  notes: 'Test notes',
  email: 'john@mailinator.com',
};

describe('beneficiaries/post', () => {
  it('should create beneficiary ', async () => {
    const res = await axios.post(`/api/v1/beneficiaries`, data);
    expect(res.status).toBe(200);
  });

  it('should not create a beneficiary without a valid ACl', async () => {
    jest.spyOn(JwtGuard.prototype, 'canActivate').mockReturnValue(false);
    jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce(
        new ForbiddenException('You are not access to create'),
      );
    const responsePromise = axios.post(
      '/api/v1/beneficiaries',
      beneficiariesFixture,
    );

    await expect(responsePromise).rejects.toThrow(
      'You are not access to create',
    );
  });
  it('should retrive all data ', async () => {
    const res = await axios.get('/api/v1/beneficiaries');
    expect(res.status).toBe(200);
  });
});
