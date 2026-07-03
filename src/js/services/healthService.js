import { request, handle, getMediaUrl } from './apiClient.js';

// Vacinas
/**
 * Obtém a lista de vacinas.
 * @param {string|number} [petId] - ID do pet opcional para filtrar as vacinas.
 * @returns {Promise<any>} A lista de vacinas.
 */
export const getVaccines = (petId) => {
  const endpoint = petId ? `/vacinas/?pet=${petId}` : "/vacinas/";
  return handle(request(endpoint));
};

/**
 * Cria um registro de vacina.
 * @param {object} data - Os dados da vacina.
 * @returns {Promise<any>} Os dados da vacina criada.
 */
export const createVaccine = (data) => handle(request("/vacinas/", {
  method: "POST",
  body: JSON.stringify(data)
}));

/**
 * Atualiza um registro de vacina.
 * @param {string|number} id - O ID da vacina.
 * @param {object} data - Os dados atualizados da vacina.
 * @returns {Promise<any>} Os dados da vacina atualizada.
 */
export const updateVaccine = (id, data) => handle(request(`/vacinas/${id}/`, {
  method: "PATCH",
  body: JSON.stringify(data)
}));

/**
 * Remove um registro de vacina.
 * @param {string|number} id - O ID da vacina a ser removida.
 * @returns {Promise<any>} A resposta da exclusão.
 */
export const deleteVaccine = (id) => handle(request(`/vacinas/${id}/`, {
  method: "DELETE"
}));

// Vermífugos
/**
 * Obtém a lista de vermífugos.
 * @param {string|number} [petId] - ID do pet opcional para filtrar.
 * @returns {Promise<any>} A lista de vermífugos.
 */
export const getDeworming = (petId) => {
  const endpoint = petId ? `/vermifugos/?pet=${petId}` : "/vermifugos/";
  return handle(request(endpoint));
};

/**
 * Cria um registro de vermífugo.
 * @param {object} data - Os dados do vermífugo.
 * @returns {Promise<any>} Os dados do vermífugo criado.
 */
export const createDeworming = (data) => handle(request("/vermifugos/", {
  method: "POST",
  body: JSON.stringify(data)
}));

/**
 * Atualiza um registro de vermífugo.
 * @param {string|number} id - O ID do vermífugo.
 * @param {object} data - Os dados atualizados.
 * @returns {Promise<any>} Os dados atualizados.
 */
export const updateDeworming = (id, data) => handle(request(`/vermifugos/${id}/`, {
  method: "PATCH",
  body: JSON.stringify(data)
}));

/**
 * Remove um registro de vermífugo.
 * @param {string|number} id - O ID do vermífugo a ser removido.
 * @returns {Promise<any>} A resposta da exclusão.
 */
export const deleteDeworming = (id) => handle(request(`/vermifugos/${id}/`, {
  method: "DELETE"
}));

// Consultas
/**
 * Obtém a lista de consultas.
 * @param {string|number} [petId] - ID do pet opcional para filtrar.
 * @returns {Promise<any>} A lista de consultas.
 */
export const getAppointments = (petId) => {
  const endpoint = petId ? `/consultas/?pet=${petId}` : "/consultas/";
  return handle(request(endpoint));
};

/**
 * Cria um registro de consulta.
 * @param {object} data - Os dados da consulta.
 * @returns {Promise<any>} Os dados da consulta criada.
 */
export const createAppointment = (data) => handle(request("/consultas/", {
  method: "POST",
  body: JSON.stringify(data)
}));

/**
 * Atualiza um registro de consulta.
 * @param {string|number} id - O ID da consulta.
 * @param {object} data - Os dados atualizados.
 * @returns {Promise<any>} Os dados atualizados.
 */
export const updateAppointment = (id, data) => handle(request(`/consultas/${id}/`, {
  method: "PATCH",
  body: JSON.stringify(data)
}));

/**
 * Remove um registro de consulta.
 * @param {string|number} id - O ID da consulta a ser removida.
 * @returns {Promise<any>} A resposta da exclusão.
 */
export const deleteAppointment = (id) => handle(request(`/consultas/${id}/`, {
  method: "DELETE"
}));

// Histórico de Saúde
/**
 * Obtém o histórico de saúde.
 * @param {string|number} [petId] - ID do pet opcional para filtrar.
 * @returns {Promise<any>} O histórico de saúde.
 */
export const getHealthHistory = (petId) => {
  const endpoint = petId ? `/historico/?pet=${petId}` : "/historico/";
  return handle(request(endpoint));
};

// Pesos (Controle de Peso)
/**
 * Obtém a lista de registros de peso.
 * @param {string|number} [petId] - ID do pet opcional para filtrar.
 * @returns {Promise<any>} A lista de pesos.
 */
export const getPesos = (petId) => {
  const endpoint = petId ? `/pesos/?pet=${petId}` : "/pesos/";
  return handle(request(endpoint));
};

