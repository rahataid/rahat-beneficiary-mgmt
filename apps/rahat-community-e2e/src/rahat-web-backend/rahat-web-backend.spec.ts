import request from 'supertest';
import { faker } from '@faker-js/faker';

const PORT = 5600;
const APP_URL = `http://localhost:${PORT}`;
let beneficiaryUuid;
let beneficiary_id;
let fieldDefinition_id;
let sourceUuid;
let source_id;
let group_id;
let beneficiarysource_id;
let beneficiarygroup_id;
let otp;
let acessToken;

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
  fieldMapping: {
    data: [
      {
        email: faker.internet.email(),
        phone: faker.phone.number(),
        gender: faker.string.fromCharacters([
          'Male',
          'Female',
          'Other',
          'Unkown',
        ]),
        lastName: faker.person.lastName(),
        firstName: faker.person.firstName(),
      },
    ],
  },
};

const groupDto = {
  name: faker.airline.airline().name,
};

const fieldDefinitionDto = {
  name: faker.person.fullName(),
  fieldType: faker.string.fromCharacters([
    'TEXT',
    'NUMBER',
    'RADIO',
    'DROPDOWN',
    'CHECKBOX',
  ]),
};

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
          otp = res?.body?.data?.otp;
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
          acessToken = res?.body?.data?.accessToken;
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
          beneficiaryUuid = res?.body?.data?.uuid;
          beneficiary_id = res?.body?.data?.id;
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
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          done();
        });
    });

    it('Should Get Beneficiary by BENEFICIARY_UUID', (done) => {
      request(APP_URL)
        .get(`/api/v1/beneficiaries/${beneficiaryUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Update Benefeciary by BENEFICIARY_UUID', (done) => {
      request(APP_URL)
        .patch(`/api/v1/beneficiaries/${beneficiaryUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send({ updateBenefDto })
        .expect(200)
        .end((updateErr, updateRes) => {
          if (updateErr) return done(updateErr);
          done();
        });
    });
  });

  describe('Group Module ', () => {
    it('Should Create  Group Name', (done) => {
      request(APP_URL)
        .post('/api/v1/group')
        .set('Authorization', `Bearer ${acessToken}`)
        .send(groupDto)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          group_id = res?.body?.data?.id;
          done();
        });
    });

    it('Should Not Create Duplicate Group Name', (done) => {
      request(APP_URL)
        .post('/api/v1/group')
        .set('Authorization', `Bearer ${acessToken}`)
        .send(groupDto)
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('Beneficiaries Group Module', () => {
    it('Should Create Beneficiaries Group', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiary-group')
        .set('Authorization', `Bearer ${acessToken}`)
        .send({ beneficiaryId: beneficiary_id, groupId: group_id })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          beneficiarygroup_id = res?.body?.data?.id;
          done();
        });
    });

    it('Should Not Create Duplicate Beneficiaries Group', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiary-group')
        .set('Authorization', `Bearer ${acessToken}`)
        .send({ beneficiaryId: beneficiary_id, groupId: group_id })
        .expect(500)
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
        .set('Authorization', `Bearer ${acessToken}`)
        .send(sourceDto)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          sourceUuid = res?.body?.data?.uuid;
          source_id = res?.body?.data?.id;
          done();
        });
    });

    it('Should List All Sources', (done) => {
      request(APP_URL)
        .get('/api/v1/sources')
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done(err);
        });
    });

    it('Should Get Source By Uuid', (done) => {
      request(APP_URL)
        .get(`/api/v1/sources/${sourceUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Update Source By Uuid', (done) => {
      request(APP_URL)
        .patch(`/api/v1/sources/${sourceUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send(sourceDto)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          done();
        });
    });
  });

  describe(`Beneficiary Source Module`, () => {
    it('Should Create Benificiary Source  ', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiarySource')
        .set('Authorization', `Bearer ${acessToken}`)
        .send({ beneficiaryId: beneficiary_id, sourceId: source_id })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          beneficiarysource_id = res?.body?.data?.id;

          done();
        });
    });

    it('Should Not Create Duplicate Beneficiary Source  ', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiarySource')
        .set('Authorization', `Bearer ${acessToken}`)
        .send({ beneficiaryId: beneficiary_id, sourceId: source_id })
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Update Beneficiary Source', (done) => {
      request(APP_URL)
        .patch(`/api/v1/beneficiarySource/${beneficiarysource_id}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send({ beneficiaryId: beneficiary_id, sourceId: source_id })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe(`Field Definition Module`, () => {
    it('Should create the Field Definition ', (done) => {
      request(APP_URL)
        .post('/api/v1/field-definitions')
        .set('Authorization', `Bearer ${acessToken}`)
        .send(fieldDefinitionDto)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          fieldDefinition_id = res?.body?.data?.id;
          done();
        });
    });
    it('Should List All Field Definition', (done) => {
      request(APP_URL)
        .get('/api/v1/field-definitions')
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          done();
        });
    });

    it('Should Update Field Definition', (done) => {
      request(APP_URL)
        .patch(`/api/v1/field-definitions/${fieldDefinition_id}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send(fieldDefinitionDto)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Update Field Definition Stauts', (done) => {
      request(APP_URL)
        .patch(`/api/v1/field-definitions/${fieldDefinition_id}/status`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send({ isActive: false })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          done();
        });
    });
  });

  describe(`Case For Delete`, () => {
    it('Should Remove Beneficiary Group', (done) => {
      request(APP_URL)
        .delete(`/api/v1/beneficiary-group/${beneficiarygroup_id}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should Remove Beneficiary Source', (done) => {
      request(APP_URL)
        .delete(`/api/v1/beneficiarySource/${beneficiarysource_id}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should  Delete Beneficiary by BENEFICIARY_UUID', (done) => {
      request(APP_URL)
        .delete(`/api/v1/beneficiaries/${beneficiaryUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((deleteErr, deleteRes) => {
          if (deleteErr) return done(deleteErr);
          done();
        });
    });
    it('Should not Get Beneficiary if Data Not Found', (done) => {
      request(APP_URL)
        .get(`/api/v1/beneficiaries/${beneficiaryUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should Show Not Found For Update Beneficiary', (done) => {
      request(APP_URL)
        .patch(`/api/v1/beneficiaries/${beneficiaryUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send(updateBenefDto)
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should Show Not Found  For Beneficiaries While Deleting ', (done) => {
      request(APP_URL)
        .delete(`/api/v1/beneficiaries/${beneficiaryUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should Remove Group Name', (done) => {
      request(APP_URL)
        .delete(`/api/v1/group/${group_id}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should Remove Source By Uuid', (done) => {
      request(APP_URL)
        .delete(`/api/v1/sources/${sourceUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });
});
