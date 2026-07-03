/**
 * Orquestração do módulo principal para Detalhes do Pet
 */
import { showAddVaccineModal, showEditVaccineModal, showDeleteItemModal, showAddDewormingModal, showEditDewormingModal, showAddAppointmentModal, showEditAppointmentModal, showAddPesoModal, showAddMetaPesoModal, showAddMedicamentoModal, showEditMedicamentoModal } from '../../modals/index.js';
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
        } else if (target.closest('#btn-add-medicamento') || target.closest('#btn-add-medicamento-empty')) {
            showAddMedicamentoModal(petId, () => renderTabContent('medicamentos', petId));
        } else if (target.closest('#btn-add-peso') || target.closest('#btn-add-peso-empty')) {
            showAddPesoModal(petId, () => renderTabContent('peso', petId));
        } else if (target.closest('#btn-meta-peso')) {
            showAddMetaPesoModal(petId, () => renderTabContent('peso', petId));
        }
        
        // Ações do Item
        const btnEdit = target.closest('.btn-edit-item');
        if (btnEdit) {
            const { id, type } = btnEdit.dataset;
            if (type === 'vaccine') showEditVaccineModal(id, petId, () => renderTabContent('vacinas', petId));
            else if (type === 'deworming') showEditDewormingModal(id, petId, () => renderTabContent('vermifugo', petId));
            else if (type === 'appointment') showEditAppointmentModal(id, petId, () => renderTabContent('consultas', petId));
            else if (type === 'medication') showEditMedicamentoModal(id, petId, () => renderTabContent('medicamentos', petId));
        }

        const btnDelete = target.closest('.btn-delete-item');
        if (btnDelete) {
            const { id, type } = btnDelete.dataset;
            showDeleteItemModal(id, type, petId, () => {
                const tabMap = { 'vaccine': 'vacinas', 'deworming': 'vermifugo', 'peso': 'peso', 'appointment': 'consultas', 'medication': 'medicamentos' };
                renderTabContent(tabMap[type], petId);
            });
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
