import { request, handle } from './apiClient.js';

// envia o FormData com a foto nova ou apenas os dados em JSON direto pro backend
/**
 * Atualiza o perfil do usuário.
 * @param {object|FormData} data - Os novos dados do perfil.
 * @returns {Promise<any>} O perfil atualizado.
 */
export const updateProfile = (data) => handle(request("/profile/", {
    method: "PATCH",
    body: data
}));

/**
 * Solicita a alteração de email.
 * @param {string} new_email - O novo email desejado.
 * @param {string} current_password - A senha atual para verificação.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const requestEmailChange = (new_email, current_password) => handle(request("/auth/profile/email-change/request/", {
    method: "POST",
    body: JSON.stringify({ new_email, current_password })
}));

/**
 * Confirma a alteração de email com o código recebido.
 * @param {string} new_email - O novo email.
 * @param {string} code - O código de verificação.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const confirmEmailChange = (new_email, code) => handle(request("/auth/profile/email-change/confirm/", {
    method: "POST",
    body: JSON.stringify({ new_email, code })
}));

/**
 * Altera a senha do usuário.
 * @param {string} current_password - A senha atual.
 * @param {string} new_password - A nova senha.
 * @param {string} new_password_confirm - A confirmação da nova senha.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const changePassword = (current_password, new_password, new_password_confirm) => handle(request("/auth/change-password/", {
    method: "POST",
    body: JSON.stringify({ current_password, new_password, new_password_confirm })
}));

/**
 * Obtém as configurações do usuário.
 * @returns {Promise<any>} As configurações atuais.
 */
export const getUserSettings = () => handle(request("/auth/settings/"));

/**
 * Atualiza as configurações do usuário.
 * @param {object} data - As novas configurações.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const updateUserSettings = (data) => handle(request("/auth/settings/", {
    method: "PATCH",
    body: JSON.stringify(data)
}));

// Exclui a conta do usuário confirmando a senha atual
/**
 * Exclui a conta do usuário.
 * @param {string} password - A senha atual para verificação.
 * @returns {Promise<any>} A resposta da exclusão.
 */
export const deleteAccount = (password) => handle(request("/auth/delete-account/", {
    method: "DELETE",
    body: JSON.stringify({ password })
}));
