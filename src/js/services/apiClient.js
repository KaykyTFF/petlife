/**
 * Core do cliente da API do LifePet
 * Centraliza as requisições (fetch), o envio de tokens JWT e a interceptação global de erros.
 */

const API_BASE_URL = "http://127.0.0.1:8000/api";
import { Logger } from '../utils/logger.js';

/**
 * Realiza requisições para a API.
 * @param {string} endpoint - O endpoint da API.
 * @param {object} options - Opções adicionais para a requisição.
 * @returns {Promise<object>} Um objeto contendo os dados da resposta ou erro.
 */
export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");
  
  const headers = {
    ...options.headers,
  };

  // seta o content-type padrão como json, a não ser que a gente esteja mandando um FormData (ex: upload de foto)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !options.noAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const startTime = performance.now();
    let parsedPayload = options.body;
    try { if (typeof options.body === 'string') parsedPayload = JSON.parse(options.body); } catch(e){}
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const duration = Math.round(performance.now() - startTime);
    
    // se bater num 401 ou 403, a gente intercepta aqui pra não quebrar a aplicação na cara do user
    if ((response.status === 401 || response.status === 403) && !options.noAuth) {
        if (response.status === 401 && !options._retry) {
            const refresh = localStorage.getItem("refresh_token");
            if (refresh) {
                // o access_token morreu, vamo tentar pegar um novo usando o refresh token
                console.log("Token expired, attempting refresh...");
                try {
                    const refreshRes = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refresh })
                    });

                    if (refreshRes.ok) {
                        const refreshData = await refreshRes.json();
                        localStorage.setItem("access_token", refreshData.access);
                        console.log("Token refreshed successfully.");
                        // repete o fetch original que tinha dado erro, agora com o token fresquinho
                        return request(endpoint, { ...options, _retry: true });
                    }
                } catch (refreshErr) {
                    console.error("Error during token refresh:", refreshErr);
                }
            }
        }
        
        // se o refresh falhou também ou a gente tomou um Forbidden direto, limpa a sujeira e joga pro login
        console.warn(`Auth error (${response.status}). Redirecting to login...`);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        
        // Verifica se é página pública
        const publicPages = ['/pages/login/', '/pages/cadastro/', '/pages/recuperar-senha/', '/pages/confirmar-codigo/'];
        const isPublicPage = publicPages.some(p => window.location.pathname.includes(p));
        
        if (!isPublicPage && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = "/pages/login/index.html";
        }
        
        const data = await response.json().catch(() => ({ detail: "Sessão expirada." }));
        Logger.api(options.method || 'GET', endpoint, parsedPayload, response.status, duration, data);
        return { error: data, status: response.status };
    }

    // Para respostas sem conteúdo
    if (response.status === 204) {
        Logger.api(options.method || 'GET', endpoint, parsedPayload, response.status, duration, null);
        return { data: null, status: 204 };
    }

    const data = await response.json();
    Logger.api(options.method || 'GET', endpoint, parsedPayload, response.status, duration, data);
    
    if (!response.ok) {
      return { error: data, status: response.status };
    }
    
    return { data, status: response.status };
  } catch (error) {
    Logger.api(options.method || 'GET', endpoint, options.body, 0, 0, { error: error.message || 'Fetch failed' });
    console.error(`API Error on ${endpoint}:`, error);
    return { error: { detail: "Erro de conexão com o servidor." }, status: 500 };
  }
}

/**
 * Resolve a promise jogando o erro direto pro catch caso o payload venha zoado
 * @param {Promise} promise - A promise da requisição.
 * @returns {Promise<any>} Os dados da resposta.
 */
export async function handle(promise) {
    const res = await promise;
    if (res.error) throw res.error;
    return res.data;
}

/**
 * Retorna URL absoluta baseada na API
 * @param {string} path - O caminho da mídia.
 * @returns {string|null} A URL completa da mídia.
 */
export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  return `${baseUrl}${path}`;
};
