import axios from 'axios';

const client = axios.create({ baseURL: '/api', timeout: 60000 });

/** Turns any axios failure into an Error with a message that is safe to show users. */
export function toFriendlyError(err) {
  const apiError = err.response?.data?.error;
  if (apiError) return Object.assign(new Error(apiError.message), { code: apiError.code });
  if (err.code === 'ECONNABORTED') return Object.assign(new Error('The request took too long. Please try again.'), { code: 'TIMEOUT' });
  return Object.assign(new Error('We could not reach the server. Check your connection and try again.'), { code: 'NETWORK' });
}

async function request(promise) {
  try {
    return await promise;
  } catch (err) {
    throw toFriendlyError(err);
  }
}

export async function createPrediction(file, onUploadProgress) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await request(client.post('/predictions', form, { onUploadProgress }));
  return data.data;
}

export async function listPredictions(params) {
  const { data } = await request(client.get('/predictions', { params }));
  return { items: data.data, pagination: data.pagination };
}

export async function getPrediction(id) {
  const { data } = await request(client.get(`/predictions/${id}`));
  return data.data;
}

export async function deletePrediction(id) {
  await request(client.delete(`/predictions/${id}`));
}

export async function getStats() {
  const { data } = await request(client.get('/predictions/stats'));
  return data.data;
}
