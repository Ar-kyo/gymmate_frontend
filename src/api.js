const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
let csrfPromise;

async function fetchApi(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (error instanceof TypeError) {
      const apiOrigin = apiBase || window.location.origin;
      throw new Error(`The browser could not reach ${apiOrigin} from ${window.location.origin}. Check the backend CORS allowlist, HTTPS availability, and Render service status.`);
    }
    throw error;
  }
}

async function readJson(response) {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`The backend returned an empty response (HTTP ${response.status}). Check the backend service logs.`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`The backend returned a non-JSON response (HTTP ${response.status}). Check the backend service logs and database configuration.`);
  }
}

async function getCsrf() {
  if (!csrfPromise) {
    csrfPromise = fetchApi(`${apiBase}/api/csrf`, { credentials: 'include' })
      .then(async (response) => {
        const result = await readJson(response);
        if (!response.ok) throw new Error(result.error || `Could not start a secure session (HTTP ${response.status}).`);
        return result;
      })
      .catch((error) => {
        csrfPromise = undefined;
        throw error;
      });
  }
  return csrfPromise;
}

export async function api(path, { method = 'GET', data } = {}) {
  const options = { method, credentials: 'include', headers: {} };

  if (method !== 'GET' && method !== 'HEAD') {
    const csrf = await getCsrf();
    const body = new URLSearchParams();
    Object.entries(data || {}).forEach(([key, value]) => {
      body.set(key, value == null ? '' : String(value));
    });
    body.set(csrf.tokenName, csrf.token);
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    options.body = body;
  }

  const response = await fetchApi(`${apiBase}${path}`, options);
  const result = await readJson(response);
  if (!response.ok) throw new Error(result.error || `The request failed (HTTP ${response.status}).`);
  return result;
}
