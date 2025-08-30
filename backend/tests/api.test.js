const request = require('supertest');
const express = require('express');

// Example: import your app here
// const app = require('../server.cjs');

// Dummy test (replace with real app import)
describe('API health', () => {
  it('should return 404 for unknown route', async () => {
    const app = express();
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
  });
});
