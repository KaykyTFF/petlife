/**
 * Orquestração do módulo principal para Detalhes do Pet
 */
import { showAddVaccineModal, showEditVaccineModal, showDeleteItemModal, showAddDewormingModal, showEditDewormingModal, showAddAppointmentModal, showEditAppointmentModal } from '../../modals/index.js';
import { handleMarkAppliedAction } from './pet-actions.js';
import { renderTabContent } from './pet-tabs.js';

let eventsInitialized = false;

export const setupDelegatedEvents = (petId) => {
    if (eventsInitialized) return;
    
    const tabContentContainer = document.getElementById('tab-content');
    if (!tabContentContainer) return;

    // usa event delegation no container principal pra não pesar a performance do dom adicionando vários listeners soltos
    tabContentContainer.addEventListener('click', async (e) => {
        const target = e.target;
        
        // Botões de Adição
        if (target.closest('#btn-add-vaccine') || target.closest('#btn-add-vaccine-empty')) {
            showAddVaccineModal(petId, () => renderTabContent('vacinas', petId));
        } else if (target.closest('#btn-add-deworming') || target.closest('#btn-add-deworming-empty')) {
            showAddDewormingModal(petId, () => renderTabContent('vermifugo', petId));
        } else if (target.closest('#btn-add-appointment') || target.closest('#btn-add-appointment-empty')) {
            showAddAppointmentModal(petId, () => renderTabContent('consultas', petId));
        }
        
        // Ações do Item
        const btnEdit = target.closest('.btn-edit-item');
        if (btnEdit) {
            const { id, type } = btnEdit.dataset;
            if (type === 'vaccine') showEditVaccineModal(id, petId, () => renderTabContent('vacinas', petId));
            else if (type === 'deworming') showEditDewormingModal(id, petId, () => renderTabContent('vermifugo', petId));
            else if (type === 'appointment') showEditAppointmentModal(id, petId, () => renderTabContent('consultas', petId));
        }

        const btnDelete = target.closest('.btn-delete-item');
        if (btnDelete) {
            const { id, type } = btnDelete.dataset;
            showDeleteItemModal(id, type, petId, () => renderTabContent(type === 'vaccine' ? 'vacinas' : type === 'deworming' ? 'vermifugo' : 'consultas', petId));
        }

        const btnMark = target.closest('.btn-mark-item');
        if (btnMark) {
            const { id, type } = btnMark.dataset;
            const success = await handleMarkAppliedAction(id, type);
            if (success) {
                const tabMap = { 'vaccine': 'vacinas', 'deworming': 'vermifugo', 'appointment': 'consultas' };
                renderTabContent(tabMap[type], petId);
            }
        }
    });

    eventsInitialized = true;
};
