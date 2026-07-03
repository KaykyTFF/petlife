import { createPet } from '../services/petService.js';
import { Toast } from '../../components/toast.js';
import { ModalManager } from '../modals/modalManager.js';
import { initCustomSelects } from '../utils/custom-select.js';

const showToast = (msg, type = 'success') => {
  const toastEl = document.createElement('div');
  toastEl.innerHTML = Toast(msg, type);
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3000);
};

const openCropModal = (file, onCropComplete) => {
    const content = `
      <div class="space-y-6">
        <p class="text-sm text-slate-500">Corte a imagem do seu pet para que fique centralizada.</p>
        
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

    const { container, modal } = ModalManager.open('modal-pet-photo-cropper', 'Editar Foto do Pet', content);
    const imageEl = container.querySelector('#cropper-image');
    const saveBtn = container.querySelector('#btn-save-crop');
    const cancelBtn = container.querySelector('#btn-cancel-crop');
    
    const url = URL.createObjectURL(file);
    imageEl.src = url;
    
    let cropperInstance = new Cropper(imageEl, {
        aspectRatio: 1, // 1:1 square
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
        if (cropperInstance) {
            cropperInstance.destroy();
        }
        URL.revokeObjectURL(url);
        modal.remove();
    };

    cancelBtn.addEventListener('click', cleanUp);

    saveBtn.addEventListener('click', () => {
        if (!cropperInstance) return;
        
        cropperInstance.getCroppedCanvas({
            width: 400,
            height: 400,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        }).toBlob((blob) => {
            if (blob) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    onCropComplete(blob, reader.result);
                };
                reader.readAsDataURL(blob);
            }
            cleanUp();
        }, 'image/jpeg', 0.9);
    });
};

/**
 * Inicializa a página de adição de pets.
 */
export const initAdicionarPet = () => {
    const form = document.querySelector('form');
    if (!form) return;

    // Inicializa seletores customizados
    initCustomSelects();

    let croppedPhotoBlob = null;

    // Lógica para alternar a unidade de idade com base no status de filhote
    const isFilhoteRadios = document.querySelectorAll('input[name="pet-is-filhote"]');
    const ageUnitSelect = document.getElementById('pet-age-unit');
    
    if (isFilhoteRadios.length > 0 && ageUnitSelect) {
        isFilhoteRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'sim') {
                    ageUnitSelect.disabled = false;
                    ageUnitSelect.innerHTML = `
                      <option value="meses" selected>Meses</option>
                      <option value="semanas">Semanas</option>
                    `;
                } else {
                    ageUnitSelect.disabled = true;
                    ageUnitSelect.innerHTML = `
                      <option value="anos" selected>Anos</option>
                    `;
                }
            });
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        
        const name = document.getElementById('pet-name').value.trim();
        const species = document.getElementById('pet-species').value;
        const breed = document.getElementById('pet-breed').value.trim();
        const age = document.getElementById('pet-age').value;
        const weight = document.getElementById('pet-weight').value;
        const sex = document.getElementById('pet-sex').value;
        const castratedElement = document.querySelector('input[name="pet-castrated"]:checked');
        const castrated = castratedElement ? castratedElement.value === 'sim' : false;
        
        const isFilhoteElement = document.querySelector('input[name="pet-is-filhote"]:checked');
        const isFilhote = isFilhoteElement ? isFilhoteElement.value === 'sim' : false;
        
        const ageUnit = document.getElementById('pet-age-unit') ? document.getElementById('pet-age-unit').value : 'anos';
        
        const allergies = document.getElementById('pet-allergies').value.trim();
        
        // Limpar erros anteriores
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.\\!border-red-500').forEach(el => el.classList.remove('!border-red-500'));

        let isValid = true;
        const requiredFields = [
            { id: 'pet-name', label: 'Nome' },
            { id: 'pet-species', label: 'Espécie' },
            { id: 'pet-sex', label: 'Sexo' },
            { id: 'pet-age', label: 'Idade' },
            { id: 'pet-weight', label: 'Peso' }
        ];

        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input.value.trim()) {
                isValid = false;
                
                let targetEl = input;
                let formGroup = input.closest('.form-group');
                
                // Tratar os selects customizados
                if (input.classList.contains('custom-select-initialized')) {
                    const wrapper = input.nextElementSibling;
                    if (wrapper && wrapper.classList.contains('custom-select-wrapper')) {
                        targetEl = wrapper.querySelector('.custom-select-trigger');
                    }
                }
                
                if (targetEl) {
                    targetEl.classList.add('!border-red-500');
                }
                
                if (formGroup) {
                    // Verifica se já não tem erro para não duplicar (caso tenha mais de um no mesmo grupo, ex: idade)
                    if (!formGroup.querySelector('.field-error')) {
                        const errorMsg = document.createElement('p');
                        errorMsg.className = 'field-error text-red-500 text-[11px] mt-1.5 font-bold animate-fade-in';
                        errorMsg.innerText = `* O campo ${field.label} é obrigatório.`;
                        formGroup.appendChild(errorMsg);
                    }
                }
            }
        });

        if (!isValid) {
            showToast('Por favor, corrija os erros marcados em vermelho.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('nome', name);
        formData.append('especie', species);
        formData.append('raca', breed);
        formData.append('idade', parseInt(age, 10));
        formData.append('unidade_idade', ageUnit);
        formData.append('is_filhote', isFilhote);
        formData.append('peso', parseFloat(weight));
        formData.append('sexo', sex);
        formData.append('castrado', castrated);
        formData.append('alergias', allergies);
        
        if (croppedPhotoBlob) {
            formData.append('foto', croppedPhotoBlob, 'pet.jpg');
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Salvando...';

            await createPet(formData);

            showToast('Pet salvo com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = '/pages/meus-pets/index.html';
            }, 1000);
            
        } catch (err) {
            console.error('Erro ao salvar pet:', err);
            let errorMessage = 'Erro ao salvar pet. Verifique os campos e tente novamente.';
            if (err && typeof err === 'object' && !Array.isArray(err) && !(err instanceof Error)) {
                 const firstKey = Object.keys(err)[0];
                 if (err[firstKey] && Array.isArray(err[firstKey])) {
                     errorMessage = err[firstKey][0];
                 }
            } else if (err instanceof Error) {
                 errorMessage = err.message;
            }
            showToast(errorMessage, 'danger');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    });

    // Lógica de pré-visualização e corte de foto
    const photoContainer = document.getElementById('photo-upload-container');
    const photoInput = document.getElementById('pet-photo');
    if (photoContainer && photoInput) {
        photoContainer.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                openCropModal(file, (croppedBlob, croppedDataUrl) => {
                    croppedPhotoBlob = croppedBlob;
                    photoContainer.innerHTML = `<img src="${croppedDataUrl}" class="w-full h-full object-cover rounded-full">`;
                });
            }
        });
    }
};
