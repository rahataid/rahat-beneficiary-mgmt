import request from 'supertest';
import { faker } from '@faker-js/faker';

const PORT = 5600;
const APP_URL = `http://localhost:${PORT}`;
let beneficiaryUuid;
let beneficiaryId;
let fieldDefinitionId;
let sourceUuid;
let sourceId;
let groupId;
let beneficiarySourceId;
let beneficiaryGroupId;
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
  field_mapping: {
    data: [faker.lorem.word(), faker.location.country()],
  },
};
const groupDto = {
  name: faker.airline.airline().name,
};

const fieldDefinitionDto = {
  name: faker.person.bio(),
  field_type: 'Text',
  field_populate: {
    data: faker.number.int(),
  },
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
          console.log(res.body);
          beneficiaryUuid = res?.body?.data?.uuid;
          beneficiaryId = res?.body?.data?.id;
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

    it('Should Get Beneficiary by BENEFICIARY_UUID', (done) => {
      request(APP_URL)
        .get(`/api/v1/beneficiaries/${beneficiaryUuid}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Update Benefeciary by BENEFICIARY_UUID', (done) => {
      console.log('benefId', beneficiaryId);
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
        .send(groupDto)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          groupId = res?.body?.data?.id;
          done();
        });
    });

    it('Should Not Create Duplicate Group Name', (done) => {
      request(APP_URL)
        .post('/api/v1/group')
        .send(groupDto)
        .expect(409)
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
        .send({ beneficiary_id: beneficiaryId, group_id: groupId })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          beneficiaryGroupId = res?.body?.data?.id;
          done();
        });
    });

    it('Should Not Create Duplicate Beneficiaries Group', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiary-group')
        .send({ beneficiary_id: beneficiaryId, group_id: groupId })
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

          sourceUuid = res?.body?.data?.uuid;
          sourceId = res?.body?.data?.id;
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
        .get(`/api/v1/sources/${sourceUuid}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Update Source By Uuid', (done) => {
      request(APP_URL)
        .patch(`/api/v1/sources/${sourceUuid}`)
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
        .send({ beneficiary_id: beneficiaryId, source_id: sourceId })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          beneficiarySourceId = res?.body?.data?.id;

          done();
        });
    });

    it('Should Not Create Duplicate Beneficiary Source  ', (done) => {
      request(APP_URL)
        .post('/api/v1/beneficiarySource')
        .send({ beneficiary_id: beneficiaryId, source_id: sourceId })
        .expect(409)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('Should Update Beneficiary Source', (done) => {
      request(APP_URL)
        .patch(`/api/v1/${beneficiarySourceId}/beneficiarySource`)
        .send({ beneficiary_id: beneficiaryId, source_id: sourceId })
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
          fieldDefinitionId = res?.body?.data?.id;
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
        .patch(`/api/v1/field-definitions/${fieldDefinitionId}`)
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
        .patch(`/api/v1/field-definitions/${fieldDefinitionId}/status`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send({ is_active: false })
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
        .delete(`/api/v1/beneficiary-group/${beneficiaryGroupId}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should Remove Beneficiary Source', (done) => {
      request(APP_URL)
        .delete(`/api/v1/${beneficiarySourceId}/beneficiarySource`)
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
        .expect(404)
        .end((err, res) => {
          console.log(beneficiaryUuid);
          if (err) return done(err);
          done();
        });
    });
    it('Should Show Not Found For Update Beneficiary', (done) => {
      request(APP_URL)
        .patch(`/api/v1/beneficiaries/${beneficiaryUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .send(updateBenefDto)
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should Show Not Found  For Beneficiaries While Deleting ', (done) => {
      request(APP_URL)
        .delete(`/api/v1/beneficiaries/${beneficiaryUuid}`)
        .set('Authorization', `Bearer ${acessToken}`)
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should Remove Group Name', (done) => {
      request(APP_URL)
        .delete(`/api/v1/group/${groupId}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('Should Remove Source By Uuid', (done) => {
      request(APP_URL)
        .delete(`/api/v1/sources/${sourceUuid}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });
});
