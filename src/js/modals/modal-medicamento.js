import { ModalManager } from './modalManager.js';
import { createMedicamento, updateMedicamento, getMedicamentos } from '../services/healthService.js';
import { showToast } from '../pages/detalhes-pet/pet-actions.js';
import { formatInputDate } from '../pages/detalhes-pet/pet-utils.js';

/**
 * Função para exibir o modal de adição de um novo medicamento para um pet
 * @param {number} petId - ID do pet
 * @param {Function} onSuccess - Callback executado após o sucesso na criação
 */
export const showAddMedicamentoModal = (petId, onSuccess) => {
    // Pega a data de hoje para preencher o input de data de início por padrão
    const today = new Date().toISOString().split('T')[0];
    
    // HTML do formulário de medicamento
    const content = `
    <form id="form-medicamento" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="form-group">
        <label class="form-label">Nome do Medicamento *</label>
        <input type="text" id="med-nome" required class="input-field" placeholder="Ex: Simparic, Bravecto, Dipirona...">
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Dosagem</label>
          <div class="flex items-center gap-2">
            <input type="number" id="med-dosagem-valor" step="0.1" class="input-field w-20 text-center" placeholder="Qtd">
            <select id="med-dosagem-tipo" class="input-field flex-1 text-slate-700 bg-white">
              <option value="comprimido(s)">Comp.</option>
              <option value="gotas">Gotas</option>
              <option value="ml">ml</option>
              <option value="mg">mg</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Frequência</label>
          <div class="flex items-center gap-2">
            <input type="number" id="med-frequencia-valor" step="1" class="input-field w-20 text-center" placeholder="Ex: 8">
            <select id="med-frequencia-tipo" class="input-field flex-1 text-slate-700 bg-white">
              <option value="hora(s)">hora(s)</option>
              <option value="dia(s)">dia(s)</option>
            </select>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Data Início *</label>
          <input type="date" id="med-data-inicio" required value="${today}" class="input-field">
        </div>
        <div class="form-group">
          <label class="form-label flex items-center justify-between">
            Data Fim
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" id="med-continuo" class="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] w-3.5 h-3.5">
              <span class="text-[10px] uppercase font-bold text-slate-500">Uso Contínuo</span>
            </label>
          </label>
          <input type="date" id="med-data-fim" class="input-field">
        </div>
      </div>
      
      <div class="form-group">
        <label class="flex items-start gap-3 cursor-pointer p-3 bg-blue-50/50 rounded-lg border border-blue-100">
          <input type="checkbox" id="med-lembrete" checked class="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]">
          <div>
              <span class="text-sm font-bold text-blue-900 block mb-0.5">Ativar Lembrete Diário</span>
              <p class="text-[11px] text-blue-700 leading-relaxed">Você receberá uma notificação no sistema todos os dias enquanto o medicamento estiver em uso.</p>
          </div>
        </label>
      </div>

      <div class="form-group">
        <label class="form-label">Observações (Opcional)</label>
        <textarea id="med-obs" class="input-field h-20" placeholder="Ex: Dar junto com a comida..."></textarea>
      </div>
      
      <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100">
        <button type="submit" class="btn-primary w-full" id="btn-save-med">Salvar Medicamento</button>
      </div>
    </form>
  `;

  // Abre o modal através do ModalManager global
  const { container } = ModalManager.open('modal-medicamento', 'Novo Medicamento', content);

  // Captura os elementos do DOM gerados
  const form = container.querySelector('#form-medicamento');
  const btnSave = container.querySelector('#btn-save-med');
  const inputContinuo = container.querySelector('#med-continuo');
  const inputDataFim = container.querySelector('#med-data-fim');

  // Toggle uso continuo
  inputContinuo.addEventListener('change', (e) => {
      if (e.target.checked) {
          inputDataFim.value = '';
          inputDataFim.disabled = true;
          inputDataFim.classList.add('bg-slate-50', 'opacity-50');
      } else {
          inputDataFim.disabled = false;
          inputDataFim.classList.remove('bg-slate-50', 'opacity-50');
      }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    btnSave.disabled = true;
    btnSave.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Salvando...</span>';

    try {
      const payload = {
        pet: petId,
        nome: container.querySelector('#med-nome').value,
        dosagem: (() => {
           const val = container.querySelector('#med-dosagem-valor').value;
           if (!val) return '';
           const tipo = container.querySelector('input[name="med-dosagem-tipo"]:checked')?.value || '';
           return `${val} ${tipo}`.trim();
        })(),
        frequencia: (() => {
           const val = container.querySelector('#med-frequencia-valor').value;
           if (!val) return '';
           const tipo = container.querySelector('#med-frequencia-tipo').value;
           return `${val} ${tipo}`;
        })(),
        data_inicio: container.querySelector('#med-data-inicio').value,
        data_fim: inputContinuo.checked ? null : (container.querySelector('#med-data-fim').value || null),
        lembrete_ativo: container.querySelector('#med-lembrete').checked,
        observacoes: container.querySelector('#med-obs').value
      };

      await createMedicamento(payload);
      showToast('Medicamento registrado com sucesso!', 'success');
      
      if (onSuccess) onSuccess();
      ModalManager.close('modal-medicamento');
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar medicamento. Verifique os dados.', 'danger');
      btnSave.disabled = false;
      btnSave.textContent = 'Salvar Medicamento';
    }
  });
};

