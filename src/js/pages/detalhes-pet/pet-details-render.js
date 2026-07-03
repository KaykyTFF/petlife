/**
 * Renderização do layout e da barra lateral principal de detalhes do pet
 */
import { StatusBadge } from '../../../components/status-badge.js';
import { ModalManager } from '../../modals/modalManager.js';
import { handleUpdatePetAction } from './pet-actions.js';

export const renderPetDetails = (container, pet, onEdit, onDelete) => {
  container.innerHTML = `
    <div class="flex flex-col lg:flex-row gap-8" id="pet-details-wrapper">
      
      <!-- Barra Lateral de Informações do Pet -->
      <div class="w-full lg:w-72 flex-shrink-0 space-y-6">
        <div class="card p-6">
          <div class="flex flex-col items-center relative">
            <div id="pet-photo-wrapper" class="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm mb-4 bg-slate-50 relative group cursor-pointer">
              <img id="pet-photo-img" src="${pet.foto || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop'}" class="w-full h-full object-cover transition-all group-hover:blur-[2px]">
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
            </div>
            <input type="file" id="pet-photo-input" class="hidden" accept="image/*">
            <h2 class="text-lg font-bold text-slate-900">${pet.nome}</h2>
            <p class="text-xs text-slate-500 mt-1 font-medium">${pet.raca || pet.especie} • ${pet.idade} ${pet.idade === 1 ? (pet.unidade_idade === 'meses' ? 'mês' : pet.unidade_idade === 'semanas' ? 'semana' : 'ano') : (pet.unidade_idade || 'anos')}</p>
            
            <div class="mt-3">
              ${StatusBadge(pet.status_text || 'Em dia', pet.status_type || 'success')}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 mt-6">
            <button class="btn-secondary !py-2 !text-xs w-full" id="btn-edit-pet">Editar</button>
            <button class="btn-secondary !text-red-600 hover:!bg-red-50 !border-red-100 hover:!border-red-200 !py-2 !text-xs w-full" id="btn-delete-pet">Excluir</button>
          </div>
        </div>

        <div class="card p-5">
          <div class="mb-4">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Informações Gerais</h3>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-medium">Peso</span>
              <span class="text-slate-900 font-bold">${pet.peso} kg</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-medium">Sexo</span>
              <span class="text-slate-900 font-bold">${pet.sexo === 'M' ? 'Macho' : 'Fêmea'}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-medium">Castrado</span>
              <span class="text-slate-900 font-bold">${pet.castrado ? 'Sim' : 'Não'}</span>
            </div>
            <div class="flex flex-col text-xs mt-4">
              <span class="text-slate-500 font-medium mb-1">Alergias</span>
              <span class="text-slate-900 font-medium">${pet.alergias || 'Nenhuma'}</span>
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t border-slate-100">
            <button class="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors" onclick="window.location.href='/pages/meus-pets/index.html'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para Meus Pets
            </button>
          </div>
        </div>
      </div>

      <!-- Área de Conteúdo do Pet -->
      <div class="flex-1 space-y-6">
        <div class="border-b border-slate-200">
          <nav class="flex gap-8 overflow-x-auto no-scrollbar">
            <button class="tab-btn active" data-tab="resumo">Resumo</button>
            <button class="tab-btn" data-tab="vacinas">Vacinas</button>
            <button class="tab-btn" data-tab="vermifugo">Vermífugo</button>
            <button class="tab-btn" data-tab="consultas">Consultas</button>
            <button class="tab-btn" data-tab="medicamentos">Medicamentos</button>
            <button class="tab-btn" data-tab="peso">Peso</button>
            <button class="tab-btn" data-tab="historico">Histórico</button>
          </nav>
        </div>

        <div id="tab-content" class="min-h-[400px]">
          <!-- Conteúdo Injetado por renderizações assíncronas -->
        </div>
      </div>

    </div>
  `;

  // Vincular ações
  document.getElementById('btn-edit-pet')?.addEventListener('click', () => onEdit(pet));
  document.getElementById('btn-delete-pet')?.addEventListener('click', () => onDelete(pet.id));

  // Ações de Foto do Pet
  const photoWrapper = document.getElementById('pet-photo-wrapper');
  const photoInput = document.getElementById('pet-photo-input');
  
  if (photoWrapper && photoInput) {
      photoWrapper.addEventListener('click', () => photoInput.click());
      
      photoInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const content = `
              <div class="space-y-6">
                <p class="text-sm text-slate-500">Corte a imagem do seu pet para que fique centralizada no perfil.</p>
                <div class="flex flex-col items-center gap-4">
                    <div id="cropper-container" class="w-full max-w-sm">
                        <div class="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
                            <img id="cropper-image" src="" class="max-w-full block" alt="Imagem para cortar">
                        </div>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                  <button type="button" class="btn-secondary px-6" id="btn-cancel-crop">Cancelar</button>
                  <button type="button" id="btn-save-crop" class="btn-primary px-6">Confirmar</button>
                </div>
              </div>
          `;
          
          const { container, modal } = ModalManager.open('modal-pet-photo-cropper', 'Atualizar Foto do Pet', content);
          const imageEl = container.querySelector('#cropper-image');
          const saveBtn = container.querySelector('#btn-save-crop');
          const cancelBtn = container.querySelector('#btn-cancel-crop');
          
          const url = URL.createObjectURL(file);
          imageEl.src = url;
          
          let cropperInstance = new Cropper(imageEl, {
              aspectRatio: 1,
              viewMode: 1,
              dragMode: 'move',
              autoCropArea: 0.9,
              restore: false,
              guides: true,
              center: true,
              highlight: false,
              cropBoxMovable: true,
              cropBoxResizable: true,
              toggleDragModeOnDblclick: false,
          });

          const cleanUp = () => {
              if (cropperInstance) cropperInstance.destroy();
              URL.revokeObjectURL(url);
              modal.remove();
              photoInput.value = '';
          };

          cancelBtn.addEventListener('click', cleanUp);

          saveBtn.addEventListener('click', () => {
              if (!cropperInstance) return;
              saveBtn.innerText = 'Salvando...';
              saveBtn.disabled = true;
              
              cropperInstance.getCroppedCanvas({
                  width: 400,
                  height: 400,
                  imageSmoothingEnabled: true,
                  imageSmoothingQuality: 'high',
              }).toBlob(async (blob) => {
                  if (blob) {
                      const formData = new FormData();
                      formData.append('foto', blob, 'pet.jpg');
                      
                      const updated = await handleUpdatePetAction(pet.id, formData);
                      if (updated) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                              document.getElementById('pet-photo-img').src = reader.result;
                          };
                          reader.readAsDataURL(blob);
                      }
                  }
                  cleanUp();
              }, 'image/jpeg', 0.9);
          });
      });
  }
};
