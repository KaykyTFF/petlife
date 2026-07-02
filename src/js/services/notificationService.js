import { request, handle } from './apiClient.js';

// varre o banco pra puxar a lista de notificações do usuário que tá logado
/**
 * Obtém as notificações do usuário.
 * @returns {Promise<any>} A lista de notificações.
 */
export const getNotifications = () => handle(request("/notificacoes/"));

/**
 * Marca uma notificação como lida.
 * @param {string|number} key - O ID ou chave da notificação.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const markNotificationAsRead = (key) => handle(request(`/notificacoes/${key}/read/`, {
    method: "PATCH"
}));

/**
 * Marca todas as notificações como lidas.
 * @returns {Promise<any>} A resposta da requisição.
 */
export const markAllNotificationsAsRead = () => handle(request("/notificacoes/mark-all-read/", {
    method: "PATCH"
}));
