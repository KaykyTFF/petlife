/**
 * Skeleton Loader Components
 */

export const SkeletonTitle = () => `<div class="skeleton-title"></div>`;

export const SkeletonButton = () => `<div class="skeleton-button"></div>`;

export const SkeletonPetCard = () => `
  <div class="skeleton-card">
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 skeleton-circle flex-shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="skeleton h-5 w-1/2"></div>
        <div class="skeleton h-3 w-1/3"></div>
      </div>
    </div>
    <div class="space-y-3 pt-4">
      <div class="skeleton-line"></div>
      <div class="skeleton-line w-4/5"></div>
    </div>
    <div class="pt-4">
      <div class="skeleton h-8 w-24 rounded-lg"></div>
    </div>
  </div>
`;

export const SkeletonActivityItem = () => `
  <div class="flex items-start gap-3 p-3">
    <div class="w-9 h-9 skeleton-circle flex-shrink-0"></div>
    <div class="flex-1 space-y-2">
      <div class="skeleton h-4 w-1/2"></div>
      <div class="skeleton h-3 w-1/4"></div>
    </div>
    <div class="w-12 h-2 skeleton mt-1"></div>
  </div>
`;

export const SkeletonHeader = (hasButtons = true) => `
  <div class="page-header !mb-8">
    <div class="space-y-2">
      <div class="skeleton h-7 w-32"></div>
      <div class="skeleton h-4 w-64"></div>
    </div>
    ${hasButtons ? `
    <div class="flex gap-3">
      <div class="skeleton-button h-10 w-32"></div>
    </div>` : ''}
  </div>
`;

export const SkeletonForm = () => `
  <div class="skeleton-card space-y-6">
    ${[1, 2, 3, 4].map(() => `
      <div class="space-y-2">
        <div class="skeleton h-4 w-24"></div>
        <div class="skeleton h-12 w-full !rounded-xl"></div>
      </div>
    `).join('')}
    <div class="pt-4 flex gap-4">
      <div class="skeleton-button w-full h-11"></div>
      <div class="skeleton-button w-full h-11"></div>
    </div>
  </div>
`;

export const SkeletonDashboard = () => `
  <div id="skeleton-container" class="space-y-8">
    ${SkeletonHeader()}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <!-- Próximos Cuidados Skeleton -->
        <section>
          <div class="flex justify-between mb-4">
            <div class="skeleton h-6 w-40"></div>
            <div class="skeleton h-4 w-24"></div>
          </div>
          <div class="skeleton-card !p-0 overflow-hidden">
            <div class="divide-y divide-slate-50">
              ${[1, 2, 3].map(() => `
                <div class="flex items-center gap-4 p-4">
                  <div class="w-12 h-12 skeleton rounded-xl"></div>
                  <div class="flex-1 space-y-2">
                    <div class="skeleton h-4 w-1/3"></div>
                    <div class="skeleton h-3 w-1/4"></div>
                  </div>
                  <div class="w-20 h-8 skeleton rounded-lg"></div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- Atenção Necessária Skeleton -->
        <section>
          <div class="flex justify-between mb-4">
            <div class="skeleton h-6 w-48"></div>
            <div class="skeleton h-4 w-16"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            ${SkeletonPetCard()}
            ${SkeletonPetCard()}
          </div>
        </section>
        
        <!-- Atividades Recentes Skeleton -->
        <section>
          <div class="skeleton h-6 w-40 mb-4"></div>
          <div class="skeleton-card !p-1.5 shadow-sm">
            ${SkeletonActivityItem()}
            ${SkeletonActivityItem()}
          </div>
        </section>
      </div>
      
      <!-- Lateral Skeleton -->
      <div class="space-y-8">
        <div class="skeleton-card !p-8 !h-48 border-none">
          <div class="skeleton h-5 w-32 mb-6"></div>
          <div class="space-y-4">
            <div class="flex justify-between"><div class="skeleton h-4 w-24"></div><div class="skeleton h-5 w-5 rounded-full"></div></div>
            <div class="flex justify-between"><div class="skeleton h-4 w-32"></div><div class="skeleton h-5 w-5 rounded-full"></div></div>
            <div class="flex justify-between"><div class="skeleton h-4 w-20"></div><div class="skeleton h-5 w-5 rounded-full"></div></div>
          </div>
        </div>
        <div class="skeleton-card !p-8 !h-64 border-none">
           <div class="skeleton h-5 w-32 mb-6"></div>
           <div class="space-y-5">
             <div class="flex gap-3"><div class="w-1.5 h-1.5 rounded-full skeleton mt-1.5"></div><div class="flex-1 space-y-2"><div class="skeleton h-3 w-20"></div><div class="skeleton h-2 w-24"></div></div></div>
             <div class="flex gap-3"><div class="w-1.5 h-1.5 rounded-full skeleton mt-1.5"></div><div class="flex-1 space-y-2"><div class="skeleton h-3 w-24"></div><div class="skeleton h-2 w-20"></div></div></div>
             <div class="skeleton h-8 w-full mt-4 rounded-xl"></div>
           </div>
        </div>
      </div>
    </div>
  </div>
