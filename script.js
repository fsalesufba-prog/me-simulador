// script-me.js - Sistema Fiscal para Microempresas 2026
// Desenvolvido com base na legislação tributária brasileira vigente
// Autor: Especialista em Contabilidade para Microempresas

class MicroEmpresaAssistant {

        
        
    constructor() {
    // Verificar se está autenticado
        if (!this.checkAuthentication()) {
            window.location.href = 'login.html';
            return;
        }
        // Estado inicial com todas as variáveis necessárias
        this.state = {
            // Identificação da empresa
            identificacao: {
                razaoSocial: '',
                nomeFantasia: '',
                cnpj: '',
                dataAbertura: '',
                telefone: '',
                email: '',
                socios: []
            },
            
            // Endereço
            endereco: {
                cep: '',
                logradouro: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                uf: ''
            },
            
            // Informações da empresa
            empresa: {
                cnae: '',
                descricaoAtividade: '',
                regimeTributario: 'simples',
                anexoSimples: 'I',
                porteEmpresa: 'micro',
                capitalSocial: 0
            },
            
            // Faturamento
            faturamento: {
                receitas: [],
                totalAnual: 0,
                mediaMensal: 0,
                projecaoAnual: 0,
                periodoReferencia: 'anual'
            },
            
            // Despesas
            despesas: {
                lista: [],
                totalAnual: 0,
                porCategoria: {},
                percentualSobreFaturamento: 0,
                lucroOperacional: 0
            },
            
            // Simples Nacional
            simplesNacional: {
                dasPeriodo: 0,
                aliquotaEfetiva: 0,
                valorDevido: 0,
                componentes: {
                    icms: 0,
                    iss: 0,
                    pisCofins: 0,
                    cpp: 0,
                    irpj: 0,
                    csll: 0
                },
                faixaAtual: 1,
                parcelaDeduzir: 0
            },
            
            // IRPJ/CSLL
            irpjCsll: {
                regime: 'simples',
                lucroPresumido: {
                    faturamento: 0,
                    percentualPresuncao: 8,
                    lucroPresumido: 0,
                    irpj: 0,
                    adicionalIrpj: 0,
                    csll: 0,
                    total: 0
                },
                lucroReal: {
                    lucroContabil: 0,
                    ajustesFiscais: 0,
                    baseIrpj: 0,
                    irpj: 0,
                    adicionalIrpj: 0,
                    baseCsll: 0,
                    csll: 0,
                    total: 0
                }
            },
            
            // IRPF Sócios
            irpfSocios: {
                socios: [],
                prolaboreMensal: 0,
                mesesTrabalhados: 13,
                dependentes: 0,
                outrasDeducoes: 0,
                prolaboreAnual: 0,
                inssRetido: 0,
                baseCalculoIrpf: 0,
                irpfDevido: 0,
                totalRecolher: 0,
                distribuicoes: {
                    lucroDisponivel: 0,
                    percentualDistribuicao: 100,
                    totalDistribuir: 0
                }
            },
            
            // Simulação Completa
            simulacao: {
                faturamentoBruto: 0,
                despesasTotais: 0,
                lucroOperacional: 0,
                dasAnual: 0,
                prolaboreAnual: 0,
                inssProlabore: 0,
                irpfProlabore: 0,
                cargaTributariaTotal: 0,
                aliquotasEfetivas: {
                    simples: 0,
                    inss: 0,
                    irpf: 0,
                    total: 0
                },
                situacaoFiscal: 'Regular',
                obrigacoes: []
            },
            
            // Validação
            validacao: {
                conformidadeGeral: false,
                limiteME: true,
                documentos: false,
                obrigacoes: false,
                resultados: [],
                alertas: []
            },
            
            // Estado da aplicação
            currentSection: 'home',
            progress: 0,
            whatIfScenario: {
                active: false,
                faturamentoAdicional: 0,
                despesasAdicionais: 0,
                prolaboreAdicional: 0,
                anexoAlternativo: 'I'
            }
        };

            
        
        // CONSTANTES FISCAIS 2026 - MICROEMPRESAS
        this.CONSTANTS = {
            // Limites ME
            LIMITE_FATURAMENTO_ME: 360000.00, // R$ 360.000,00/ano
            LIMITE_EPP: 4800000.00, // R$ 4.800.000,00/ano
            
            // Tabelas Simples Nacional 2026
            ANEXOS: {
                'I': { // Comércio
                    nome: 'Anexo I - Comércio',
                    faixas: [
                        { limite: 180000, aliquota: 0.04, deducao: 0 },
                        { limite: 360000, aliquota: 0.073, deducao: 5940 },
                        { limite: 720000, aliquota: 0.095, deducao: 13860 },
                        { limite: 1800000, aliquota: 0.107, deducao: 22500 },
                        { limite: 3600000, aliquota: 0.143, deducao: 87300 },
                        { limite: 4800000, aliquota: 0.19, deducao: 378000 }
                    ]
                },
                'II': { // Indústria
                    nome: 'Anexo II - Indústria',
                    faixas: [
                        { limite: 180000, aliquota: 0.045, deducao: 0 },
                        { limite: 360000, aliquota: 0.078, deducao: 5940 },
                        { limite: 720000, aliquota: 0.10, deducao: 13860 },
                        { limite: 1800000, aliquota: 0.112, deducao: 22500 },
                        { limite: 3600000, aliquota: 0.147, deducao: 85500 },
                        { limite: 4800000, aliquota: 0.30, deducao: 720000 }
                    ]
                },
                'III': { // Serviços
                    nome: 'Anexo III - Serviços',
                    faixas: [
                        { limite: 180000, aliquota: 0.06, deducao: 0 },
                        { limite: 360000, aliquota: 0.112, deducao: 9360 },
                        { limite: 720000, aliquota: 0.135, deducao: 17640 },
                        { limite: 1800000, aliquota: 0.16, deducao: 35640 },
                        { limite: 3600000, aliquota: 0.21, deducao: 125640 },
                        { limite: 4800000, aliquota: 0.33, deducao: 648000 }
                    ]
                },
                'IV': { // Serviços
                    nome: 'Anexo IV - Serviços',
                    faixas: [
                        { limite: 180000, aliquota: 0.045, deducao: 0 },
                        { limite: 360000, aliquota: 0.09, deducao: 8100 },
                        { limite: 720000, aliquota: 0.102, deducao: 12420 },
                        { limite: 1800000, aliquota: 0.14, deducao: 39780 },
                        { limite: 3600000, aliquota: 0.22, deducao: 183780 },
                        { limite: 4800000, aliquota: 0.33, deducao: 828000 }
                    ]
                },
                'V': { // Serviços
                    nome: 'Anexo V - Serviços',
                    faixas: [
                        { limite: 180000, aliquota: 0.155, deducao: 0 },
                        { limite: 360000, aliquota: 0.18, deducao: 4500 },
                        { limite: 720000, aliquota: 0.195, deducao: 9900 },
                        { limite: 1800000, aliquota: 0.205, deducao: 17100 },
                        { limite: 3600000, aliquota: 0.23, deducao: 62100 },
                        { limite: 4800000, aliquota: 0.305, deducao: 540000 }
                    ]
                }
            },
            
            // IRPF 2026
            LIMITE_ISENCAO_IRPF: 28559.70,
            DEDUCAO_POR_DEPENDENTE: 2275.08,
            DEDUCAO_PADRAO: 2275.08,
            LIMITE_DEDUCAO_EDUCACAO: 3561.50,
            
            // Faixas IRPF 2026
            TAX_BRACKETS: [
                { max: 22847.76, rate: 0.00, deductible: 0 },
                { max: 33919.80, rate: 0.075, deductible: 1713.58 },
                { max: 45012.60, rate: 0.15, deductible: 4257.57 },
                { max: 55976.16, rate: 0.225, deductible: 7633.51 },
                { max: Infinity, rate: 0.275, deductible: 10432.32 }
            ],
            
            // INSS Pró-labore 2026
            INSS_BRACKETS: [
                { max: 1412.00, rate: 0.075, fixed: 0 },
                { max: 2666.68, rate: 0.09, fixed: 105.90 },
                { max: 4000.03, rate: 0.12, fixed: 105.90 },
                { max: 7786.02, rate: 0.14, fixed: 105.90 },
                { max: Infinity, rate: 0.14, fixed: 105.90, teto: 1059.00 }
            ],
            
            // IRPJ/CSLL
            IRPJ_ALIQUOTA: 0.15,
            IRPJ_ADICIONAL_ALIQUOTA: 0.10,
            IRPJ_ADICIONAL_LIMITE: 20000,
            CSLL_ALIQUOTA: 0.09,
            PRESUNCAO_LUCRO: {
                'comercio': 0.08,
                'industria': 0.08,
                'servicos': 0.32,
                'transporte': 0.16
            }
        };
        
        this.init();
    }

        checkAuthentication() {
        const IS_LOGGED_IN_KEY = 'microfiscal_logged_in';
        const isLoggedIn = localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';
        
        // Verificar se o login foi feito há menos de 24 horas
        const lastLogin = localStorage.getItem('microfiscal_last_login');
        if (lastLogin) {
            const loginTime = new Date(lastLogin);
            const now = new Date();
            const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursSinceLogin > 24) {
                // Logout automático após 24 horas
                localStorage.removeItem(IS_LOGGED_IN_KEY);
                return false;
            }
        }
        
