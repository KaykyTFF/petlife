import os
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Utilitário para visualizar os logs do sistema.'

    def add_arguments(self, parser):
        parser.add_argument('--errors', action='store_true', help='Mostrar logs de erros')
        parser.add_argument('--auth', action='store_true', help='Mostrar logs de autenticação')
        parser.add_argument('--api', action='store_true', help='Mostrar logs de API')
        parser.add_argument('--security', action='store_true', help='Mostrar logs de segurança')
        parser.add_argument('--critical', action='store_true', help='Mostrar logs críticos')
        parser.add_argument('--app', action='store_true', help='Mostrar logs da aplicação')
        parser.add_argument('--database', action='store_true', help='Mostrar logs de banco de dados')
        parser.add_argument('--lines', type=int, default=100, help='Número de linhas para mostrar (padrão: 100)')

    def handle(self, *args, **options):
        log_files = {
            'errors': 'errors.log',
            'auth': 'auth.log',
            'api': 'api.log',
            'security': 'security.log',
            'critical': 'critical.log',
            'app': 'app.log',
            'database': 'database.log',
        }

        # Find which flags were passed
        selected_logs = [key for key in log_files.keys() if options[key]]
        
        if not selected_logs:
            self.stdout.write(self.style.WARNING('Nenhum log selecionado. Use --help para ver as opções.'))
            return

        logs_dir = os.path.join(settings.BASE_DIR, 'logs')
        lines_to_read = options['lines']

        for log_type in selected_logs:
            filename = log_files[log_type]
            filepath = os.path.join(logs_dir, filename)
            
            self.stdout.write(self.style.SUCCESS(f'\n--- Lendo {lines_to_read} linhas de {filename} ---'))
            
            if not os.path.exists(filepath):
                self.stdout.write(self.style.ERROR(f'Arquivo {filename} não encontrado em {logs_dir}'))
                continue
                
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    last_lines = lines[-lines_to_read:]
                    if not last_lines:
                        self.stdout.write("Arquivo vazio.")
                    for line in last_lines:
                        self.stdout.write(line.rstrip('\n'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro ao ler {filename}: {str(e)}'))
