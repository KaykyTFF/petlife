/**
 * Página de Detalhes do Pet - Ponto de Entrada do Módulo
 * Este arquivo atua como uma ponte para os módulos refatorados.
 */
import { renderPetDetails as renderDetails } from './detalhes-pet/pet-details-render.js';
import { renderPetNotFound as renderNotFound } from './detalhes-pet/pet-empty-states.js';
import { showEditPetModal, showDeletePetModal } from '../modals/index.js';
import { initTabs } from './detalhes-pet/pet-tabs.js';
import { setupDelegatedEvents } from './detalhes-pet/index.js';
import { Logger } from '../utils/logger.js';

export const renderPetNotFound = renderNotFound;

/**
 * Função principal de renderização chamada pelo HTML
 */
export const renderPetDetails = (container, pet) => {
  Logger.info('Detalhes Pet', 'Renderizando página de detalhes do pet', { petId: pet.id });
  
  // 1. Renderiza o layout e a barra lateral
  renderDetails(
    container, 
    pet, 
    (p) => showEditPetModal(p, (updatedPet) => renderPetDetails(container, updatedPet)), 
    (petId) => showDeletePetModal(petId)
  );

  // 2. Inicializa o sistema de abas
  initTabs(pet.id);

  // 3. Configura a delegação global de eventos para conteúdo dinâmico
  setupDelegatedEvents(pet.id);
};
