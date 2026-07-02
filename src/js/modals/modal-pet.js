import { ModalManager } from './modalManager.js';
import { handleUpdatePetAction, handleDeletePetAction } from '../pages/detalhes-pet/pet-actions.js';

/**
 * Abre o modal para editar os dados gerais de um pet.
 * @param {Object} pet - Objeto contendo os dados do pet a ser editado.
 * @param {Function} onUpdate - Callback chamado quando a atualização for bem sucedida.
 */
export const showEditPetModal = (pet, onUpdate) => {
    const isFilhoteSim = pet.is_filhote ? 'checked' : '';
    const isFilhoteNao = !pet.is_filhote ? 'checked' : '';
    const isCastradoSim = pet.castrado ? 'checked' : '';
    const isCastradoNao = !pet.castrado ? 'checked' : '';
    
    const content = `
    <form id="edit-pet-form" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Nome do Pet</label><input type="text" name="name" value="${pet.nome || ''}" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Espécie</label><input type="text" name="species" value="${pet.especie || ''}" class="input-field" required></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Raça</label><input type="text" name="breed" value="${pet.raca || ''}" class="input-field"></div>
        <div class="form-group">
          <label class="form-label">Sexo</label>
          <select name="sex" class="input-field" required>
            <option value="M" ${pet.sexo === 'M' ? 'selected' : ''}>Macho</option>
            <option value="F" ${pet.sexo === 'F' ? 'selected' : ''}>Fêmea</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Idade</label>
          <div class="flex items-center gap-2">
            <input type="number" min="0" name="age" value="${pet.idade || ''}" class="input-field w-1/2" required>
            <select name="ageUnit" id="edit-pet-age-unit" class="input-field w-1/2">
              <option value="anos" ${pet.unidade_idade === 'anos' ? 'selected' : ''}>Anos</option>
              <option value="meses" ${pet.unidade_idade === 'meses' ? 'selected' : ''}>Meses</option>
              <option value="semanas" ${pet.unidade_idade === 'semanas' ? 'selected' : ''}>Semanas</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Peso (kg)</label><input type="number" step="0.1" min="0" name="weight" value="${pet.peso || ''}" class="input-field" required></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Filhote</label>
          <div class="flex items-center gap-4 mt-2">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="isFilhote" value="sim" class="sr-only" ${isFilhoteSim}>
              <div class="w-5 h-5 rounded border border-slate-300 bg-white flex items-center justify-center transition-all group-has-[:checked]:bg-[#006F93] group-has-[:checked]:text-white group-has-[:checked]:border-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 opacity-0 group-has-[:checked]:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-sm font-medium text-slate-700">Sim</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="isFilhote" value="nao" class="sr-only" ${isFilhoteNao}>
              <div class="w-5 h-5 rounded border border-slate-300 bg-white flex items-center justify-center transition-all group-has-[:checked]:bg-[#006F93] group-has-[:checked]:text-white group-has-[:checked]:border-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 opacity-0 group-has-[:checked]:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-sm font-medium text-slate-700">Não</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Castrado</label>
          <div class="flex items-center gap-4 mt-2">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="castrated" value="sim" class="sr-only" ${isCastradoSim}>
              <div class="w-5 h-5 rounded border border-slate-300 bg-white flex items-center justify-center transition-all group-has-[:checked]:bg-[#006F93] group-has-[:checked]:text-white group-has-[:checked]:border-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 opacity-0 group-has-[:checked]:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-sm font-medium text-slate-700">Sim</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="castrated" value="nao" class="sr-only" ${isCastradoNao}>
              <div class="w-5 h-5 rounded border border-slate-300 bg-white flex items-center justify-center transition-all group-has-[:checked]:bg-[#006F93] group-has-[:checked]:text-white group-has-[:checked]:border-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 opacity-0 group-has-[:checked]:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-sm font-medium text-slate-700">Não</span>
            </label>
          </div>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Alergias</label><textarea name="allergies" class="input-field h-20">${pet.alergias || ''}</textarea></div>
      <div class="form-group"><label class="form-label">Medicamentos Contínuos</label><textarea name="continuous_medications" class="input-field h-20">${pet.medicamentos_continuos || ''}</textarea></div>
      
      <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100">
        <button type="submit" class="btn-primary w-full">Salvar Alterações</button>
      </div>
    </form>
  `;
  
  const { container } = ModalManager.open('modal-edit-pet', 'Editar Perfil', content);
  
  const form = container.querySelector('form');
  const ageUnitSelect = document.getElementById('edit-pet-age-unit');
  const isFilhoteRadios = form.querySelectorAll('input[name="isFilhote"]');

  // Ajusta dinamicamente as opções da unidade de idade baseando-se se o pet é filhote ou adulto
  isFilhoteRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
          if (e.target.value === 'sim') {
              ageUnitSelect.innerHTML = `<option value="meses">Meses</option><option value="semanas">Semanas</option>`;
          } else {
              ageUnitSelect.innerHTML = `<option value="anos">Anos</option>`;
          }
      });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Salvando...';

    const isFilhoteElement = form.querySelector('input[name="isFilhote"]:checked');
    const castratedElement = form.querySelector('input[name="castrated"]:checked');
    
    const updatedData = { 
        nome: form.name.value, 
        especie: form.species.value, 
        raca: form.breed.value, 
        idade: parseInt(form.age.value), 
        unidade_idade: form.ageUnit.value,
        peso: parseFloat(form.weight.value),
        sexo: form.sex.value,
        is_filhote: isFilhoteElement ? isFilhoteElement.value === 'sim' : false,
        castrado: castratedElement ? castratedElement.value === 'sim' : false,
        alergias: form.allergies.value,
        medicamentos_continuos: form.continuous_medications.value
    };
    
    const data = await handleUpdatePetAction(pet.id, updatedData);
    if (data) {
        ModalManager.close('modal-edit-pet');
        if (onUpdate) onUpdate(data);
    } else {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Salvar Alterações';
    }
  });
};

/**
 * Abre o modal de confirmação para deletar um pet.
 * @param {number|string} petId - ID do pet a ser deletado.
 */
export const showDeletePetModal = (petId) => {
  const content = `
    <div class="text-center space-y-4 py-4">
      <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <p class="text-sm text-slate-500">Tem certeza que deseja excluir este pet? Essa ação não poderá ser desfeita.</p>
      <div class="flex gap-3 pt-6">
        <button type="button" class="btn-secondary w-full" id="btn-cancel-delete">Cancelar</button>
        <button type="button" class="btn-primary w-full !bg-red-600 hover:!bg-red-700 !border-red-600" id="btn-confirm-delete">Excluir</button>
      </div>
    </div>
  `;
  
  ModalManager.open('modal-delete-pet', 'Excluir pet', content);
  
  document.getElementById('btn-cancel-delete').addEventListener('click', () => {
    ModalManager.close('modal-delete-pet');
  });
  
  document.getElementById('btn-confirm-delete').addEventListener('click', async () => {
    const btn = document.getElementById('btn-confirm-delete');
    btn.disabled = true;
    btn.innerText = 'Excluindo...';
    await handleDeletePetAction(petId);
  });
};