`;

export const SkeletonPets = () => `
  <div class="space-y-8">
    ${SkeletonHeader()}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${SkeletonPetCard()}
      ${SkeletonPetCard()}
      ${SkeletonPetCard()}
    </div>
  </div>
`;

export const SkeletonPetDetails = () => `
  <div class="space-y-8">
    ${SkeletonHeader(false)}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-1">
        <div class="skeleton-card flex flex-col items-center text-center space-y-4">
          <div class="w-32 h-32 skeleton-circle"></div>
          <div class="skeleton h-6 w-32"></div>
          <div class="skeleton h-4 w-24"></div>
          <div class="skeleton-button w-full"></div>
        </div>
      </div>
      <div class="lg:col-span-2 space-y-6">
        <div class="skeleton-card !h-40"></div>
        <div class="skeleton-card !h-60"></div>
      </div>
    </div>
  </div>
`;

export const SkeletonCalendar = () => `
  <div class="space-y-8">
    ${SkeletonHeader()}
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3">
        <div class="skeleton-card !h-[600px]"></div>
      </div>
      <div class="lg:col-span-1 space-y-6">
        <div class="skeleton-card !h-40"></div>
        <div class="skeleton-card !h-80"></div>
      </div>
    </div>
  </div>
`;

export const SkeletonNotifications = () => `
  <div class="space-y-8">
    ${SkeletonHeader()}
    <div class="max-w-3xl mx-auto space-y-4">
      ${[1, 2, 3, 4, 5].map(() => `
        <div class="skeleton-card !p-4 flex gap-4">
          <div class="w-12 h-12 skeleton-circle"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-3/4"></div>
            <div class="skeleton h-3 w-1/4"></div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
`;

export const SkeletonProfile = () => `
  <div class="space-y-8">
    ${SkeletonHeader(false)}
    <div class="max-w-4xl mx-auto">
      <div class="skeleton-card space-y-8">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="w-32 h-32 skeleton-circle"></div>
          <div class="flex-1 space-y-4 text-center md:text-left">
            <div class="skeleton h-6 w-48 mx-auto md:mx-0"></div>
            <div class="skeleton h-4 w-32 mx-auto md:mx-0"></div>
            <div class="skeleton-button mx-auto md:mx-0"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${[1, 2, 3, 4].map(() => `<div class="skeleton h-12 w-full"></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
`;

export const SkeletonSettings = () => `
  <div class="space-y-8">
    ${SkeletonHeader(false)}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${[1, 2, 3, 4, 5, 6].map(() => `
        <div class="skeleton-card flex items-center gap-4">
          <div class="w-10 h-10 skeleton-circle"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-3/4"></div>
            <div class="skeleton h-3 w-1/2"></div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
`;

/**
 * Utility to simulate loading and transition from skeleton to real content
 * @param {string} containerId - The ID of the container to render in
 * @param {Function} skeletonTemplate - Function that returns skeleton HTML
 * @param {Function} contentTemplate - Function that returns real content HTML
 * @param {number} delay - Mock delay in ms
 */
export const withLoading = (containerId, skeletonTemplate, contentTemplate, delay = 800) => {
  const container = document.getElementById(containerId) || document.querySelector('.page-container');
  if (!container) return;

  // 1. renderiza o skeleton antes do conteúdo real chegar da API
  container.innerHTML = skeletonTemplate();

  // 2. aguarda o delay simulado/real e injeta o componente final
  setTimeout(() => {
    container.classList.add('fade-in');
    container.innerHTML = contentTemplate();

    // 3. remove a classe de animação depois que finalizou pra não quebrar futuros updates no DOM
    setTimeout(() => container.classList.remove('fade-in'), 500);
  }, delay);
};
