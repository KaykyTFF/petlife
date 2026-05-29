import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login/index.html'),
        cadastro: resolve(__dirname, 'pages/cadastro/index.html'),
        confirmarCodigo: resolve(__dirname, 'pages/confirmar-codigo/index.html'),
        recuperarSenha: resolve(__dirname, 'pages/recuperar-senha/index.html'),
        dashboard: resolve(__dirname, 'pages/dashboard/index.html'),
        meusPets: resolve(__dirname, 'pages/meus-pets/index.html'),
        adicionarPet: resolve(__dirname, 'pages/adicionar-pet/index.html'),
        detalhesPet: resolve(__dirname, 'pages/detalhes-pet/index.html'),
        calendario: resolve(__dirname, 'pages/calendario/index.html'),
        notificacoes: resolve(__dirname, 'pages/notificacoes/index.html'),
        perfil: resolve(__dirname, 'pages/perfil/index.html'),
        configuracoes: resolve(__dirname, 'pages/configuracoes/index.html'),
      },
    },
  },
});
