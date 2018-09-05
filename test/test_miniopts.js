const MakeServer = require('./server');
const request = require('supertest');
const { expect } = require('chai');

const TestController = {
  handle1(method) {
    return { method };
  },

  handle2(method, id) {
    return { method, id };
  },

  list(ctx) {
    ctx.body = this.handle1('list');
  },

  create(ctx) {
    ctx.body = this.handle1('create');
  },

  fetch(ctx, id) {
    ctx.body = this.handle2('fetch', id);
  },

  update(ctx, id) {
    ctx.body = this.handle2('update', id);
  },

  remove(ctx, id) {
    ctx.body = this.handle2('remove', id);
  },

  action(ctx, id) {
    ctx.body = this.handle2('action', id);
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

  it('should action', async () => {
    const res = await agent.put('/test/123');
    expect(res.body.method).to.eq('action');
    expect(res.body.id).to.eq('123');
  });

  after(() => {
    server.close();
  });
});
