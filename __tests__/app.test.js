require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async () => {
      execSync('npm run setup-db');

      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line
    }, 10000);

    afterAll(done => {
      return client.end(done);
    });

    test('POST create todo list', async() => {

      const expectation = [
        {
          id: 2,
          todo: 'brush teeth',
          completed: false,
          owner_id: 2
        }
      ];

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[0])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('GET todo list', async() => {

      const expectation = [
        {
          id: 2,
          todo: 'brush teeth',
          completed: false,
          owner_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('PUT updates a todo item', async() => {

      const expectation = [
        {
          id: 2,
          todo: 'brush teeth',
          completed: true,
          owner_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .put('/api/todos/2')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);


      expect(data.body).toEqual(expectation);
    });
  });
});
