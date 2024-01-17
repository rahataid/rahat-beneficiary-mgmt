import request from 'supertest';
import { faker } from '@faker-js/faker';
const createBenefDto = {
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

const updateBenefDto = {
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

const sourceDto = {
  name: faker.person.fullName(),
  details: {
    data: faker.lorem.text(),
  },
  field_mapping: {
    data: [faker.lorem.word(), faker.location.country()],
  },
};
const groupData = {
  name: faker.airline.airline().name,
};

const beneficiaryGroupData = {
  beneficiary_id: 16,
  group_id: 1,
};

const PORT = 5600;
const APP_URL = `http://localhost:${PORT}`;
const SAMPLE_UUID = 'b6f9869f-65cd-49b5-b67d-a448a3205ff5';
const SOURCE_UUID = '02b57ade-e867-44b1-9ef3-a5b07b162803';
let otp;
let acessToken;

describe('Rahat Community E2E Testing', () => {
  describe('User Module', () => {
    const email = 'admin@mailinator.com';
    it('Should Send OTP', (done) => {
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
    it('Should Login using OTP', (done) => {
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

  describe('Beneficiary Module', () => {
    it('Should Create Beneficiary ', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiaries')
        .set('Authorization', `Bearer ${acessToken}`)
        .send(createBenefDto)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          // console.log(res.body);

          done();
        });
    });

    it('Should not Create Beneficiary without Valid ACL', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiaries')
        .send(createBenefDto)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should List All Beneficiaries', (done) => {
      request(APP_URL)
        .get('/api/v1/beneficiaries')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          done();
        });
    });

    it('Should Get Beneficiary by SAMPLE_UUID', (done) => {
      request(APP_URL)
        .get(`/api/v1/beneficiaries/${SAMPLE_UUID}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          console.log(res.body.length);
          done();
        });
    });

    it('Should Update Benefeciary by SAMPLE_UUID', (done) => {
      request(APP_URL)
        .patch(`/api/v1/beneficiaries/${SAMPLE_UUID}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send(updateBenefDto)
        .expect(200)
        .end((updateErr, updateRes) => {
          if (updateErr) return done(updateErr);
          done();
        });
    });

    it('Should  Delete Beneficiary by SAMPLE_UUID', (done) => {
      request(APP_URL)
        .delete(`/api/v1/beneficiaries/${SAMPLE_UUID}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((deleteErr, deleteRes) => {
          if (deleteErr) return done(deleteErr);
          done();
        });
    });

    it('Should not Get Beneficiary if Data Not Found', (done) => {
      request(APP_URL)
        .get(`/api/v1/beneficiaries/${SAMPLE_UUID}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should not Update Beneficiary If Not Found', (done) => {
      request(APP_URL)
        .patch(`/api/v1/beneficiaries/${SAMPLE_UUID}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send(updateBenefDto)
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should not Delete Beneficiary If Not Found ', (done) => {
      request(APP_URL)
        .delete(`/api/v1/beneficiaries/${SAMPLE_UUID}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('Group Module ', () => {
    it('Should Create  Group Name', (done) => {
      request(APP_URL)
        .post('/api/v1/group')
        .send(groupData)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Not Create Duplicate Group Name', (done) => {
      request(APP_URL)
        .post('/api/v1/group')
        .send(groupData)
        .expect(409)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('Beneficiaries Group Module', () => {
    it('Should Create Beneficiaries Group With group_id And beneficiary_id', (done) => {
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

    it('Should Not Create Beneficiaries Group With Duplication group_id And beneficiary_id', (done) => {
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

  describe(`Source Module`, () => {
    it('Should Create Source Name', (done) => {
      request(APP_URL)
        .post('/api/v1/sources')
        .send(sourceDto)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should List All Sources', (done) => {
      request(APP_URL)
        .get('/api/v1/sources')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done(err);
        });
    });

    it('Should Get Source By Uuid', (done) => {
      request(APP_URL)
        .get(`/api/v1/sources/${SOURCE_UUID}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Update Source', (done) => {
      request(APP_URL)
        .patch(`/api/v1/sources/${SOURCE_UUID}`)
        .send(sourceDto)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          done();
        });
    });

    it('Should Remove Source ', (done) => {
      request(APP_URL)
        .delete(`/api/v1/sources/${SOURCE_UUID}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });
});
