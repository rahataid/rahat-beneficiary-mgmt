// import axios from 'axios';
// import { JwtGuard } from '@rahat/user';
// import { ForbiddenException } from '@nestjs/common';
// import { SignupDto } from '@rahat/user';
// import { CreatePermissionDto } from '@rahat/user';
import request from 'supertest';
import { faker } from '@faker-js/faker';
const beneficiariesData = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  birthDate: faker.date.birthdate().toLocaleDateString(),
  gender: faker.string.fromCharacters(['Male', 'Female', 'Other', 'Unknown']),
  location: faker.location.country(),
  latitude: faker.location.latitude(),

  longitude: faker.location.longitude(),
  phone: faker.phone.number(),
  notes: faker.lorem.sentence(),
  email: faker.internet.email(),
};

const updateBeneficiariesData = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  birthDate: faker.date.birthdate().toLocaleDateString(),
  gender: faker.string.fromCharacters(['Male', 'Female', 'Other', 'Unkown']),
  location: faker.location.country(),
  latitude: faker.location.latitude(),
  longitude: faker.location.longitude(),
  phone: faker.phone.number(),
  notes: faker.lorem.sentence(),
  email: faker.internet.email(),
};

const groupData = {
  name: faker.airline.airline().name,
};

const beneficiaryGroupData = {
  beneficiary_id: 50,
  group_id: 2,
};

const PORT = 5600;
const APP_URL = `http://localhost:${PORT}`;

let otp;
let acessToken;

const sampleuuid = '612d8703-6458-4e28-8484-bcd851a8048f';

describe('Api testing', () => {
  describe('beneficiaries crud for the valid  sampleuuid ', () => {
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

    it('should create beneficiary ', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiaries')
        .set('Authorization', `Bearer ${acessToken}`)
        .send(beneficiariesData)
        .expect(200)
        .end((err, res) => {
          console.log('create error', err);
          if (err) return done(err);
          console.log(res.body);

          done();
        });
    });

    it('should not create a beneficiary without a valid ACl', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiaries')
        .send(beneficiariesData)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
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

    it('should retrive data by  sampleuuid', (done) => {
      request(APP_URL)
        .get(`/api/v1/beneficiaries/${sampleuuid}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          console.log(res.body.length);
          done();
        });
    });

    it('should update the data by  sampleuuid', (done) => {
      request(APP_URL)
        .patch(`/api/v1/beneficiaries/${sampleuuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send(updateBeneficiariesData)
        .expect(200)
        .end((updateErr, updateRes) => {
          if (updateErr) return done(updateErr);
          done();
        });
    });
    it('should  delete data by  sampleuuid', (done) => {
      request(APP_URL)
        .delete(`/api/v1/beneficiaries/${sampleuuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((deleteErr, deleteRes) => {
          if (deleteErr) return done(deleteErr);
          done();
        });
    });
  });

  describe('beneficiaris for the not found  sampleuuid case', () => {
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

    describe(`beneficiaries`, () => {
      it('should not retrive data if data not found', (done) => {
        request(APP_URL)
          .get(`/api/v1/beneficiaries/${sampleuuid}`)
          .set('Authorization', `Bearer ${acessToken}`)
          .expect(404)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });

      it('should not update a beneficiary if not found by  sampleuuid', (done) => {
        request(APP_URL)
          .patch(`/api/v1/beneficiaries/${sampleuuid}`)
          .set('Authorization', `Bearer ${acessToken}`)
          .send(updateBeneficiariesData)
          .expect(404)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });

      it('should not delete a beneficiary if not found by  sampleuuid', (done) => {
        request(APP_URL)
          .delete(`/api/v1/beneficiaries/${sampleuuid}`)
          .set('Authorization', `Bearer ${acessToken}`)
          .expect(404)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });
    });
  });

  describe('group', () => {
    it('should create a group name', (done) => {
      request(APP_URL)
        .post('/api/v1/group')
        .send(groupData)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('beneficiaries-group for the valid id', () => {
    it('should should create a  beneficiaries group with a group id and beneficiary id', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiary-group')
        .send({
          group_id: beneficiaryGroupData.group_id,
          beneficiary_id: beneficiaryGroupData.beneficiary_id,
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('beneficiaries-group for the invalid id', () => {
    it('should should not create a  beneficiaries group with a group id and beneficiary id', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiary-group')
        .send({
          group_id: beneficiaryGroupData.group_id,
          beneficiary_id: beneficiaryGroupData.beneficiary_id,
        })
        .expect(409)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });
});
