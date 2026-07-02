/**
 * Funções utilitárias para a página de Detalhes do Pet
 */

export const safeText = (value, fallback = "") => {
  return value === undefined || value === null || value === "" ? fallback : value;
};

export const formatDateBR = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString + 'T12:00:00'); // Força o fuso horário local
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ' ');
  } catch (e) {
    return null;
  }
};

export const formatTimeBR = (timeString) => {
  if (!timeString) return "";
  return timeString.substring(0, 5); // "12:00:00" -> "12:00"
};

export const formatDateTimeBR = (date, time) => {
  const d = formatDateBR(date);
  const t = formatTimeBR(time);
  if (d && t) return `${d} às ${t}`;
  if (d) return d;
  return "Data não definida";
};

export const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const normalizeStatus = (status) => {
  const map = {
    'scheduled': 'agendado',
    'completed': 'realizado',
    'cancelled': 'cancelado',
    'pending': 'pendente',
    'concluido': 'realizado',
    'atrasado': 'atrasado',
    'próximo': 'próximo',
    'em_dia': 'em dia',
    'sem_data': 'sem data'
  };
  return map[status] || status;
};

export const getPetIdFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
};

export const isEmptyArray = (arr) => !arr || arr.length === 0;
