process.env.NODE_ENV = 'test';
process.env.STORAGE_MODE = 'memory';
process.env.UPLOAD_DIR = require('path').join(require('os').tmpdir(), `plant-uploads-${process.pid}`);

jest.mock('../src/services/mlService');
const request = require('supertest');
const fs = require('fs');
const AppError = require('../src/utils/AppError');
const mlService = require('../src/services/mlService');
const app = require('../src/app');

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

const mlResult = {
  crop: 'Tomato', disease: 'Early Blight', confidence: 94.7, status: 'diseased',
  top_predictions: [{ crop: 'Tomato', disease: 'Early Blight', confidence: 94.7, status: 'diseased' }],
  symptoms: 's', treatment: ['t'], prevention: ['p'], simulated: true, model_mode: 'demo',
};

beforeEach(() => {
  mlService.predict.mockReset().mockResolvedValue(mlResult);
  mlService.health.mockReset().mockResolvedValue({ status: 'ok', mode: 'demo', simulated: true });
});
afterAll(() => fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true }));

const upload = (buf = PNG, name = 'leaf.png', type = 'image/png') =>
  request(app).post('/api/predictions').attach('image', buf, { filename: name, contentType: type });

describe('health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.ml.simulated).toBe(true);
  });
  it('reports degraded when the ML service is down', async () => {
    mlService.health.mockResolvedValue(null);
    const res = await request(app).get('/api/health');
    expect(res.body.data.status).toBe('degraded');
    expect(res.body.data.ml.reachable).toBe(false);
  });
});

describe('POST /api/predictions', () => {
  it('stores and returns a prediction', async () => {
    const res = await upload();
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ cropName: 'Tomato', predictedDisease: 'Early Blight', confidence: 94.7, status: 'diseased' });
    expect(res.body.data.id).toMatch(/^[0-9a-f]{24}$/);
    const file = res.body.data.imageUrl.replace('/uploads/', '');
    expect(fs.existsSync(`${process.env.UPLOAD_DIR}/${file}`)).toBe(true);
  });
  it('requires a file', async () => {
    const res = await request(app).post('/api/predictions');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NO_FILE');
  });
  it('rejects unsupported types', async () => {
    const res = await upload(Buffer.from('GIF89a'), 'a.gif', 'image/gif');
    expect(res.status).toBe(415);
  });
  it('rejects a file whose bytes are not an image', async () => {
    const res = await upload(Buffer.from('not really a png'), 'fake.png', 'image/png');
    expect(res.status).toBe(422);
    expect(mlService.predict).not.toHaveBeenCalled();
  });
  it('maps ML outage to 503 and cleans up the upload', async () => {
    mlService.predict.mockRejectedValue(new AppError(503, 'ML_SERVICE_UNAVAILABLE', 'down'));
    const before = fs.readdirSync(process.env.UPLOAD_DIR).length;
    const res = await upload();
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('ML_SERVICE_UNAVAILABLE');
    expect(fs.readdirSync(process.env.UPLOAD_DIR).length).toBe(before);
  });
  it('does not leak internal errors', async () => {
    mlService.predict.mockRejectedValue(new Error('secret stack detail'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await upload();
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/secret/);
  });
});

describe('read / list / delete', () => {
  it('lists, filters and paginates', async () => {
    await upload();
    mlService.predict.mockResolvedValue({ ...mlResult, disease: 'Healthy', status: 'healthy', confidence: 99 });
    await upload();
    const all = await request(app).get('/api/predictions?limit=1');
    expect(all.body.pagination.total).toBeGreaterThanOrEqual(2);
    expect(all.body.data).toHaveLength(1);
    const healthy = await request(app).get('/api/predictions?status=healthy&search=tomato');
    expect(healthy.body.data.every((p) => p.status === 'healthy')).toBe(true);
    expect((await request(app).get('/api/predictions?status=bogus')).status).toBe(400);
    expect((await request(app).get('/api/predictions?limit=500')).status).toBe(400);
  });
  it('returns stats', async () => {
    const res = await request(app).get('/api/predictions/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(res.body.data.healthy + res.body.data.diseased);
  });
  it('gets and deletes by id', async () => {
    const { body } = await upload();
    const { id, imageUrl } = body.data;
    expect((await request(app).get(`/api/predictions/${id}`)).status).toBe(200);
    expect((await request(app).delete(`/api/predictions/${id}`)).status).toBe(200);
    expect((await request(app).get(`/api/predictions/${id}`)).status).toBe(404);
    expect(fs.existsSync(`${process.env.UPLOAD_DIR}/${imageUrl.replace('/uploads/', '')}`)).toBe(false);
  });
  it('rejects malformed ids and 404s unknown ones', async () => {
    const bad = await request(app).get('/api/predictions/not-an-id');
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe('INVALID_ID');
    expect((await request(app).delete('/api/predictions/zzz')).status).toBe(400);
    expect((await request(app).get('/api/predictions/aaaaaaaaaaaaaaaaaaaaaaaa')).status).toBe(404);
  });
  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
