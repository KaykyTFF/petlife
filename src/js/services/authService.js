import { request, handle } from './apiClient.js';

/**
 * Realiza o login do usuário.
 * @param {string} email - O email do usuário.
 * @param {string} password - A senha do usuário.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const login = (email, password) => 
    // a flag noAuth = true impede o apiClient de tentar enviar um token que não existe ainda
    request("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ username: email, password }),
        noAuth: true
    });

/**
 * Registra um novo usuário.
 * @param {object} userData - Os dados do usuário.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const register = (userData) => 
    request("/auth/register/", {
        method: "POST",
        body: JSON.stringify(userData),
        noAuth: true
    });

/**
 * Verifica se um email já está cadastrado.
 * @param {string} email - O email a ser verificado.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const checkEmail = (email) =>
    request("/auth/check-email/", {
        method: "POST",
        body: JSON.stringify({ email }),
        noAuth: true
    });

// joga um timestamp na url pra forçar o browser a não cachear a requisição do profile
/**
 * Obtém os dados do usuário atualmente logado.
 * @returns {Promise<any>} Os dados do usuário.
 */
export const getMe = () => handle(request(`/auth/me/?_t=${Date.now()}`));

export const getCurrentUser = getMe;

/**
 * Atualiza o token de acesso.
 * @param {string} refresh - O refresh token.
 * @returns {Promise<any>} A resposta da requisição com o novo token.
 */
export const refreshToken = (refresh) => 
    request("/auth/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
        noAuth: true
    });

/**
 * Solicita a redefinição de senha.
 * @param {string} email - O email do usuário.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const requestPasswordReset = (email) => 
    request("/auth/password-reset/request/", {
        method: "POST",
        body: JSON.stringify({ email }),
        noAuth: true
    });

/**
 * Verifica o código de redefinição de senha.
 * @param {string} email - O email do usuário.
 * @param {string} code - O código recebido.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const verifyPasswordResetCode = (email, code) => 
    request("/auth/password-reset/verify-code/", {
        method: "POST",
        body: JSON.stringify({ email, code }),
        noAuth: true
    });

/**
 * Confirma a redefinição de senha.
 * @param {string} email - O email do usuário.
 * @param {string} code - O código de verificação.
 * @param {string} newPassword - A nova senha.
 * @param {string} newPasswordConfirm - A confirmação da nova senha.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const confirmPasswordReset = (email, code, newPassword, newPasswordConfirm) => 
    request("/auth/password-reset/confirm/", {
        method: "POST",
        body: JSON.stringify({ 
            email, 
            code, 
            new_password: newPassword, 
            new_password_confirm: newPasswordConfirm 
        }),
        noAuth: true
    });