        return isLoggedIn;
    }
    
    init() {
        this.loadState();
        this.setupEventListeners();
        this.updateProgress();
        this.setupMobileLabels();
        this.calculateAll();
    }
    
    setupEventListeners() {
        // Navegação
        document.addEventListener('click', (e) => {
            const navBtn = e.target.closest('.cyber-nav-btn');
            if (navBtn) {
                const section = navBtn.dataset.section;
                this.navigateTo(section);
                return;
            }
            
            const formActionBtn = e.target.closest('[data-section]');
            if (formActionBtn && formActionBtn.dataset.section) {
                this.navigateTo(formActionBtn.dataset.section);
                return;
            }
            
            // Botões de adicionar
            if (e.target.id === 'add-socio') {
                this.addSocio();
                return;
            }
            
            if (e.target.id === 'add-receita') {
                this.addReceita();
                return;
            }
            
            if (e.target.id === 'add-despesa') {
                this.addDespesa();
                return;
            }
            
            if (e.target.id === 'add-socio-irpf') {
                this.addSocioIRPF();
                return;
            }
            
            // Botões de deletar
            if (e.target.classList.contains('remove-socio')) {
                const socioIndex = e.target.dataset.index;
                this.removeSocio(socioIndex);
                return;
            }
            
            if (e.target.classList.contains('delete-receita')) {
                const receitaId = e.target.dataset.id;
                this.deleteReceita(receitaId);
                return;
            }
            
            if (e.target.classList.contains('delete-despesa')) {
                const despesaId = e.target.dataset.id;
                this.deleteDespesa(despesaId);
                return;
            }
            
            // Controles de simulação
            if (e.target.id === 'run-full-simulation') {
                this.calculateAll();
                return;
            }
            
            if (e.target.id === 'calcular-das') {
                this.calcularDAS();
                return;
            }
            
            if (e.target.id === 'what-if-btn') {
                this.toggleWhatIfScenario();
                return;
            }
            
            if (e.target.id === 'apply-what-if') {
                this.applyWhatIfScenario();
                return;
            }
            
            if (e.target.id === 'reset-what-if') {
                this.resetWhatIfScenario();
                return;
            }
            
            if (e.target.id === 'close-what-if') {
                this.toggleWhatIfScenario();
                return;
            }
            
            // Exportação
            if (e.target.id === 'export-pdf') {
                this.exportPDF();
                return;
            }
            
            if (e.target.id === 'export-excel') {
                this.exportExcel();
                return;
            }
            
            if (e.target.id === 'export-backup' || e.target.id === 'backup-btn') {
                this.backupData();
                return;
            }
            
            if (e.target.id === 'clear-data') {
                if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                    this.clearData();
                }
                return;
            }
            
            // Tabs
            if (e.target.classList.contains('tab-btn')) {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
                return;
            }
        });
        
        // Auto-salvar
        document.addEventListener('input', (e) => {
            if (e.target.matches('.cyber-input, select, textarea')) {
                this.saveFormData();
                
                // Cálculos em tempo real
                if (e.target.id === 'cnpj') {
                    this.formatCNPJ(e.target);
                    this.validateCNPJ(e.target.value);
                }
                
                if (e.target.id === 'cep') {
                    this.formatCEP(e.target);
                }
                
                if (e.target.id === 'faturamento-periodo') {
                    this.calcularDAS();
                }
                
                if (e.target.id === 'prolabore-mensal') {
                    this.calcularIRPFSocios();
                }
                
                if (e.target.id === 'faturamento-presumido') {
                    this.calcularLucroPresumido();
                }
                
                // What-if scenario
                if (e.target.id.includes('what-if')) {
                    this.applyWhatIfScenario();
                }
            }
        });
        
        // Buscar CEP
        document.getElementById('buscar-cep').addEventListener('click', () => {
            this.buscarCEP();
        });
        
        // Mudança de regime tributário
        document.getElementById('regime-tributario').addEventListener('change', (e) => {
            this.handleRegimeChange(e.target.value);
        });

        document.getElementById('print-report').addEventListener('click', () => {
    this.printReport();
});

}


            
    
    
    navigateTo(section) {
        // Atualizar navegação
        document.querySelectorAll('.cyber-nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === section) {
                btn.classList.add('active');
                
                // Atualizar indicador
                const navIndicator = document.querySelector('.cyber-nav-indicator');
                if (navIndicator) {
                    const btnRect = btn.getBoundingClientRect();
                    const navRect = document.querySelector('.cyber-nav-container').getBoundingClientRect();
                    
                    navIndicator.style.left = `${btnRect.left - navRect.left}px`;
                    navIndicator.style.width = `${btnRect.width}px`;
                    navIndicator.style.opacity = '1';
                }
            }
        });
        
        // Atualizar seções
        document.querySelectorAll('.cyber-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.state.currentSection = section;
            this.saveState();
            
            // Scroll para topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Ações específicas por seção
            if (section === 'simulation') {
                this.runFullSimulation();
            } else if (section === 'validation') {
                this.runValidations();
            } else if (section === 'reports') {
                this.generateReport();
            }
        }
        
        // Atualizar progresso
        this.updateProgress();
    }
    
    formatCNPJ(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 14) value = value.substring(0, 14);
        
        if (value.length <= 14) {
            value = value.replace(/(\d{2})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1/$2');
            value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        }
        
        input.value = value;
    }
    
    validateCNPJ(cnpj) {
        const validation = document.getElementById('cnpj-validation');
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        
        if (cleanCNPJ.length === 0) {
            validation.textContent = '';
            validation.className = 'validation-message';
            return false;
        }
        
        if (cleanCNPJ.length !== 14) {
            validation.textContent = 'CNPJ deve ter 14 dígitos';
            validation.className = 'validation-message error';
            return false;
        }
        
        // Validação dos dígitos verificadores
        let tamanho = cleanCNPJ.length - 2;
        let numeros = cleanCNPJ.substring(0, tamanho);
        let digitos = cleanCNPJ.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        
        // Primeiro dígito verificador
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(0))) {
            validation.textContent = 'CNPJ inválido';
            validation.className = 'validation-message error';
            return false;
        }
        
        // Segundo dígito verificador
        tamanho = tamanho + 1;
        numeros = cleanCNPJ.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(1))) {
            validation.textContent = 'CNPJ inválido';
            validation.className = 'validation-message error';
            return false;
        }
        
        validation.textContent = '✓ CNPJ válido';
        validation.className = 'validation-message success';
        return true;
    }
    
    formatCEP(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 8) value = value.substring(0, 8);
        
        if (value.length > 5) {
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        
        input.value = value;
    }
    
    async buscarCEP() {
        const cepInput = document.getElementById('cep');
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            alert('CEP deve ter 8 dígitos');
            return;
        }
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (data.erro) {
                alert('CEP não encontrado');
                return;
            }
            
            document.getElementById('logradouro').value = data.logradouro;
            document.getElementById('bairro').value = data.bairro;
            document.getElementById('cidade').value = data.localidade;
            document.getElementById('uf').value = data.uf;
            
            this.saveFormData();
        } catch (error) {
            alert('Erro ao buscar CEP. Verifique sua conexão.');
        }
    }
    
    addSocio() {
        const container = document.getElementById('socios-container');
        const template = document.getElementById('socio-form-template');
        
        const socioDiv = template.cloneNode(true);
        socioDiv.id = '';
        socioDiv.style.display = 'block';
        socioDiv.dataset.index = this.state.identificacao.socios.length;
        
        const removeBtn = socioDiv.querySelector('.remove-socio');
        removeBtn.dataset.index = this.state.identificacao.socios.length;
        
        // Limpar inputs
        socioDiv.querySelector('.socio-nome').value = '';
        socioDiv.querySelector('.socio-cpf').value = '';
        socioDiv.querySelector('.socio-participacao').value = '';
        socioDiv.querySelector('.socio-admin').value = 'sim';
        
        // Remover estado vazio se existir
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        container.appendChild(socioDiv);
        
        // Adicionar ao estado
        this.state.identificacao.socios.push({
            nome: '',
            cpf: '',
            participacao: 0,
            administrador: true
        });
        
        this.saveState();
        this.updateProgress();
    }
    
    removeSocio(index) {
        // Remover do DOM
        const socioDiv = document.querySelector(`.socio-form[data-index="${index}"]`);
        if (socioDiv) {
            socioDiv.remove();
        }
        
        // Remover do estado
        this.state.identificacao.socios.splice(index, 1);
        
        // Reindexar
        document.querySelectorAll('.socio-form').forEach((div, idx) => {
            div.dataset.index = idx;
            div.querySelector('.remove-socio').dataset.index = idx;
        });
        
        // Mostrar estado vazio se necessário
        const container = document.getElementById('socios-container');
        if (this.state.identificacao.socios.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-friends"></i>
                    <p>Nenhum sócio cadastrado</p>
                </div>
            `;
        }
        
        this.saveState();
        this.updateProgress();
        this.calcularIRPFSocios();
    }
    
    addReceita() {
        const descricao = document.getElementById('receita-descricao').value.trim();
        const valor = parseFloat(document.getElementById('receita-valor').value) || 0;
        const tipo = document.getElementById('receita-tipo').value;
        const mes = document.getElementById('receita-mes').value;
        const nota = document.getElementById('receita-nota').value.trim();
        const cliente = document.getElementById('receita-cliente').value.trim();
        
        if (!descricao || valor <= 0 || !mes) {
            alert('Preencha os campos obrigatórios: descrição, valor e mês');
            return;
        }
        
        const receita = {
            id: Date.now(),
            descricao,
            valor,
            tipo,
            mes: parseInt(mes),
            nota,
            cliente,
            data: new Date().toISOString()
        };
        
        this.state.faturamento.receitas.push(receita);
        this.calcularFaturamento();
        this.saveState();
        this.updateReceitasList();
        this.clearReceitaForm();
        this.calculateAll();
    }
    
    calcularFaturamento() {
        const receitas = this.state.faturamento.receitas;
        let total = 0;
        
        receitas.forEach(receita => {
            total += receita.valor;
        });
        
        this.state.faturamento.totalAnual = total;
        this.state.faturamento.mediaMensal = total / 12;
        this.state.faturamento.projecaoAnual = total;
        
        // Atualizar UI
        document.getElementById('total-faturamento').textContent = 
            this.formatCurrency(total);
        document.getElementById('media-mensal').textContent = 
            this.formatCurrency(total / 12);
        document.getElementById('projecao-anual').textContent = 
            this.formatCurrency(total);
        
        // Atualizar barra de progresso
        const limite = this.CONSTANTS.LIMITE_FATURAMENTO_ME;
        const percentual = Math.min((total / limite) * 100, 100);
        document.getElementById('progress-faturamento').style.width = `${percentual}%`;
        
        // Calcular alíquota efetiva do Simples
        this.calcularDAS();
    }
    
    updateReceitasList() {
        const container = document.getElementById('receitas-table-body');
        if (!container) return;
        
        if (this.state.faturamento.receitas.length === 0) {
            container.innerHTML = `
                <div class="empty-row">
                    <i class="fas fa-file-invoice"></i>
                    <p>Nenhuma receita registrada</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        const tipoLabels = {
            'venda': 'Venda',
            'servico': 'Serviço',
            'projeto': 'Projeto',
            'aluguel': 'Aluguel',
            'rendimento': 'Rendimento',
            'outro': 'Outro'
        };
        
        const mesLabels = {
            1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
            7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
        };
        
        this.state.faturamento.receitas.forEach(receita => {
            html += `
                <div class="table-row">
                    <div class="table-cell">${receita.descricao}</div>
                    <div class="table-cell">${this.formatCurrency(receita.valor)}</div>
                    <div class="table-cell">${tipoLabels[receita.tipo] || receita.tipo}</div>
                    <div class="table-cell">${mesLabels[receita.mes] || receita.mes}</div>
                    <div class="table-cell">${receita.cliente || '-'}</div>
                    <div class="table-cell">
                        <button class="icon-btn delete-receita" data-id="${receita.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    clearReceitaForm() {
        document.getElementById('receita-descricao').value = '';
        document.getElementById('receita-valor').value = '';
        document.getElementById('receita-nota').value = '';
        document.getElementById('receita-cliente').value = '';
    }
    
    deleteReceita(id) {
        const receitaId = parseInt(id);
        this.state.faturamento.receitas = this.state.faturamento.receitas.filter(r => r.id !== receitaId);
        this.calcularFaturamento();
        this.updateReceitasList();
        this.saveState();
        this.calculateAll();
    }
    
    addDespesa() {
        const descricao = document.getElementById('despesa-descricao').value.trim();
        const valor = parseFloat(document.getElementById('despesa-valor').value) || 0;
        const categoria = document.getElementById('despesa-categoria').value;
        const mes = document.getElementById('despesa-mes').value;
        const nota = document.getElementById('despesa-nota').value.trim();
        const dedutivel = document.getElementById('despesa-dedutivel').value === 'sim';
        
        if (!descricao || valor <= 0 || !mes) {
            alert('Preencha os campos obrigatórios: descrição, valor e mês');
            return;
        }
        
        const despesa = {
            id: Date.now(),
            descricao,
            valor,
            categoria,
            mes: parseInt(mes),
            nota,
            dedutivel,
            data: new Date().toISOString()
        };
        
        this.state.despesas.lista.push(despesa);
        this.calcularDespesas();
        this.saveState();
        this.updateDespesasList();
        this.clearDespesaForm();
        this.calculateAll();
    }
    
    calcularDespesas() {
        const despesas = this.state.despesas.lista;
        let total = 0;
        let porCategoria = {};
        let categoriasText = [];
        
        despesas.forEach(despesa => {
            total += despesa.valor;
            
            if (!porCategoria[despesa.categoria]) {
                porCategoria[despesa.categoria] = 0;
            }
            porCategoria[despesa.categoria] += despesa.valor;
        });
        
        this.state.despesas.totalAnual = total;
        this.state.despesas.porCategoria = porCategoria;
        
        // Calcular percentual sobre faturamento
        const faturamento = this.state.faturamento.totalAnual;
        this.state.despesas.percentualSobreFaturamento = faturamento > 0 ? 
            (total / faturamento) * 100 : 0;
        
        // Calcular lucro operacional
        this.state.despesas.lucroOperacional = Math.max(0, faturamento - total);
        
        // Atualizar UI
        document.getElementById('total-despesas').textContent = 
            this.formatCurrency(total);
        document.getElementById('lucro-operacional').textContent = 
            this.formatCurrency(this.state.despesas.lucroOperacional);
        document.getElementById('percentual-despesas').textContent = 
            `${this.state.despesas.percentualSobreFaturamento.toFixed(1)}%`;
        
        // Atualizar breakdown de categorias
        Object.entries(porCategoria).forEach(([categoria, valor]) => {
            const categoriaLabel = this.getCategoriaLabel(categoria);
            categoriasText.push(`${categoriaLabel}: ${this.formatCurrency(valor)}`);
        });
        
        document.getElementById('categoria-breakdown').textContent = 
            categoriasText.length > 0 ? categoriasText.join(', ') : 'Nenhuma';
    }
    
    getCategoriaLabel(categoria) {
        const labels = {
            'pessoal': 'Pessoal',
            'aluguel': 'Aluguel',
            'energia': 'Energia',
            'telefonia': 'Telefonia',
            'material': 'Material',
            'servicos': 'Serviços',
            'tributos': 'Tributos',
            'depreciacao': 'Depreciação',
            'financeiras': 'Financeiras',
            'outros': 'Outros'
        };
        return labels[categoria] || categoria;
    }
    
    updateDespesasList() {
        const container = document.getElementById('despesas-table-body');
        if (!container) return;
        
        if (this.state.despesas.lista.length === 0) {
            container.innerHTML = `
                <div class="empty-row">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <p>Nenhuma despesa registrada</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        const categoriaLabels = {
            'pessoal': 'Pessoal',
            'aluguel': 'Aluguel',
            'energia': 'Energia',
            'telefonia': 'Telefonia',
            'material': 'Material',
            'servicos': 'Serviços',
            'tributos': 'Tributos',
            'depreciacao': 'Depreciação',
            'financeiras': 'Financeiras',
            'outros': 'Outros'
        };
        
        const mesLabels = {
            1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
            7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
        };
        
        this.state.despesas.lista.forEach(despesa => {
            html += `
                <div class="table-row">
                    <div class="table-cell">${despesa.descricao}</div>
                    <div class="table-cell">${this.formatCurrency(despesa.valor)}</div>
                    <div class="table-cell">${categoriaLabels[despesa.categoria] || despesa.categoria}</div>
                    <div class="table-cell">${mesLabels[despesa.mes] || despesa.mes}</div>
                    <div class="table-cell">${despesa.dedutivel ? 'Sim' : 'Não'}</div>
                    <div class="table-cell">
                        <button class="icon-btn delete-despesa" data-id="${despesa.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    clearDespesaForm() {
        document.getElementById('despesa-descricao').value = '';
        document.getElementById('despesa-valor').value = '';
        document.getElementById('despesa-nota').value = '';
    }
    
    deleteDespesa(id) {
        const despesaId = parseInt(id);
        this.state.despesas.lista = this.state.despesas.lista.filter(d => d.id !== despesaId);
        this.calcularDespesas();
        this.updateDespesasList();
        this.saveState();
        this.calculateAll();
    }
    
    calcularDAS() {
        const faturamentoInput = document.getElementById('faturamento-periodo');
        const faturamento = parseFloat(faturamentoInput.value) || this.state.faturamento.totalAnual;
        const anexo = document.getElementById('anexo').value || this.state.empresa.anexoSimples;
        const periodo = document.getElementById('periodo-das').value;
        
        // Encontrar faixa
        const anexoData = this.CONSTANTS.ANEXOS[anexo];
        let faixa = anexoData.faixas[0];
        let faixaIndex = 0;
        
        for (let i = 0; i < anexoData.faixas.length; i++) {
            if (faturamento <= anexoData.faixas[i].limite) {
                faixa = anexoData.faixas[i];
                faixaIndex = i;
                break;
            }
        }
        
        // Calcular DAS
        const aliquotaEfetiva = faixa.aliquota;
        const parcelaDeduzir = faixa.deducao;
        let das = (faturamento * aliquotaEfetiva) - parcelaDeduzir;
        das = Math.max(das, 0); // Não pode ser negativo
        
        // Ajustar para período
        if (periodo === 'mensal') {
            das = das / 12;
        } else if (periodo === 'trimestral') {
            das = das / 4;
        }
        
        // Calcular componentes (estimativa simplificada)
        const componentes = {
            icms: das * 0.25,
            iss: das * 0.25,
            pisCofins: das * 0.20,
            cpp: das * 0.10,
            irpj: das * 0.10,
            csll: das * 0.10
        };
        
        // Atualizar estado
        this.state.simplesNacional = {
            dasPeriodo: das,
            aliquotaEfetiva: aliquotaEfetiva * 100,
            valorDevido: das,
            componentes,
            faixaAtual: faixaIndex + 1,
            parcelaDeduzir
        };
        
        // Atualizar UI
        document.getElementById('das-valor').textContent = this.formatCurrency(das);
        document.getElementById('aliquota-das').textContent = `${aliquotaEfetiva * 100}%`;
        document.getElementById('valor-devido-das').textContent = this.formatCurrency(das);
        
        document.getElementById('icms-value').textContent = this.formatCurrency(componentes.icms);
        document.getElementById('iss-value').textContent = this.formatCurrency(componentes.iss);
        document.getElementById('pis-cofins-value').textContent = this.formatCurrency(componentes.pisCofins);
        document.getElementById('cpp-value').textContent = this.formatCurrency(componentes.cpp);
        document.getElementById('irpj-simples-value').textContent = this.formatCurrency(componentes.irpj);
        document.getElementById('csll-simples-value').textContent = this.formatCurrency(componentes.csll);
        
        // Atualizar alíquota efetiva no dashboard
        document.getElementById('aliquota-efetiva').textContent = `${aliquotaEfetiva * 100}%`;
    }
    
    handleRegimeChange(regime) {
        const anexoSelect = document.getElementById('anexo-simples');
        
        if (regime === 'simples') {
            anexoSelect.disabled = false;
            anexoSelect.parentElement.style.opacity = '1';
        } else {
            anexoSelect.disabled = true;
            anexoSelect.parentElement.style.opacity = '0.5';
        }
        
        this.state.empresa.regimeTributario = regime;
        this.saveState();
    }
    
    calcularLucroPresumido() {
        const faturamento = parseFloat(document.getElementById('faturamento-presumido').value) || 0;
        const percentualPresuncao = parseInt(document.getElementById('percentual-presuncao').value) || 8;
        
        const lucroPresumido = faturamento * (percentualPresuncao / 100);
        const irpj = lucroPresumido * this.CONSTANTS.IRPJ_ALIQUOTA;
        
        // Adicional IRPJ (sobre o que excede R$ 20.000/mês)
        const lucroMensal = lucroPresumido / 12;
        let adicionalIrpj = 0;
        if (lucroMensal > this.CONSTANTS.IRPJ_ADICIONAL_LIMITE) {
            const excedente = lucroPresumido - (this.CONSTANTS.IRPJ_ADICIONAL_LIMITE * 12);
            adicionalIrpj = excedente * this.CONSTANTS.IRPJ_ADICIONAL_ALIQUOTA;
        }
        
        const csll = lucroPresumido * this.CONSTANTS.CSLL_ALIQUOTA;
        const total = irpj + adicionalIrpj + csll;
        
        // Atualizar estado
        this.state.irpjCsll.lucroPresumido = {
            faturamento,
            percentualPresuncao,
            lucroPresumido,
            irpj,
            adicionalIrpj,
            csll,
            total
        };
        
        // Atualizar UI
        document.getElementById('lucro-presumido').textContent = this.formatCurrency(lucroPresumido);
        document.getElementById('irpj-presumido').textContent = this.formatCurrency(irpj);
        document.getElementById('adicional-irpj').textContent = this.formatCurrency(adicionalIrpj);
        document.getElementById('csll-presumido').textContent = this.formatCurrency(csll);
        document.getElementById('total-presumido').textContent = this.formatCurrency(total);
    }
    
    addSocioIRPF() {
        const socio = {
            nome: `Sócio ${this.state.irpfSocios.socios.length + 1}`,
            participacao: 100 / (this.state.irpfSocios.socios.length + 1),
            prolabore: 0,
            irpf: 0
        };
        
        this.state.irpfSocios.socios.push(socio);
        this.updateSociosIRPFTable();
        this.calcularIRPFSocios();
    }
    
    calcularIRPFSocios() {
        const prolaboreMensal = parseFloat(document.getElementById('prolabore-mensal').value) || 0;
        const mesesTrabalhados = parseInt(document.getElementById('meses-prolabore').value) || 13;
        const dependentes = parseInt(document.getElementById('dependentes-irpf').value) || 0;
        const outrasDeducoes = parseFloat(document.getElementById('outras-deducoes').value) || 0;
        
        const prolaboreAnual = prolaboreMensal * mesesTrabalhados;
        
        // Calcular INSS
        let inssRetido = 0;
        let baseINSS = prolaboreMensal;
        
        for (const bracket of this.CONSTANTS.INSS_BRACKETS) {
            if (baseINSS <= bracket.max) {
                inssRetido = (baseINSS * bracket.rate) - (bracket.fixed || 0);
                if (bracket.teto && inssRetido > bracket.teto) {
                    inssRetido = bracket.teto;
                }
                break;
            }
        }
        
        const inssAnual = inssRetido * mesesTrabalhados;
        
        // Calcular base IRPF
        let baseIrpf = prolaboreAnual - inssAnual;
        
        // Deduções
        const deducaoDependentes = dependentes * this.CONSTANTS.DEDUCAO_POR_DEPENDENTE;
        baseIrpf -= deducaoDependentes;
        baseIrpf -= outrasDeducoes;
        baseIrpf -= this.CONSTANTS.DEDUCAO_PADRAO;
        baseIrpf = Math.max(baseIrpf, 0);
        
        // Calcular IRPF
        let irpfDevido = 0;
        let remainingIncome = baseIrpf;
        
        for (let i = 0; i < this.CONSTANTS.TAX_BRACKETS.length; i++) {
            const bracket = this.CONSTANTS.TAX_BRACKETS[i];
            const prevBracket = i > 0 ? this.CONSTANTS.TAX_BRACKETS[i - 1] : { max: 0 };
            
            let bracketIncome = 0;
            if (remainingIncome > 0) {
                if (baseIrpf <= bracket.max) {
                    bracketIncome = baseIrpf - prevBracket.max;
                } else {
                    bracketIncome = bracket.max - prevBracket.max;
                }
                
                if (bracketIncome > 0) {
                    irpfDevido += bracketIncome * bracket.rate;
                }
                remainingIncome -= bracketIncome;
            }
        }
        
        const totalRecolher = inssAnual + irpfDevido;
        
        // Atualizar estado
        this.state.irpfSocios = {
            ...this.state.irpfSocios,
            prolaboreMensal,
            mesesTrabalhados,
            dependentes,
            outrasDeducoes,
            prolaboreAnual,
            inssRetido: inssAnual,
            baseCalculoIrpf: baseIrpf,
            irpfDevido,
            totalRecolher
        };
        
        // Atualizar UI
        document.getElementById('prolabore-anual').textContent = this.formatCurrency(prolaboreAnual);
        document.getElementById('inss-prolabore').textContent = this.formatCurrency(inssAnual);
        document.getElementById('base-irpf').textContent = this.formatCurrency(baseIrpf);
        document.getElementById('irpf-devido').textContent = this.formatCurrency(irpfDevido);
        document.getElementById('total-recolher').textContent = this.formatCurrency(totalRecolher);
    }
    
    updateSociosIRPFTable() {
        const container = document.getElementById('socios-irpf-table');
        if (!container) return;
        
        if (this.state.irpfSocios.socios.length === 0) {
            container.innerHTML = `
                <div class="empty-row">
                    <i class="fas fa-user-friends"></i>
                    <p>Nenhum sócio cadastrado</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.state.irpfSocios.socios.forEach((socio, index) => {
            html += `
                <div class="table-row">
                    <div class="table-cell">${socio.nome}</div>
                    <div class="table-cell">${socio.participacao.toFixed(1)}%</div>
                    <div class="table-cell">${this.formatCurrency(socio.prolabore)}</div>
                    <div class="table-cell">${this.formatCurrency(socio.retiradas || 0)}</div>
                    <div class="table-cell">${this.formatCurrency(socio.irpf || 0)}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    runFullSimulation() {
        // 1. Faturamento e Despesas
        const faturamentoBruto = this.state.faturamento.totalAnual;
        const despesasTotais = this.state.despesas.totalAnual;
        const lucroOperacional = Math.max(0, faturamentoBruto - despesasTotais);
        
        // 2. Simples Nacional
        const dasAnual = this.state.simplesNacional.dasPeriodo * 12;
        
        // 3. IRPF Sócios
        const prolaboreAnual = this.state.irpfSocios.prolaboreAnual;
        const inssProlabore = this.state.irpfSocios.inssRetido;
        const irpfProlabore = this.state.irpfSocios.irpfDevido;
        
        // 4. Carga Tributária Total
        const cargaTributariaTotal = dasAnual + inssProlabore + irpfProlabore;
        
        // 5. Alíquotas Efetivas
        const aliquotaSimples = faturamentoBruto > 0 ? (dasAnual / faturamentoBruto) * 100 : 0;
        const aliquotaINSS = prolaboreAnual > 0 ? (inssProlabore / prolaboreAnual) * 100 : 0;
        const aliquotaIRPF = prolaboreAnual > 0 ? (irpfProlabore / prolaboreAnual) * 100 : 0;
        const aliquotaTotal = faturamentoBruto > 0 ? (cargaTributariaTotal / faturamentoBruto) * 100 : 0;
        
        // 6. Situação Fiscal
        let situacaoFiscal = 'Regular';
        if (faturamentoBruto > this.CONSTANTS.LIMITE_FATURAMENTO_ME) {
            situacaoFiscal = 'Atenção: Limite ME excedido';
        }
        
        // 7. Obrigações
        const obrigacoes = [
            { descricao: 'DAS Simples Nacional', periodicidade: 'Mensal', vencimento: '20º dia útil' },
            { descricao: 'GPS - Pró-labore', periodicidade: 'Mensal', vencimento: '15º dia útil' },
            { descricao: 'DIRF', periodicidade: 'Anual', vencimento: 'Último dia útil de fevereiro' },
            { descricao: 'DASN', periodicidade: 'Anual', vencimento: '31 de janeiro' }
        ];
        
        // Atualizar estado
        this.state.simulacao = {
            faturamentoBruto,
            despesasTotais,
            lucroOperacional,
            dasAnual,
            prolaboreAnual,
            inssProlabore,
            irpfProlabore,
            cargaTributariaTotal,
            aliquotasEfetivas: {
                simples: aliquotaSimples,
                inss: aliquotaINSS,
                irpf: aliquotaIRPF,
                total: aliquotaTotal
            },
            situacaoFiscal,
            obrigacoes
        };
        
        // Atualizar UI
        this.updateSimulationUI();
    }
    
    updateSimulationUI() {
        const sim = this.state.simulacao;
        
        // Resumo Fiscal
        document.getElementById('sim-faturamento').textContent = this.formatCurrency(sim.faturamentoBruto);
        document.getElementById('sim-despesas').textContent = this.formatCurrency(sim.despesasTotais);
        document.getElementById('sim-lucro').textContent = this.formatCurrency(sim.lucroOperacional);
        document.getElementById('sim-das').textContent = this.formatCurrency(sim.dasAnual);
        document.getElementById('sim-prolabore').textContent = this.formatCurrency(sim.prolaboreAnual);
        document.getElementById('sim-inss').textContent = this.formatCurrency(sim.inssProlabore);
        document.getElementById('sim-irpf').textContent = this.formatCurrency(sim.irpfProlabore);
        document.getElementById('sim-carga-tributaria').textContent = this.formatCurrency(sim.cargaTributariaTotal);
        
        // Alíquotas
        document.getElementById('aliquota-simples').textContent = `${sim.aliquotasEfetivas.simples.toFixed(2)}%`;
        document.getElementById('aliquota-inss').textContent = `${sim.aliquotasEfetivas.inss.toFixed(2)}%`;
        document.getElementById('aliquota-irpf').textContent = `${sim.aliquotasEfetivas.irpf.toFixed(2)}%`;
        document.getElementById('aliquota-total').textContent = `${sim.aliquotasEfetivas.total.toFixed(2)}%`;
        
        // Barras de alíquota
        document.getElementById('bar-simples').style.width = `${Math.min(sim.aliquotasEfetivas.simples, 100)}%`;
        document.getElementById('bar-inss').style.width = `${Math.min(sim.aliquotasEfetivas.inss, 100)}%`;
        document.getElementById('bar-irpf').style.width = `${Math.min(sim.aliquotasEfetivas.irpf, 100)}%`;
        document.getElementById('bar-total').style.width = `${Math.min(sim.aliquotasEfetivas.total, 100)}%`;
    }
    
    runValidations() {
        this.validateLimiteME();
        this.validateDocuments();
        this.validateObrigacoes();
        this.updateValidationResults();
    }
    
    validateLimiteME() {
        const faturamento = this.state.faturamento.totalAnual;
        const limite = this.CONSTANTS.LIMITE_FATURAMENTO_ME;
        
        let status = '✅ DENTRO DO LIMITE';
        let statusClass = 'success';
        let detalhe = `R$ ${this.formatNumber(faturamento)} de R$ ${this.formatNumber(limite)}`;
        
        if (faturamento > limite) {
            status = '❌ LIMITE ULTRAPASSADO';
            statusClass = 'error';
        } else if (faturamento > limite * 0.8) {
            status = '⚠️ PRÓXIMO DO LIMITE';
            statusClass = 'warning';
        }
        
        document.getElementById('status-limite').textContent = status;
        document.getElementById('status-limite').className = `validation-status ${statusClass}`;
        
        return { status, detalhe, tipo: 'Limite ME' };
    }
    
    validateDocuments() {
        const cnpjValido = this.validateCNPJ(this.state.identificacao.cnpj);
        const sociosValidos = this.state.identificacao.socios.length > 0;
        
        let status = '✅ DOCUMENTOS OK';
        let statusClass = 'success';
        let detalhe = 'CNPJ válido e sócios cadastrados';
        
        if (!cnpjValido && !sociosValidos) {
            status = '❌ FALTA DOCUMENTOS';
            statusClass = 'error';
            detalhe = 'CNPJ inválido e nenhum sócio';
        } else if (!cnpjValido) {
            status = '❌ CNPJ INVÁLIDO';
            statusClass = 'error';
            detalhe = 'CNPJ precisa ser válido';
        } else if (!sociosValidos) {
            status = '⚠️ SEM SÓCIOS';
            statusClass = 'warning';
            detalhe = 'Cadastre pelo menos um sócio';
        }
        
        document.getElementById('status-documentos').textContent = status;
        document.getElementById('status-documentos').className = `validation-status ${statusClass}`;
        
        return { status, detalhe, tipo: 'Documentos' };
    }
    
    validateObrigacoes() {
        const hasReceitas = this.state.faturamento.receitas.length > 0;
        const hasDespesas = this.state.despesas.lista.length > 0;
        const regimeDefinido = this.state.empresa.regimeTributario !== '';
        
        let status = '✅ OBRIGAÇÕES OK';
        let statusClass = 'success';
        let detalhe = 'Todas obrigações atendidas';
        
        if (!hasReceitas && !hasDespesas) {
            status = '⚠️ DADOS INCOMPLETOS';
            statusClass = 'warning';
            detalhe = 'Cadastre receitas e despesas';
        } else if (!hasReceitas) {
            status = '⚠️ SEM RECEITAS';
            statusClass = 'warning';
            detalhe = 'Cadastre pelo menos uma receita';
        } else if (!regimeDefinido) {
            status = '⚠️ REGIME INDEFINIDO';
            statusClass = 'warning';
            detalhe = 'Defina o regime tributário';
        }
        
        document.getElementById('status-obrigacoes').textContent = status;
        document.getElementById('status-obrigacoes').className = `validation-status ${statusClass}`;
        
        return { status, detalhe, tipo: 'Obrigações' };
    }
    
    updateValidationResults() {
        const resultsContainer = document.getElementById('validation-results');
        const alertsContainer = document.getElementById('validation-alerts');
        
        if (!resultsContainer || !alertsContainer) return;
        
        const validations = [
            this.validateLimiteME(),
            this.validateDocuments(),
            this.validateObrigacoes()
        ];
        
        // Calcular conformidade geral
        const allValid = validations.every(v => v.status.includes('✅'));
        const hasErrors = validations.some(v => v.status.includes('❌'));
        const hasWarnings = validations.some(v => v.status.includes('⚠️'));
        
        let conformidadeStatus = '✅ CONFORME';
        let conformidadeClass = 'success';
        
        if (hasErrors) {
            conformidadeStatus = '❌ NÃO CONFORME';
            conformidadeClass = 'error';
        } else if (hasWarnings) {
            conformidadeStatus = '⚠️ ATENÇÃO';
            conformidadeClass = 'warning';
        }
        
        document.getElementById('status-conformidade').textContent = conformidadeStatus;
        document.getElementById('status-conformidade').className = `validation-status ${conformidadeClass}`;
        
        // Atualizar resultados
        resultsContainer.innerHTML = '';
        alertsContainer.innerHTML = '';
        
        validations.forEach(validation => {
            const div = document.createElement('div');
            div.className = 'validation-result-item';
            div.innerHTML = `
                <span>${validation.status.split(' ')[0]} ${validation.tipo}</span>
                <span>${validation.detalhe}</span>
            `;
            resultsContainer.appendChild(div);
            
            // Adicionar alertas
            if (validation.status.includes('❌') || validation.status.includes('⚠️')) {
                const alertDiv = document.createElement('div');
                alertDiv.className = 'validation-alert-item';
                alertDiv.innerHTML = `
                    <span>${validation.status.split(' ')[0]} ${validation.tipo}</span>
                    <span>${validation.detalhe}</span>
                `;
                alertsContainer.appendChild(alertDiv);
            }
        });
        
        // Alertas adicionais
        const faturamento = this.state.faturamento.totalAnual;
        const limite = this.CONSTANTS.LIMITE_FATURAMENTO_ME;
        
        if (faturamento > 0 && faturamento / limite > 0.8) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'validation-alert-item';
            alertDiv.innerHTML = `
                <span>⚠️ Faturamento Alto</span>
                <span>${Math.round(faturamento/limite*100)}% do limite ME</span>
            `;
            alertsContainer.appendChild(alertDiv);
        }
        
        if (this.state.identificacao.socios.length === 0) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'validation-alert-item';
            alertDiv.innerHTML = `
                <span>⚠️ Sem Sócios</span>
                <span>Cadastre pelo menos um sócio</span>
            `;
            alertsContainer.appendChild(alertDiv);
        }
    }
    
    generateReport() {
        const preview = document.getElementById('report-preview');
        if (!preview) return;
        
        const now = new Date();
        const reportDate = now.toLocaleDateString('pt-BR');
        const reportTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Atualizar data e hora no relatório
        document.getElementById('report-date').textContent = reportDate;
        document.getElementById('report-time').textContent = reportTime;
        
        // Atualizar dados da empresa
        document.getElementById('report-razao-social').textContent = 
            this.state.identificacao.razaoSocial || 'Não informado';
        document.getElementById('report-cnpj').textContent = 
            this.state.identificacao.cnpj || 'Não informado';
        document.getElementById('report-data-abertura').textContent = 
            this.formatDate(this.state.identificacao.dataAbertura) || 'Não informado';
        document.getElementById('report-cnae').textContent = 
            this.state.empresa.cnae || 'Não informado';
        
        // Atualizar dados financeiros
        document.getElementById('report-faturamento').textContent = 
            this.formatCurrency(this.state.simulacao.faturamentoBruto);
        document.getElementById('report-despesas').textContent = 
            this.formatCurrency(this.state.simulacao.despesasTotais);
        document.getElementById('report-lucro').textContent = 
            this.formatCurrency(this.state.simulacao.lucroOperacional);
        document.getElementById('report-das').textContent = 
            this.formatCurrency(this.state.simulacao.dasAnual);
        
        // Atualizar dados de impostos
        document.getElementById('report-base-simples').textContent = 
            this.formatCurrency(this.state.simulacao.faturamentoBruto);
        document.getElementById('report-aliquota-simples').textContent = 
            `${this.state.simulacao.aliquotasEfetivas.simples.toFixed(2)}%`;
        document.getElementById('report-valor-simples').textContent = 
            this.formatCurrency(this.state.simulacao.dasAnual);
        
        document.getElementById('report-base-inss').textContent = 
            this.formatCurrency(this.state.irpfSocios.prolaboreAnual);
        document.getElementById('report-aliquota-inss').textContent = 
            `${this.state.simulacao.aliquotasEfetivas.inss.toFixed(2)}%`;
        document.getElementById('report-valor-inss').textContent = 
            this.formatCurrency(this.state.simulacao.inssProlabore);
        
        document.getElementById('report-base-irpf').textContent = 
            this.formatCurrency(this.state.irpfSocios.baseCalculoIrpf);
        document.getElementById('report-aliquota-irpf').textContent = 
            `${this.state.simulacao.aliquotasEfetivas.irpf.toFixed(2)}%`;
        document.getElementById('report-valor-irpf').textContent = 
            this.formatCurrency(this.state.simulacao.irpfProlabore);
        
        document.getElementById('report-aliquota-total').textContent = 
            `${this.state.simulacao.aliquotasEfetivas.total.toFixed(2)}%`;
        document.getElementById('report-total-tributos').textContent = 
            this.formatCurrency(this.state.simulacao.cargaTributariaTotal);
    }
    
    toggleWhatIfScenario() {
        const panel = document.getElementById('what-if-panel');
        const btn = document.getElementById('what-if-btn');
        
        if (panel.style.display === 'none' || !panel.style.display) {
            panel.style.display = 'block';
            btn.innerHTML = '<i class="fas fa-times"></i> Fechar Cenário';
            this.state.whatIfScenario.active = true;
        } else {
            panel.style.display = 'none';
            btn.innerHTML = '<i class="fas fa-flask"></i> Cenário "E Se"';
            this.state.whatIfScenario.active = false;
            this.resetWhatIfScenario();
        }
    }
    
    applyWhatIfScenario() {
        const faturamentoAdicional = parseFloat(document.getElementById('what-if-faturamento').value) || 0;
        const despesasAdicionais = parseFloat(document.getElementById('what-if-despesas').value) || 0;
        const prolaboreAdicional = parseFloat(document.getElementById('what-if-prolabore').value) || 0;
        const anexoAlternativo = document.getElementById('what-if-anexo').value;
        
        this.state.whatIfScenario = {
            active: true,
            faturamentoAdicional,
            despesasAdicionais,
            prolaboreAdicional,
            anexoAlternativo
        };
        
        // Aplicar alterações temporárias
        const faturamentoOriginal = this.state.faturamento.totalAnual;
        const despesasOriginal = this.state.despesas.totalAnual;
        const prolaboreOriginal = this.state.irpfSocios.prolaboreMensal;
        const anexoOriginal = this.state.empresa.anexoSimples;
        
        // Simular com novos valores
        const faturamentoSimulado = faturamentoOriginal + faturamentoAdicional;
        const despesasSimuladas = despesasOriginal + despesasAdicionais;
        const prolaboreSimulado = prolaboreOriginal + prolaboreAdicional;
        
        // Atualizar visualização
        document.getElementById('sim-faturamento').textContent = 
            this.formatCurrency(faturamentoSimulado) + ' *';
        document.getElementById('sim-despesas').textContent = 
            this.formatCurrency(despesasSimuladas) + ' *';
        document.getElementById('sim-prolabore').textContent = 
            this.formatCurrency(prolaboreSimulado * 13) + ' *';
        
        // Mostrar aviso
        const aviso = document.createElement('div');
        aviso.className = 'cyber-alert info';
        aviso.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-flask"></i>
            </div>
            <div class="alert-content">
                <h4>Cenário "E Se" Aplicado</h4>
                <p>Valores marcados com * são simulados. Clique em "Voltar ao Real" para restaurar os valores originais.</p>
            </div>
        `;
        
        const simulationSection = document.getElementById('simulation-section');
        const existingAviso = simulationSection.querySelector('.cyber-alert.info:last-child');
        if (existingAviso && existingAviso.querySelector('.fa-flask')) {
            existingAviso.remove();
        }
        simulationSection.insertBefore(aviso, simulationSection.querySelector('.section-actions'));
    }
    
    resetWhatIfScenario() {
        document.getElementById('what-if-faturamento').value = 0;
        document.getElementById('what-if-despesas').value = 0;
        document.getElementById('what-if-prolabore').value = 0;
        document.getElementById('what-if-anexo').value = 'I';
        
        this.state.whatIfScenario = {
            active: false,
            faturamentoAdicional: 0,
            despesasAdicionais: 0,
            prolaboreAdicional: 0,
            anexoAlternativo: 'I'
        };
        
        this.runFullSimulation();
    }
    
    switchTab(tabId) {
        // Atualizar botões de tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });
        
        // Atualizar conteúdo das tabs
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === tabId) {
                pane.classList.add('active');
            }
        });
    }
    
    saveFormData() {
        // Identificação
        this.state.identificacao = {
            razaoSocial: document.getElementById('razao-social').value,
            nomeFantasia: document.getElementById('nome-fantasia').value,
            cnpj: document.getElementById('cnpj').value,
            dataAbertura: document.getElementById('data-abertura').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            socios: this.state.identificacao.socios
        };
        
        // Endereço
        this.state.endereco = {
            cep: document.getElementById('cep').value,
            logradouro: document.getElementById('logradouro').value,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            uf: document.getElementById('uf').value
        };
        
        // Empresa
        this.state.empresa = {
            cnae: document.getElementById('cnae').value,
            descricaoAtividade: document.getElementById('atividade').value,
            regimeTributario: document.getElementById('regime-tributario').value,
            anexoSimples: document.getElementById('anexo-simples').value,
            porteEmpresa: document.getElementById('porte-empresa').value,
            capitalSocial: parseFloat(document.getElementById('capital-social').value) || 0
        };
        
        // Atualizar sócios
        document.querySelectorAll('.socio-form').forEach((form, index) => {
            if (this.state.identificacao.socios[index]) {
                this.state.identificacao.socios[index] = {
                    nome: form.querySelector('.socio-nome').value,
                    cpf: form.querySelector('.socio-cpf').value,
                    participacao: parseFloat(form.querySelector('.socio-participacao').value) || 0,
                    administrador: form.querySelector('.socio-admin').value === 'sim'
                };
            }
        });
        
        this.saveState();
        this.updateProgress();
        this.calculateAll();
    }
    
    saveState() {
        try {
            localStorage.setItem('microEmpresaAssistantState', JSON.stringify(this.state));
        } catch (e) {
            console.error('Erro ao salvar estado:', e);
        }
    }
    
    loadState() {
        try {
            const saved = localStorage.getItem('microEmpresaAssistantState');
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.assign(this.state, parsed);
                this.populateForm();
                this.updateReceitasList();
                this.updateDespesasList();
                this.updateSociosIRPFTable();
                
                if (this.state.currentSection) {
                    setTimeout(() => {
                        this.navigateTo(this.state.currentSection);
                    }, 100);
                }
            }
        } catch (e) {
            console.error('Erro ao carregar estado:', e);
        }
    }
    
    populateForm() {
        // Identificação
        if (this.state.identificacao) {
            document.getElementById('razao-social').value = this.state.identificacao.razaoSocial || '';
            document.getElementById('nome-fantasia').value = this.state.identificacao.nomeFantasia || '';
            document.getElementById('cnpj').value = this.state.identificacao.cnpj || '';
            document.getElementById('data-abertura').value = this.state.identificacao.dataAbertura || '';
            document.getElementById('telefone').value = this.state.identificacao.telefone || '';
            document.getElementById('email').value = this.state.identificacao.email || '';
        }
        
        // Endereço
        if (this.state.endereco) {
            document.getElementById('cep').value = this.state.endereco.cep || '';
            document.getElementById('logradouro').value = this.state.endereco.logradouro || '';
            document.getElementById('numero').value = this.state.endereco.numero || '';
            document.getElementById('complemento').value = this.state.endereco.complemento || '';
            document.getElementById('bairro').value = this.state.endereco.bairro || '';
            document.getElementById('cidade').value = this.state.endereco.cidade || '';
            document.getElementById('uf').value = this.state.endereco.uf || '';
        }
        
        // Empresa
        if (this.state.empresa) {
            document.getElementById('cnae').value = this.state.empresa.cnae || '';
            document.getElementById('atividade').value = this.state.empresa.descricaoAtividade || '';
            document.getElementById('regime-tributario').value = this.state.empresa.regimeTributario || 'simples';
            document.getElementById('anexo-simples').value = this.state.empresa.anexoSimples || 'I';
            document.getElementById('porte-empresa').value = this.state.empresa.porteEmpresa || 'micro';
            document.getElementById('capital-social').value = this.state.empresa.capitalSocial || 0;
            
            this.handleRegimeChange(this.state.empresa.regimeTributario);
        }
        
        // Sócios
        if (this.state.identificacao.socios && this.state.identificacao.socios.length > 0) {
            const container = document.getElementById('socios-container');
            container.innerHTML = '';
            
            this.state.identificacao.socios.forEach((socio, index) => {
                const template = document.getElementById('socio-form-template');
                const socioDiv = template.cloneNode(true);
                socioDiv.id = '';
                socioDiv.style.display = 'block';
                socioDiv.dataset.index = index;
                
                socioDiv.querySelector('.socio-nome').value = socio.nome || '';
                socioDiv.querySelector('.socio-cpf').value = socio.cpf || '';
                socioDiv.querySelector('.socio-participacao').value = socio.participacao || '';
                socioDiv.querySelector('.socio-admin').value = socio.administrador ? 'sim' : 'nao';
                
                socioDiv.querySelector('.remove-socio').dataset.index = index;
                
                container.appendChild(socioDiv);
            });
        }
        
        // IRPF
        if (this.state.irpfSocios) {
            document.getElementById('prolabore-mensal').value = this.state.irpfSocios.prolaboreMensal || 0;
            document.getElementById('meses-prolabore').value = this.state.irpfSocios.mesesTrabalhados || 13;
            document.getElementById('dependentes-irpf').value = this.state.irpfSocios.dependentes || 0;
            document.getElementById('outras-deducoes').value = this.state.irpfSocios.outrasDeducoes || 0;
        }
    }
    
    updateProgress() {
        let filled = 0;
        let total = 0;
        
        // Campos obrigatórios
        const requiredFields = [
            '#razao-social', '#cnpj', '#data-abertura',
            '#logradouro', '#numero', '#bairro', '#cidade', '#uf',
            '#cnae', '#atividade', '#regime-tributario'
        ];
        
        requiredFields.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                total++;
                if (element.value && element.value.trim()) filled++;
            }
        });
        
        // Sócios
        if (this.state.identificacao.socios.length > 0) {
            filled++;
        }
        total++;
        
        // Receitas
        if (this.state.faturamento.receitas.length > 0) {
            filled++;
        }
        total++;
        
        const progress = total > 0 ? (filled / total) * 100 : 0;
        
        // Atualizar UI
        document.getElementById('progress-percentage').textContent = `${Math.round(progress)}%`;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('completed-items').textContent = filled;
        
        this.state.progress = progress;
    }
    
    calculateAll() {
        this.calcularFaturamento();
        this.calcularDespesas();
        this.calcularDAS();
        this.calcularIRPFSocios();
        this.runFullSimulation();
        this.updateProgress();
        this.saveState();
    }
    
    exportPDF() {
    // Criar um iframe oculto para o PDF
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);
    
    const now = new Date();
    const reportDate = now.toLocaleDateString('pt-BR');
    const reportTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Obter dados atuais da simulação
    this.runFullSimulation();
    
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Fiscal - Microempresa ${reportDate}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: Arial, sans-serif;
                color: #333;
                line-height: 1.4;
                font-size: 12pt;
                padding: 20px;
                background: white;
            }
            
            .pdf-container {
                max-width: 210mm;
                margin: 0 auto;
            }
            
            .pdf-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #0066cc;
            }
            
            .pdf-header h1 {
                color: #0066cc;
                font-size: 24px;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .pdf-subtitle {
                color: #666;
                font-size: 14px;
                margin-bottom: 15px;
            }
            
            .header-info {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #555;
                margin-top: 20px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
            }
            
            .pdf-section {
                margin-bottom: 25px;
                page-break-inside: avoid;
            }
            
            .pdf-section h2 {
                color: #0066cc;
                font-size: 16px;
                margin-bottom: 15px;
                padding-bottom: 5px;
                border-bottom: 2px solid #0066cc;
                font-weight: bold;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin: 15px 0;
            }
            
            .info-item {
                padding: 8px;
                background: #f8f9fa;
                border-radius: 4px;
                border-left: 3px solid #0066cc;
            }
            
            .info-item strong {
                display: block;
                color: #555;
                font-size: 11px;
                margin-bottom: 3px;
            }
            
            .info-item span {
                color: #222;
                font-size: 12px;
            }
            
            .financial-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            
            .summary-card {
                text-align: center;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #ddd;
            }
            
            .summary-card h3 {
                font-size: 12px;
                color: #555;
                margin-bottom: 10px;
            }
            
            .summary-value {
                font-size: 20px;
                font-weight: bold;
                color: #0066cc;
                margin: 10px 0;
            }
            
            .summary-detail {
                font-size: 10px;
                color: #777;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                font-size: 11px;
            }
            
            th {
                background: #0066cc;
                color: white;
                padding: 8px;
                text-align: left;
                font-weight: bold;
                border: 1px solid #0055aa;
            }
            
            td {
                padding: 8px;
                border: 1px solid #ddd;
            }
            
            tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .total-row {
                background: #d4edda !important;
                font-weight: bold;
            }
            
            .observations {
                background: #fff8e1;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #ff9800;
                margin: 25px 0;
                font-size: 11px;
            }
            
            .observations p {
                margin: 8px 0;
                line-height: 1.5;
            }
            
            .pdf-footer {
                text-align: center;
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px solid #ddd;
                color: #777;
                font-size: 10px;
            }
            
            .footer-note {
                font-style: italic;
                margin: 10px 0;
            }
            
            .footer-company {
                margin-top: 15px;
                color: #555;
                font-weight: 500;
            }
            
            @media print {
                body {
                    padding: 15mm;
                }
                
                .pdf-container {
                    padding: 0;
                }
                
                .page-break {
                    page-break-before: always;
                }
                
                .no-print {
                    display: none;
                }
                
                .summary-card {
                    background: white !important;
                    border: 1px solid #ddd !important;
                }
                
                .info-item {
                    background: white !important;
                    border: 1px solid #ddd !important;
                }
                
                .observations {
                    background: white !important;
                    border: 1px solid #ddd !important;
                }
                
                @page {
                    margin: 15mm;
                }
            }
        </style>
    </head>
    <body>
        <div class="pdf-container">
            <header class="pdf-header">
                <h1>RELATÓRIO FISCAL COMPLETO</h1>
                <p class="pdf-subtitle">Microempresa - Simples Nacional 2026</p>
                <div class="header-info">
                    <div>
                        <strong>Data:</strong> ${reportDate}<br>
                        <strong>Hora:</strong> ${reportTime}
                    </div>
                    <div>
                        <strong>Página:</strong> 1<br>
                        <strong>Versão:</strong> 2.0
                    </div>
                </div>
            </header>
            
            <div class="pdf-section">
                <h2>📋 Dados da Empresa</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Razão Social:</strong>
                        <span>${this.state.identificacao.razaoSocial || 'Não informado'}</span>
                    </div>
                    <div class="info-item">
                        <strong>CNPJ:</strong>
                        <span>${this.state.identificacao.cnpj || 'Não informado'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Data Abertura:</strong>
                        <span>${this.formatDate(this.state.identificacao.dataAbertura) || 'Não informado'}</span>
                    </div>
                    <div class="info-item">
                        <strong>CNAE:</strong>
                        <span>${this.state.empresa.cnae || 'Não informado'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Regime Tributário:</strong>
                        <span>${this.state.empresa.regimeTributario === 'simples' ? 'Simples Nacional' : this.state.empresa.regimeTributario}</span>
                    </div>
                    <div class="info-item">
                        <strong>Porte:</strong>
                        <span>${this.state.empresa.porteEmpresa === 'micro' ? 'Microempresa (ME)' : 'Empresa de Pequeno Porte (EPP)'}</span>
                    </div>
                </div>
            </div>
            
            <div class="pdf-section">
                <h2>💰 Resumo Financeiro</h2>
                <div class="financial-summary">
                    <div class="summary-card">
                        <h3>Faturamento Anual</h3>
                        <p class="summary-value">${this.formatCurrency(this.state.simulacao.faturamentoBruto)}</p>
                        <p class="summary-detail">Total de receitas</p>
                    </div>
                    <div class="summary-card">
                        <h3>Despesas Anuais</h3>
                        <p class="summary-value">${this.formatCurrency(this.state.simulacao.despesasTotais)}</p>
                        <p class="summary-detail">Custos operacionais</p>
                    </div>
                    <div class="summary-card">
                        <h3>Lucro Operacional</h3>
                        <p class="summary-value">${this.formatCurrency(this.state.simulacao.lucroOperacional)}</p>
                        <p class="summary-detail">Faturamento - Despesas</p>
                    </div>
                    <div class="summary-card">
                        <h3>DAS Anual</h3>
                        <p class="summary-value">${this.formatCurrency(this.state.simulacao.dasAnual)}</p>
                        <p class="summary-detail">Simples Nacional</p>
                    </div>
                </div>
            </div>
            
            <div class="pdf-section">
                <h2>📊 Simulação de Impostos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Imposto/Tributo</th>
                            <th>Base de Cálculo</th>
                            <th>Alíquota</th>
                            <th>Valor Anual</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>DAS - Simples Nacional</td>
                            <td>${this.formatCurrency(this.state.simulacao.faturamentoBruto)}</td>
                            <td>${this.state.simulacao.aliquotasEfetivas.simples.toFixed(2)}%</td>
                            <td>${this.formatCurrency(this.state.simulacao.dasAnual)}</td>
                        </tr>
                        <tr>
                            <td>INSS - Pró-labore</td>
                            <td>${this.formatCurrency(this.state.irpfSocios.prolaboreAnual)}</td>
                            <td>${this.state.simulacao.aliquotasEfetivas.inss.toFixed(2)}%</td>
                            <td>${this.formatCurrency(this.state.simulacao.inssProlabore)}</td>
                        </tr>
                        <tr>
                            <td>IRPF - Pró-labore</td>
                            <td>${this.formatCurrency(this.state.irpfSocios.baseCalculoIrpf)}</td>
                            <td>${this.state.simulacao.aliquotasEfetivas.irpf.toFixed(2)}%</td>
                            <td>${this.formatCurrency(this.state.simulacao.irpfProlabore)}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Total de Tributos</strong></td>
                            <td></td>
                            <td>${this.state.simulacao.aliquotasEfetivas.total.toFixed(2)}%</td>
                            <td><strong>${this.formatCurrency(this.state.simulacao.cargaTributariaTotal)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="pdf-section">
                <h2>⚖️ Observações Fiscais Importantes</h2>
                <div class="observations">
                    <p><strong>Este é um relatório de simulação fiscal.</strong> Não substitui a declaração oficial nem o trabalho de um contador.</p>
                    <p><strong>Microempresa no Simples Nacional</strong> tem limite de faturamento de R$ ${this.formatNumber(this.CONSTANTS.LIMITE_FATURAMENTO_ME)}/ano.</p>
                    <p><strong>Pró-labore deve ser estabelecido</strong> de acordo com as funções exercidas e conforme mercado.</p>
                    <p><strong>Distribuições de lucros</strong> são isentas de IRPF para ME no Simples Nacional.</p>
                    <p><strong>Consulte sempre um contador</strong> para validação final e orientações específicas.</p>
                </div>
            </div>
            
            <footer class="pdf-footer">
                <p>--- FIM DO RELATÓRIO ---</p>
                <p class="footer-note">Gerado pelo Sistema Fiscal para Microempresas - Simulador Completo 2026</p>
                <p class="footer-company">S&Q TECNOLOGIA DA INFORMACAO LTDA | CNPJ: 64.684.955/0001-98</p>
                <p>Gerado em: ${reportDate} às ${reportTime}</p>
            </footer>
        </div>
        
        <script>
            // Aguardar o carregamento e imprimir
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                    // Fechar a janela após impressão (opcional)
                    setTimeout(function() {
                        window.close();
                    }, 500);
                }, 500);
            };
        </script>
    </body>
    </html>
    `;

    // Escrever no iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    
    // Agora abrir em nova janela para impressão
    setTimeout(() => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();
            
            // Aguardar carregamento e imprimir
            printWindow.onload = function() {
                printWindow.print();
                
                // Opcional: fechar após impressão
                setTimeout(() => {
                    printWindow.close();
                }, 1000);
            };
        } else {
            // Fallback: usar iframe para impressão
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Remover iframe após impressão
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        }
    }, 500);
}
    printReport() {
    // Primeiro, atualizar os dados do relatório
    this.generateReport();
    
    // Usar a função de impressão nativa do navegador
    window.print();
}

    exportExcel() {
        // Criar dados para Excel
        const data = {
            empresa: {
                razaoSocial: this.state.identificacao.razaoSocial,
                cnpj: this.state.identificacao.cnpj,
                regimeTributario: this.state.empresa.regimeTributario
            },
            faturamento: this.state.faturamento.totalAnual,
            despesas: this.state.despesas.totalAnual,
            lucro: this.state.simulacao.lucroOperacional,
            impostos: {
                das: this.state.simulacao.dasAnual,
                inss: this.state.simulacao.inssProlabore,
                irpf: this.state.simulacao.irpfProlabore,
                total: this.state.simulacao.cargaTributariaTotal
            },
            receitas: this.state.faturamento.receitas,
            despesasDetalhadas: this.state.despesas.lista,
            geradoEm: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `dados-fiscais-me-${new Date().getTime()}.json`);
        link.click();
    }
    
    backupData() {
        const dataStr = JSON.stringify(this.state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `backup-completo-me-${new Date().getTime()}.json`);
        link.click();
        
        alert('Backup realizado com sucesso!');
    }
    
    clearData() {
        if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('microEmpresaAssistantState');
            
            // Resetar estado
            this.state = {
                identificacao: {
                    razaoSocial: '',
                    nomeFantasia: '',
                    cnpj: '',
                    dataAbertura: '',
                    telefone: '',
                    email: '',
                    socios: []
                },
                endereco: {
                    cep: '',
                    logradouro: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    uf: ''
                },
                empresa: {
                    cnae: '',
                    descricaoAtividade: '',
                    regimeTributario: 'simples',
                    anexoSimples: 'I',
                    porteEmpresa: 'micro',
                    capitalSocial: 0
                },
                faturamento: {
                    receitas: [],
                    totalAnual: 0,
                    mediaMensal: 0,
                    projecaoAnual: 0,
                    periodoReferencia: 'anual'
                },
                despesas: {
                    lista: [],
                    totalAnual: 0,
                    porCategoria: {},
                    percentualSobreFaturamento: 0,
                    lucroOperacional: 0
                },
                simplesNacional: {
                    dasPeriodo: 0,
                    aliquotaEfetiva: 0,
                    valorDevido: 0,
                    componentes: {
                        icms: 0,
                        iss: 0,
                        pisCofins: 0,
                        cpp: 0,
                        irpj: 0,
                        csll: 0
                    },
                    faixaAtual: 1,
                    parcelaDeduzir: 0
                },
                irpjCsll: {
                    regime: 'simples',
                    lucroPresumido: {
                        faturamento: 0,
                        percentualPresuncao: 8,
                        lucroPresumido: 0,
                        irpj: 0,
                        adicionalIrpj: 0,
                        csll: 0,
                        total: 0
                    },
                    lucroReal: {
                        lucroContabil: 0,
                        ajustesFiscais: 0,
                        baseIrpj: 0,
                        irpj: 0,
                        adicionalIrpj: 0,
                        baseCsll: 0,
                        csll: 0,
                        total: 0
                    }
                },
                irpfSocios: {
                    socios: [],
                    prolaboreMensal: 0,
                    mesesTrabalhados: 13,
                    dependentes: 0,
                    outrasDeducoes: 0,
                    prolaboreAnual: 0,
                    inssRetido: 0,
                    baseCalculoIrpf: 0,
                    irpfDevido: 0,
                    totalRecolher: 0,
                    distribuicoes: {
                        lucroDisponivel: 0,
                        percentualDistribuicao: 100,
                        totalDistribuir: 0
                    }
                },
                simulacao: {
                    faturamentoBruto: 0,
                    despesasTotais: 0,
                    lucroOperacional: 0,
                    dasAnual: 0,
                    prolaboreAnual: 0,
                    inssProlabore: 0,
                    irpfProlabore: 0,
                    cargaTributariaTotal: 0,
                    aliquotasEfetivas: {
                        simples: 0,
                        inss: 0,
                        irpf: 0,
                        total: 0
                    },
                    situacaoFiscal: 'Regular',
                    obrigacoes: []
                },
                validacao: {
                    conformidadeGeral: false,
                    limiteME: true,
                    documentos: false,
                    obrigacoes: false,
                    resultados: [],
                    alertas: []
                },
                currentSection: 'home',
                progress: 0,
                whatIfScenario: {
                    active: false,
                    faturamentoAdicional: 0,
                    despesasAdicionais: 0,
                    prolaboreAdicional: 0,
                    anexoAlternativo: 'I'
                }
            };
            
            // Limpar formulários
            document.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.type !== 'button' && element.type !== 'submit') {
                    element.value = '';
                }
            });
            
            // Resetar selects
            document.querySelectorAll('select').forEach(select => {
                select.selectedIndex = 0;
            });
            
            // Limpar listas
            document.getElementById('socios-container').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-friends"></i>
                    <p>Nenhum sócio cadastrado</p>
                </div>
            `;
            
            this.updateReceitasList();
            this.updateDespesasList();
            this.updateSociosIRPFTable();
            
            // Recalcular
            this.calculateAll();
            
            // Navegar para início
            this.navigateTo('home');
            
            alert('Todos os dados foram limpos com sucesso.');
        }
    }
    
    setupMobileLabels() {
        // Adicionar labels para elementos móveis
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.table-row').forEach(row => {
                const cells = row.querySelectorAll('.table-cell');
                if (cells.length >= 6) {
                    cells[0].setAttribute('data-label', 'Descrição:');
                    cells[1].setAttribute('data-label', 'Valor:');
                    cells[2].setAttribute('data-label', 'Tipo:');
                    cells[3].setAttribute('data-label', 'Mês:');
                    cells[4].setAttribute('data-label', 'Cliente:');
                }
            });
        }
        
        window.addEventListener('resize', () => {
            setTimeout(() => this.setupMobileLabels(), 100);
        });
    }
    
    // Utilitários
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    }
    
    formatNumber(value) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    const assistant = new MicroEmpresaAssistant();
    window.microEmpresaAssistant = assistant;
});