/**
 * Cria um registro de peso.
 * @param {object} data - Os dados do peso.
 * @returns {Promise<any>} Os dados criados.
 */
export const createPeso = (data) => handle(request("/pesos/", {
  method: "POST",
  body: JSON.stringify(data)
}));

/**
 * Atualiza um registro de peso.
 * @param {string|number} id - O ID do peso.
 * @param {object} data - Os dados atualizados.
 * @returns {Promise<any>} Os dados atualizados.
 */
export const updatePeso = (id, data) => handle(request(`/pesos/${id}/`, {
  method: "PATCH",
  body: JSON.stringify(data)
}));

/**
 * Remove um registro de peso.
 * @param {string|number} id - O ID a ser removido.
 * @returns {Promise<any>} A resposta da exclusão.
 */
export const deletePeso = (id) => handle(request(`/pesos/${id}/`, {
  method: "DELETE"
}));

// Medicamentos
/**
 * Obtém a lista de medicamentos.
 * @param {string|number} [petId] - ID do pet opcional para filtrar.
 * @returns {Promise<any>} A lista de medicamentos.
 */
export const getMedicamentos = (petId) => {
  const endpoint = petId ? `/medicamentos/?pet=${petId}` : "/medicamentos/";
  return handle(request(endpoint));
};

/**
 * Cria um registro de medicamento.
 * @param {object} data - Os dados do medicamento.
 * @returns {Promise<any>} Os dados criados.
 */
export const createMedicamento = (data) => handle(request("/medicamentos/", {
  method: "POST",
  body: JSON.stringify(data)
}));

/**
 * Atualiza um registro de medicamento.
 * @param {string|number} id - O ID do medicamento.
 * @param {object} data - Os dados atualizados.
 * @returns {Promise<any>} Os dados atualizados.
 */
export const updateMedicamento = (id, data) => handle(request(`/medicamentos/${id}/`, {
  method: "PATCH",
  body: JSON.stringify(data)
}));

/**
 * Remove um registro de medicamento.
 * @param {string|number} id - O ID a ser removido.
 * @returns {Promise<any>} A resposta da exclusão.
 */
export const deleteMedicamento = (id) => handle(request(`/medicamentos/${id}/`, {
  method: "DELETE"
}));

// Calendário
/**
 * Obtém os eventos do calendário combinando vacinas, vermífugos e consultas.
 * @returns {Promise<Array>} A lista de eventos combinados.
 */
export const getCalendarEvents = async () => {
  // dispara as 3 requisições em paralelo com Promise.all pra evitar que o front fique travado esperando uma por vez
  const [vaccines, deworming, appointments] = await Promise.all([
    getVaccines(),
    getDeworming(),
    getAppointments()
  ]);

  const vEvents = (vaccines || []).filter(v => v.proxima_data).map(v => ({
    id: v.id,
    type: 'vaccine',
    title: `Vacina: ${v.nome}`,
    date: v.proxima_data,
    pet: {
        id: v.pet,
        name: v.pet_data?.nome || "Pet",
        photo: getMediaUrl(v.pet_data?.foto),
        breed: v.pet_data?.raca
    },
    pet_name: v.pet_data?.nome || "Pet",
    status: v.concluido ? 'completed' : 'pending',
    time: "08:00"
  }));

  const dEvents = (deworming || []).filter(d => d.proxima_data).map(d => ({
    id: d.id,
    type: 'deworming',
    title: `Vermífugo: ${d.nome_produto}`,
    date: d.proxima_data,
    pet: {
        id: d.pet,
        name: d.pet_data?.nome || "Pet",
        photo: getMediaUrl(d.pet_data?.foto),
        breed: d.pet_data?.raca
    },
    pet_name: d.pet_data?.nome || "Pet",
    status: d.concluido ? 'completed' : 'pending',
    time: "08:00"
  }));

  const aEvents = (appointments || []).map(a => ({
    id: a.id,
    type: 'appointment',
    title: `Consulta: ${a.motivo}`,
    date: a.data,
    time: a.hora ? a.hora.substring(0, 5) : "---",
    pet: {
        id: a.pet,
        name: a.pet_data?.nome || "Pet",
        photo: getMediaUrl(a.pet_data?.foto),
        breed: a.pet_data?.raca
    },
    pet_name: a.pet_data?.nome || "Pet",
    status: a.computed_status || a.status
  }));

  return [...vEvents, ...dEvents, ...aEvents];
};

/**
 * Obtém os eventos do calendário filtrados por um mês específico.
 * @param {number} year - O ano.
 * @param {number} month - O mês.
 * @returns {Promise<Array>} A lista de eventos filtrada.
 */
export const getCalendarEventsByMonth = async (year, month) => {
    const allEvents = await getCalendarEvents();
    return allEvents.filter(event => {
        const d = new Date(event.date + 'T12:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
    });
};
