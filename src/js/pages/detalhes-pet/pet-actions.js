/**
 * Manipuladores de ações para a página de Detalhes do Pet
 */
import { deletePet, updatePet } from '../../services/petService.js';
import { deleteVaccine, deleteDeworming, deleteAppointment, deletePeso, deleteMedicamento, updateVaccine, updateDeworming, updateAppointment, updateMedicamento } from '../../services/healthService.js';
import { Toast } from '../../../components/toast.js';

export const showToast = (msg, type = 'success') => {
  const toastEl = document.createElement('div');
  toastEl.innerHTML = Toast(msg, type);
  document.body.appendChild(toastEl);
  // remove o elemento do DOM depois de 3 segundos pra não vazar memória (memory leak)
  setTimeout(() => toastEl.remove(), 3000);
};

export const handleDeletePetAction = async (petId) => {
    try {
      await deletePet(petId);
      showToast('Pet excluído com sucesso', 'success');
      setTimeout(() => window.location.href = '/pages/meus-pets/index.html', 1500);
      return true;
    } catch (error) {
      showToast('Erro ao excluir pet.', 'danger');
      return false;
    }
};

export const handleUpdatePetAction = async (petId, updatedData) => {
    try {
        const data = await updatePet(petId, updatedData);
        showToast('Perfil atualizado com sucesso!', 'success');
        return data;
    } catch (error) {
        showToast(error?.detail || 'Erro ao atualizar pet.', 'danger');
        return null;
    }
};

export const handleDeleteItemAction = async (id, type) => {
    try {
        if (type === 'vaccine') await deleteVaccine(id);
        else if (type === 'deworming') await deleteDeworming(id);
        else if (type === 'appointment') await deleteAppointment(id);
        else if (type === 'peso') await deletePeso(id);
        else if (type === 'medication') await deleteMedicamento(id);
        
        showToast('Registro excluído', 'success');
        return true;
    } catch (error) {
        showToast('Erro ao excluir', 'danger');
        return false;
    }
};

export const handleMarkAppliedAction = async (id, type) => {
    try {
        if (type === 'vaccine') await updateVaccine(id, { concluido: true });
        else if (type === 'deworming') await updateDeworming(id, { concluido: true });
        else if (type === 'appointment') await updateAppointment(id, { status: 'concluido' });
        else if (type === 'medication') await updateMedicamento(id, { concluido: true });
        
        showToast('Status atualizado com sucesso!', 'success');
        return true;
    } catch (error) {
        showToast('Erro ao atualizar status.', 'danger');
        return false;
    }
};
