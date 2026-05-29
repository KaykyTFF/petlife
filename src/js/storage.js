/**
 * Storage Manager for LifePet
 */
import { MOCK_PETS, MOCK_VACCINES, MOCK_DEWORMING, MOCK_APPOINTMENTS, MOCK_HISTORY } from '../data/mock-data.js';

const STORAGE_KEYS = {
  PETS: 'lifepet_pets',
  VACCINES: 'lifepet_vaccines',
  DEWORMING: 'lifepet_deworming',
  APPOINTMENTS: 'lifepet_appointments',
  HISTORY: 'lifepet_history'
};

/**
 * Initialize storage with mock data if empty
 */
export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PETS)) {
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(MOCK_PETS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VACCINES)) {
    localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(MOCK_VACCINES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEWORMING)) {
    localStorage.setItem(STORAGE_KEYS.DEWORMING, JSON.stringify(MOCK_DEWORMING));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(MOCK_APPOINTMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(MOCK_HISTORY));
  }
};

// Generic CRUD helpers
const get = (key) => JSON.parse(localStorage.getItem(key)) || [];
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

/**
 * Pets CRUD
 */
export const getPets = () => get(STORAGE_KEYS.PETS);
export const getPetById = (id) => getPets().find(p => p.id === id);
export const savePet = (pet) => {
  const pets = getPets();
  const index = pets.findIndex(p => p.id === pet.id);
  if (index >= 0) pets[index] = pet;
  else pets.push({ ...pet, id: Date.now().toString() });
  save(STORAGE_KEYS.PETS, pets);
};
export const deletePet = (id) => {
  const pets = getPets().filter(p => p.id !== id);
  save(STORAGE_KEYS.PETS, pets);
};

/**
 * Vaccines CRUD
 */
export const getVaccines = (petId) => get(STORAGE_KEYS.VACCINES).filter(v => v.petId === petId);
export const saveVaccine = (vaccine) => {
  const all = get(STORAGE_KEYS.VACCINES);
  const index = all.findIndex(v => v.id === vaccine.id);
  if (index >= 0) all[index] = vaccine;
  else all.push({ ...vaccine, id: 'v' + Date.now().toString() });
  save(STORAGE_KEYS.VACCINES, all);
};
export const deleteVaccine = (id) => {
  const all = get(STORAGE_KEYS.VACCINES).filter(v => v.id !== id);
  save(STORAGE_KEYS.VACCINES, all);
};

/**
 * Deworming CRUD
 */
export const getDeworming = (petId) => get(STORAGE_KEYS.DEWORMING).filter(d => d.petId === petId);
export const saveDeworming = (item) => {
  const all = get(STORAGE_KEYS.DEWORMING);
  const index = all.findIndex(i => i.id === item.id);
  if (index >= 0) all[index] = item;
  else all.push({ ...item, id: 'd' + Date.now().toString() });
  save(STORAGE_KEYS.DEWORMING, all);
};
export const deleteDeworming = (id) => {
  const all = get(STORAGE_KEYS.DEWORMING).filter(i => i.id !== id);
  save(STORAGE_KEYS.DEWORMING, all);
};

/**
 * Appointments CRUD
 */
export const getAppointments = (petId) => get(STORAGE_KEYS.APPOINTMENTS).filter(a => a.petId === petId);
export const saveAppointment = (item) => {
  const all = get(STORAGE_KEYS.APPOINTMENTS);
  const index = all.findIndex(i => i.id === item.id);
  if (index >= 0) all[index] = item;
  else all.push({ ...item, id: 'a' + Date.now().toString() });
  save(STORAGE_KEYS.APPOINTMENTS, all);
};
export const deleteAppointment = (id) => {
  const all = get(STORAGE_KEYS.APPOINTMENTS).filter(i => i.id !== id);
  save(STORAGE_KEYS.APPOINTMENTS, all);
};

/**
 * History CRUD
 */
export const getHistory = (petId) => get(STORAGE_KEYS.HISTORY).filter(h => h.petId === petId).sort((a,b) => new Date(b.date) - new Date(a.date));
export const addHistory = (petId, type, description, status = 'success') => {
  const all = get(STORAGE_KEYS.HISTORY);
  all.push({
    id: 'h' + Date.now().toString(),
    petId,
    type,
    date: new Date().toISOString().split('T')[0],
    description,
    status
  });
  save(STORAGE_KEYS.HISTORY, all);
};

// Initialize on load
initStorage();
