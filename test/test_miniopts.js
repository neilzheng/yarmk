const MakeServer = require('./server');
const request = require('supertest');
const { expect } = require('chai');

const TestController = {
  action1(method) {
    return { method };
  },

  action2(method, id) {
    return { method, id };
  },

  list(ctx) {
    ctx.body = this.action1('list');
  },

  create(ctx) {
    ctx.body = this.action1('create');
  },

  fetch(ctx, id) {
    ctx.body = this.action2('fetch', id);
  },

  update(ctx, id) {
    ctx.body = this.action2('update', id);
  },

  remove(ctx, id) {
    ctx.body = this.action2('remove', id);
  }
};

describe('test restful api contructed by mini options', () => {
  let agent;
  let server;

  before(() => {
    server = MakeServer({
      controller: TestController,
      name: 'test'
    });
    agent = request.agent(server);
  });

  it('should list', async () => {
    const res = await agent.get('/test');
    expect(res.body.method).to.eq('list');
  });

  it('should create', async () => {
    const res = await agent.post('/test');
    expect(res.body.method).to.eq('create');
  });

  it('should fetch', async () => {
    const res = await agent.get('/test/123');
    expect(res.body.method).to.eq('fetch');
    expect(res.body.id).to.eq('123');
  });

  it('should update', async () => {
    const res = await agent.patch('/test/123');
    expect(res.body.method).to.eq('update');
    expect(res.body.id).to.eq('123');
  });

  it('should remove', async () => {
    const res = await agent.delete('/test/123');
    expect(res.body.method).to.eq('remove');
    expect(res.body.id).to.eq('123');
  });

  after(() => {
    server.close();
  });
});
