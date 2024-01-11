import axios from 'axios';
import { JwtGuard } from '@rahat/user';
import { ForbiddenException } from '@nestjs/common';
import { SignupDto } from '@rahat/user';
import { CreatePermissionDto } from '@rahat/user';
import request from 'supertest';
import { access } from 'fs';
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

const PORT = 5600;
const APP_URL = `http://localhost:${PORT}`;

let otp;
let acessToken;
describe('beneficiariesmgmt', () => {
  describe('user', () => {
    const email = 'admin@mailinator.com';

    it('should send otp', (done) => {
      request(APP_URL)
        .post('/api/v1/auth/otp')
        .send({
          authAddress: email,
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          otp = res.body.otp;
          done();
        });
    });
    it('should login using otp and get token', (done) => {
      request(APP_URL)
        .post('/api/v1/auth/login')
        .send({
          authAddress: email,
          otp: otp,
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          acessToken = res.body.accessToken;
          done();
        });
    });
  });

  describe('beneficiaries', () => {
    it('should create beneficiary ', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiaries')
        .set('Authorization', `Bearer ${acessToken}`)
        .send(data)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          done();
        });
    });

    it('should not create a beneficiary without a valid ACl', async () => {
      jest.spyOn(JwtGuard.prototype, 'canActivate').mockReturnValue(false);
      jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce(
          new ForbiddenException('You are not access to create'),
        );
      const responsePromise = axios.post('/api/v1/beneficiaries', data);

      await expect(responsePromise).rejects.toThrow(
        'You are not access to create',
      );
    });

    it('should retrive all data ', (done) => {
      request(APP_URL)
        .get('/api/v1/beneficiaries')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });
});