/**
 * Função para exibir o modal de edição de um medicamento existente
 * @param {number} medicamentoId - ID do medicamento a ser editado
 * @param {number} petId - ID do pet (não usado na edição em si, mas mantido para assinatura)
 * @param {Function} onSuccess - Callback executado após o sucesso na edição
 */
export const showEditMedicamentoModal = async (medicamentoId, petId, onSuccess) => {
  // Estado de loading inicial
  const loadingContent = `<div class="p-6 text-center text-slate-500 flex flex-col items-center">
        <svg class="animate-spin h-6 w-6 text-[var(--color-primary)] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Carregando dados...
    </div>`;

  // Abre o modal em estado de loading
  const { container } = ModalManager.open('modal-medicamento', 'Editar Medicamento', loadingContent);

  try {
      // Busca todos os medicamentos para encontrar o que será editado
      const allMeds = await getMedicamentos(null); 
      let med = null;
      
      // Procura o medicamento pelo ID
      for (const m of allMeds) {
          if (m.id === parseInt(medicamentoId)) {
              med = m;
              break;
          }
      }

      if (!med) throw new Error("Medicamento não encontrado");

      // HTML do formulário pré-preenchido
      const content = `
      <form id="form-medicamento" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
        <div class="form-group">
          <label class="form-label">Nome do Medicamento *</label>
          <input type="text" id="med-nome" required value="${med.nome || ''}" class="input-field" placeholder="Ex: Simparic, Bravecto, Dipirona...">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Dosagem</label>
            <div class="flex items-center gap-2">
              <input type="number" id="med-dosagem-valor" step="0.1" value="${med.dosagem ? med.dosagem.replace(/[^0-9.]/g, '') : ''}" class="input-field w-20 text-center" placeholder="Qtd">
              <select id="med-dosagem-tipo" class="input-field flex-1 text-slate-700 bg-white">
                <option value="comprimido(s)" ${(!med.dosagem || med.dosagem.includes('comprimido')) ? 'selected' : ''}>Comp.</option>
                <option value="gotas" ${(med.dosagem && med.dosagem.includes('gota')) ? 'selected' : ''}>Gotas</option>
                <option value="ml" ${(med.dosagem && med.dosagem.includes('ml')) ? 'selected' : ''}>ml</option>
                <option value="mg" ${(med.dosagem && med.dosagem.includes('mg')) ? 'selected' : ''}>mg</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Frequência</label>
            <div class="flex items-center gap-2">
              <input type="number" id="med-frequencia-valor" step="1" value="${med.frequencia ? med.frequencia.replace(/[^0-9]/g, '') : ''}" class="input-field w-20 text-center" placeholder="Ex: 8">
              <select id="med-frequencia-tipo" class="input-field flex-1 text-slate-700 bg-white">
                <option value="hora(s)" ${(!med.frequencia || med.frequencia.includes('hora')) ? 'selected' : ''}>hora(s)</option>
                <option value="dia(s)" ${(med.frequencia && med.frequencia.includes('dia')) ? 'selected' : ''}>dia(s)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Data Início *</label>
            <input type="date" id="med-data-inicio" required value="${formatInputDate(med.data_inicio) || ''}" class="input-field">
          </div>
          <div class="form-group">
            <label class="form-label flex items-center justify-between">
              Data Fim
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" id="med-continuo" class="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] w-3.5 h-3.5" ${!med.data_fim ? 'checked' : ''}>
                <span class="text-[10px] uppercase font-bold text-slate-500">Uso Contínuo</span>
              </label>
            </label>
            <input type="date" id="med-data-fim" value="${formatInputDate(med.data_fim) || ''}" class="input-field" ${!med.data_fim ? 'disabled class="bg-slate-50 opacity-50"' : ''}>
          </div>
        </div>
        
        <div class="form-group">
          <label class="flex items-start gap-3 cursor-pointer p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <input type="checkbox" id="med-lembrete" class="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" ${med.lembrete_ativo ? 'checked' : ''}>
            <div>
                <span class="text-sm font-bold text-blue-900 block mb-0.5">Ativar Lembrete Diário</span>
                <p class="text-[11px] text-blue-700 leading-relaxed">Você receberá uma notificação no sistema todos os dias enquanto o medicamento estiver em uso.</p>
            </div>
          </label>
        </div>

        <div class="form-group">
          <label class="form-label">Observações (Opcional)</label>
          <textarea id="med-obs" class="input-field h-20" placeholder="Ex: Dar junto com a comida...">${med.observacoes || ''}</textarea>
        </div>
        
        <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100">
          <button type="submit" class="btn-primary w-full" id="btn-save-med">Salvar Alterações</button>
        </div>
      </form>
      `;

      // Atualiza o container com o formulário carregado
      container.innerHTML = content;

      // Captura elementos
      const form = container.querySelector('#form-medicamento');
      const btnSave = container.querySelector('#btn-save-med');
      const inputContinuo = container.querySelector('#med-continuo');
      const inputDataFim = container.querySelector('#med-data-fim');

      // Lógica de "Uso Contínuo" (desabilita/habilita a data fim)
      inputContinuo.addEventListener('change', (e) => {
          if (e.target.checked) {
              inputDataFim.value = '';
              inputDataFim.disabled = true;
              inputDataFim.classList.add('bg-slate-50', 'opacity-50');
          } else {
              inputDataFim.disabled = false;
              inputDataFim.classList.remove('bg-slate-50', 'opacity-50');
          }
      });

      // Lida com a submissão de edição
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Estado visual de loading
        btnSave.disabled = true;
        btnSave.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Salvando...</span>';

        try {
          // Monta payload de atualização
          const payload = {
            nome: container.querySelector('#med-nome').value,
            dosagem: (() => {
               const val = container.querySelector('#med-dosagem-valor').value;
               if (!val) return '';
               const tipo = container.querySelector('#med-dosagem-tipo').value || '';
               return `${val} ${tipo}`.trim();
            })(),
            frequencia: (() => {
             const val = container.querySelector('#med-frequencia-valor').value;
             if (!val) return '';
             const tipo = container.querySelector('#med-frequencia-tipo').value;
             return `${val} ${tipo}`;
          })(),
            data_inicio: container.querySelector('#med-data-inicio').value,
            data_fim: inputContinuo.checked ? null : (container.querySelector('#med-data-fim').value || null),
            lembrete_ativo: container.querySelector('#med-lembrete').checked,
            observacoes: container.querySelector('#med-obs').value
          };

          // Dispara request de edição (PATCH/PUT)
          await updateMedicamento(medicamentoId, payload);
          showToast('Medicamento atualizado com sucesso!', 'success');
          
          if (onSuccess) onSuccess();
          ModalManager.close('modal-medicamento');
        } catch (error) {
          console.error(error);
          showToast('Erro ao atualizar medicamento.', 'danger');
          btnSave.disabled = false;
          btnSave.textContent = 'Salvar Alterações';
        }
      });

  } catch (err) {
      container.innerHTML = `<div class="p-6 text-center text-red-500">Erro ao carregar dados do medicamento.</div>`;
  }
};
