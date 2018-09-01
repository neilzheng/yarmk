const MakeServer = require('./server');
const request = require('supertest');
const { expect } = require('chai');

const Auth = {
  login(ctx) {
    ctx.body = { action: 'login' };
  },

  logout(ctx) {
    ctx.body = { action: 'logout' };
  },
};

describe('test restful api contructed by full options', () => {
  let agent;
  let server;

  before(() => {
    const options = {
      controller: Auth,
      urls: [{
        path: '/auth/login',
        handlers: {
          POST: 'login',
        },
      },
      {
        path: '/auth/logout',
        handlers: {
          GET: 'logout',
        },
      }],
    };

    server = MakeServer(options);
    agent = request.agent(server);
  });

  it('should login', async () => {
    const res = await agent.post('/auth/login');
    expect(res.body.action).to.eq('login');
  });

  it('should logout', async () => {
    const res = await agent.get('/auth/logout');
    expect(res.body.action).to.eq('logout');
  });

  after(() => {
    server.close();
  });
});
