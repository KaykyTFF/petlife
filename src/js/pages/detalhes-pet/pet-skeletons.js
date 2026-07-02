/**
 * Geradores de HTML Skeleton para a página de Detalhes do Pet
 */

export const getResumoSkeleton = () => `
  <div class="space-y-6 animate-pulse">
    <div class="card p-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="space-y-2"><div class="h-3 bg-slate-100 rounded w-24"></div><div class="h-4 bg-slate-100 rounded w-32"></div></div>
        <div class="space-y-2 md:border-l md:border-slate-50 md:pl-6"><div class="h-3 bg-slate-100 rounded w-24"></div><div class="h-4 bg-slate-100 rounded w-32"></div></div>
        <div class="space-y-2 md:border-l md:border-slate-50 md:pl-6"><div class="h-3 bg-slate-100 rounded w-24"></div><div class="h-4 bg-slate-100 rounded w-32"></div></div>
      </div>
    </div>
    <div class="card p-5 space-y-4">
      <div class="flex justify-between items-center mb-2">
        <div class="h-5 bg-slate-100 rounded w-1/4"></div>
        <div class="h-3 bg-slate-100 rounded w-16"></div>
      </div>
      ${[1, 2, 3].map(() => `
        <div class="flex items-center gap-4 p-3 border border-slate-50 rounded-xl">
          <div class="w-8 h-8 bg-slate-100 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-100 rounded w-1/2"></div>
            <div class="h-3 bg-slate-100 rounded w-1/4"></div>
          </div>
          <div class="w-16 h-5 bg-slate-100 rounded-full"></div>
        </div>
      `).join('')}
    </div>
  </div>
`;

export const getTabSkeleton = () => `
  <div class="card p-5 space-y-6 animate-pulse">
    <div class="flex justify-between items-center mb-2">
      <div class="space-y-2">
        <div class="h-5 bg-slate-100 rounded w-48"></div>
        <div class="h-3 bg-slate-100 rounded w-64"></div>
      </div>
      <div class="h-8 bg-slate-100 rounded w-32"></div>
    </div>
    <div class="space-y-3">
      ${[1, 2, 3].map(() => `
        <div class="flex items-center gap-4 p-4 border border-slate-50 rounded-xl">
          <div class="w-10 h-10 bg-slate-100 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-100 rounded w-1/3"></div>
            <div class="h-3 bg-slate-100 rounded w-1/4"></div>
          </div>
          <div class="w-20 h-6 bg-slate-100 rounded-full"></div>
        </div>
      `).join('')}
    </div>
  </div>
`;
