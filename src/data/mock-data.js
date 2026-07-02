/**
 * Mock Data for LifePet
 */

export const MOCK_PETS = [
  { 
    id: '1', 
    name: 'Rex', 
    species: 'Cachorro', 
    breed: 'Golden Retriever', 
    age: '3 anos', 
    weight: '28.5 kg',
    sex: 'Macho',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
    statusText: 'Em dia', 
    statusType: 'success' 
  },
  { 
    id: '2', 
    name: 'Luna', 
    species: 'Gato', 
    breed: 'Siamês', 
    age: '2 anos', 
    weight: '4.2 kg',
    sex: 'Fêmea',
    image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=400&fit=crop',
    statusText: 'Próxima', 
    statusType: 'warning' 
  },
  { 
    id: '3', 
    name: 'Pipoca', 
    species: 'Cachorro', 
    breed: 'Poodle', 
    age: '5 anos', 
    weight: '6.8 kg',
    sex: 'Fêmea',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=400&fit=crop',
    statusText: 'Atrasado', 
    statusType: 'danger' 
  }
];

export const MOCK_VACCINES = [
  { id: 'v1', petId: '1', name: 'Antirrábica', dateApplied: '2026-01-10', nextDose: '2027-01-10', status: 'applied', note: 'Aplicada sem reações.' },
  { id: 'v2', petId: '1', name: 'V10', dateApplied: '2025-06-12', nextDose: '2026-06-12', status: 'pending', note: 'Reforço anual necessário.' },
  { id: 'v3', petId: '2', name: 'V10', dateApplied: '2025-05-15', nextDose: '2026-05-15', status: 'pending', note: 'Reforço V10 Luna.' },
  { id: 'v4', petId: '1', name: 'Antirrábica', dateApplied: '2025-07-10', nextDose: '2026-07-10', status: 'pending', note: 'Vacina Antirrábica Rex.' }
];

export const MOCK_DEWORMING = [
  { id: 'd1', petId: '1', name: 'Drontal Plus', dateApplied: '2026-03-15', nextDose: '2026-06-15', frequency: '3 meses', status: 'applied', note: '' },
  { id: 'd2', petId: '1', name: 'Vermífugo Rex', dateApplied: '2026-02-22', nextDose: '2026-05-22', frequency: '3 meses', status: 'pending', note: 'Vermífugo Rex.' }
];

export const MOCK_APPOINTMENTS = [
  { id: 'a1', petId: '1', reason: 'Check-up Semestral', vet: 'Dr. Lucas', date: '2026-06-20', time: '14:30', status: 'scheduled', note: 'Levar exames anteriores.' },
  { id: 'a2', petId: '2', reason: 'Check-up Semestral', vet: 'Dra. Maria', date: '2026-06-02', time: '09:30', status: 'scheduled', note: 'Check-up Semestral Luna.' },
  { id: 'a3', petId: '3', reason: 'Retorno Veterinário', vet: 'Dr. Lucas', date: '2026-08-18', time: '10:00', status: 'scheduled', note: 'Retorno veterinário Pipoca.' },
  { id: 'a4', petId: '1', reason: 'Consulta Final de Ano', vet: 'Dra. Maria', date: '2026-12-15', time: '16:00', status: 'scheduled', note: 'Check-up de Natal.' }
];

export const MOCK_HISTORY = [
  { id: 'h1', petId: '1', type: 'vaccine', date: '2026-01-10', description: 'Vacina Antirrábica aplicada.', status: 'success' },
  { id: 'h2', petId: '1', type: 'deworming', date: '2026-03-15', description: 'Vermífugo Drontal Plus administrado.', status: 'success' }
];
