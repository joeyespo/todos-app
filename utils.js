export async function request(url, method = 'GET', data = null) {
  console.debug(`Requesting... ${method} ${url} ${data ? JSON.stringify(data) : ''}`);
  const r = await fetch(url, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  console.debug('Done! r.status =', r.status);
  if (!r.ok) {
    // TODO: Better error handling
    throw new Error('Request error');
  }

  return await r.json();
}

export function removed(array, value) {
  const index = array.indexOf(value);
  if (index === -1) {
    return array;
  }
  const result = array.slice();
  result.splice(index, 1);
  return result;
}

// Generate a UUID based on RFC4122
// https://stackoverflow.com/a/2117523/233098
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
