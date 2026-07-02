import { ModalManager } from './modalManager.js';
import { createAppointment, updateAppointment, getAppointments } from '../services/healthService.js';
import { showToast } from '../pages/detalhes-pet/pet-actions.js';

/**
 * Modal para agendar uma nova consulta para o pet.
 * @param {number|string} petId - ID do pet.
 * @param {Function} onRefresh - Callback chamado após sucesso.
 */
export const showAddAppointmentModal = (petId, onRefresh) => {
  const content = `
    <form id="form-appointment" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="form-group"><label class="form-label">Motivo</label><input type="text" name="reason" class="input-field" required></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Clínica</label><input type="text" name="clinic" class="input-field"></div>
        <div class="form-group"><label class="form-label">Veterinário</label><input type="text" name="veterinarian" class="input-field"></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Data</label><input type="date" name="date" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Horário</label><input type="time" name="time" class="input-field" required></div>
      </div>
      <div class="form-group"><label class="form-label">Observações</label><textarea name="notes" class="input-field h-20"></textarea></div>
      <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100">
        <button type="submit" class="btn-primary w-full">Agendar Consulta</button>
      </div>
    </form>
  `;
  const { container, modal } = ModalManager.open('modal-appointment', 'Agendar Consulta', content);
  
  const form = container.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Agendando...';
    
    const formData = new FormData(form);
    const data = {
        pet: petId,
        motivo: formData.get('reason'),
        clinica: formData.get('clinic'),
        veterinario: formData.get('veterinarian'),
        data: formData.get('date'),
        hora: formData.get('time'),
        observacoes: formData.get('notes'),
        status: 'agendado'
    };
    
    try {
        await createAppointment(data);
        ModalManager.close('modal-appointment');
        showToast('Consulta agendada com sucesso!', 'success');
        if (onRefresh) onRefresh();
    } catch (err) {
        showToast('Erro ao agendar consulta.', 'danger');
        btn.disabled = false;
        btn.innerText = 'Agendar Consulta';
    }
  });
};

/**
 * Modal para editar os dados de uma consulta existente.
 * @param {number|string} id - ID da consulta.
 * @param {number|string} petId - ID do pet.
 * @param {Function} onRefresh - Callback chamado após sucesso.
 */
export const showEditAppointmentModal = async (id, petId, onRefresh) => {
    const res = await getAppointments(petId);
    const item = (res.data || res)?.find(a => a.id == id);
    if (!item) return;

  const content = `
    <form id="form-appointment" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="form-group"><label class="form-label">Motivo</label><input type="text" name="reason" value="${item.motivo}" class="input-field" required></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Clínica</label><input type="text" name="clinic" value="${item.clinica || ''}" class="input-field"></div>
        <div class="form-group"><label class="form-label">Veterinário</label><input type="text" name="veterinarian" value="${item.veterinario || ''}" class="input-field"></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Data</label><input type="date" name="date" value="${item.data}" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Horário</label><input type="time" name="time" value="${item.hora}" class="input-field" required></div>
      </div>
      <div class="form-group"><label class="form-label">Observações</label><textarea name="notes" class="input-field h-20">${item.observacoes || ''}</textarea></div>
      <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100">
        <button type="submit" class="btn-primary w-full">Salvar Alterações</button>
      </div>
    </form>
  `;
  const { container, modal } = ModalManager.open('modal-appointment', 'Editar Consulta', content);
  
  const form = container.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Salvando...';
    
    const formData = new FormData(form);
    const data = {
        motivo: formData.get('reason'),
        clinica: formData.get('clinic'),
        veterinario: formData.get('veterinarian'),
        data: formData.get('date'),
        hora: formData.get('time'),
        observacoes: formData.get('notes'),
    };
    
    try {
        await updateAppointment(id, data);
        ModalManager.close('modal-appointment');
        showToast('Consulta atualizada com sucesso!', 'success');
        if (onRefresh) onRefresh();
    } catch (err) {
        showToast('Erro ao atualizar consulta.', 'danger');
        btn.disabled = false;
        btn.innerText = 'Salvar Alterações';
    }
  });
};
