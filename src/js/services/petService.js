import { request, handle } from './apiClient.js';

/**
 * Obtém a lista de pets.
 * @returns {Promise<any>} A lista de pets do usuário.
 */
export const getPets = () => handle(request("/pets/"));

/**
 * Obtém os detalhes de um pet específico.
 * @param {string|number} id - O ID do pet.
 * @returns {Promise<any>} Os detalhes do pet.
 */
export const getPetDetails = (id) => handle(request(`/pets/${id}/`));

export const getPetById = getPetDetails;

/**
 * Cria um novo pet.
 * @param {object|FormData} data - Os dados do pet.
 * @returns {Promise<any>} Os dados do pet criado.
 */
export const createPet = (data) => handle(request("/pets/", {
    method: "POST",
    body: data, // formData suporta File
}));

/**
 * Atualiza um pet existente.
 * @param {string|number} id - O ID do pet.
 * @param {object|FormData} petData - Os dados a serem atualizados.
 * @returns {Promise<any>} Os dados atualizados do pet.
 */
export const updatePet = (id, petData) => handle(request(`/pets/${id}/`, {
    method: "PATCH",
    // checa dinamicamente se o payload tem arquivo (FormData) ou se é um json normal, senão a API chora
    body: petData instanceof FormData ? petData : JSON.stringify(petData),
}));

/**
 * Remove um pet.
 * @param {string|number} id - O ID do pet a ser removido.
 * @returns {Promise<any>} A resposta da exclusão.
 */
export const deletePet = (id) => handle(request(`/pets/${id}/`, {
    method: "DELETE"
}));
