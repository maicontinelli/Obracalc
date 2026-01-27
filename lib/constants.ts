
export const BOQ_TEMPLATES = {
    obra_nova: [
        {
            id: 'cat_preliminares',
            name: '1. SERVIÇOS PRELIMINARES E GERAIS',
            items: [
                { id: 'pre_001', name: 'Levantamento topográfico planialtimétrico cadastral', unit: 'm²', price: 1.50, quantity: 1 },
                { id: 'pre_002', name: 'Sondagem SPT (furo)', unit: 'm', price: 180.00, quantity: 15 },
                { id: 'pre_003', name: 'Projeto Arquitetônico Executivo', unit: 'm²', price: 45.00, quantity: 1 },
                { id: 'pre_004', name: 'Projetos Complementares (Elétrica, Hidráulica, Estrutural)', unit: 'm²', price: 35.00, quantity: 1 },
                { id: 'pre_005', name: 'Mobilização e desmobilização de canteiro', unit: 'vb', price: 3500.00, quantity: 1 },
                { id: 'pre_006', name: 'Tapume em chapa de madeira compensada (h=2.20m)', unit: 'm²', price: 95.00, quantity: 0 },
                { id: 'pre_007', name: 'Barracão de obra / Escritório / Depósito', unit: 'm²', price: 550.00, quantity: 0 },
                { id: 'pre_008', name: 'Locação da obra (gabarito de madeira)', unit: 'm²', price: 18.00, quantity: 0 },
                { id: 'pre_009', name: 'Placa de obra em chapa galvanizada', unit: 'm²', price: 450.00, quantity: 1 },
                { id: 'pre_010', name: 'Caçamba estacionária para entulho (5m³)', unit: 'un', price: 450.00, quantity: 0 },
                { id: 'pre_011', name: 'Limpeza mecanizada de terreno (bota-fora)', unit: 'm²', price: 8.50, quantity: 0 },
                { id: 'pre_012', name: 'Ligação provisória de energia e água', unit: 'vb', price: 1200.00, quantity: 1 }
            ]
        },
        {
            id: 'cat_demolicoes',
            name: '2. DEMOLIÇÕES E RETIRADAS',
            items: [
                { id: 'dem_001', name: 'Demolição manual de alvenaria', unit: 'm³', price: 120.00, quantity: 0 },
                { id: 'dem_002', name: 'Demolição de concreto armado manual', unit: 'm³', price: 350.00, quantity: 0 },
                { id: 'dem_003', name: 'Retirada de piso cerâmico ou ladrilho', unit: 'm²', price: 25.00, quantity: 0 },
                { id: 'dem_004', name: 'Retirada de esquadrias (portas/janelas)', unit: 'un', price: 80.00, quantity: 0 },
                { id: 'dem_005', name: 'Picoteamento de reboco', unit: 'm²', price: 18.00, quantity: 0 },
                { id: 'dem_006', name: 'Retirada de louças e metais sanitários', unit: 'vb', price: 150.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_mov_terra',
            name: '3. MOVIMENTAÇÃO DE TERRA',
            items: [
                { id: 'mov_001', name: 'Escavação manual de valas (até 1.5m)', unit: 'm³', price: 90.00, quantity: 0 },
                { id: 'mov_002', name: 'Escavação mecanizada de valas', unit: 'm³', price: 15.00, quantity: 0 },
                { id: 'mov_003', name: 'Reaterro manual apiloado', unit: 'm³', price: 45.00, quantity: 0 },
                { id: 'mov_004', name: 'Aterro com material importado (bota-dentro)', unit: 'm³', price: 110.00, quantity: 0 },
                { id: 'mov_005', name: 'Compactação de aterro mecanizada (sapo)', unit: 'm³', price: 25.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_fundacoes',
            name: '4. INFRAESTRUTURA / FUNDAÇÕES',
            items: [
                { id: 'fun_001', name: 'Estaca Broca (trado manual) D=25cm', unit: 'm', price: 85.00, quantity: 0 },
                { id: 'fun_002', name: 'Estaca Escavada mecanizada D=30cm', unit: 'm', price: 110.00, quantity: 0 },
                { id: 'fun_003', name: 'Concreto para sapatas FCK 25MPa', unit: 'm³', price: 750.00, quantity: 0 },
                { id: 'fun_004', name: 'Armação de aço CA-50 para fundações', unit: 'kg', price: 18.00, quantity: 0 },
                { id: 'fun_005', name: 'Viga Baldrame (forma + armação + concreto)', unit: 'm³', price: 2200.00, quantity: 0 },
                { id: 'fun_006', name: 'Lastro de concreto magro 5cm', unit: 'm²', price: 45.00, quantity: 0 },
                { id: 'fun_007', name: 'Impermeabilização de baldrame (tinta betuminosa)', unit: 'm²', price: 35.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_estrutura',
            name: '5. SUPERESTRUTURA',
            items: [
                { id: 'est_001', name: 'Pilar em Concreto Armado (Completo)', unit: 'm³', price: 3500.00, quantity: 0 },
                { id: 'est_002', name: 'Viga em Concreto Armado (Completo)', unit: 'm³', price: 3200.00, quantity: 0 },
                { id: 'est_003', name: 'Laje Pré-moldada Treliçada H=12cm (isopor)', unit: 'm²', price: 160.00, quantity: 0 },
                { id: 'est_004', name: 'Laje Maciça (forma + armação + concreto)', unit: 'm³', price: 2800.00, quantity: 0 },
                { id: 'est_005', name: 'Concreto Usinado FCK 25MPa (Bombeado)', unit: 'm³', price: 550.00, quantity: 0 },
                { id: 'est_006', name: 'Escada de Concreto Armado', unit: 'm³', price: 4200.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_paredes',
            name: '6. PAREDES E PAINÉIS',
            items: [
                { id: 'par_001', name: 'Alvenaria Bloco Cerâmico 14x19x29 (vedação)', unit: 'm²', price: 110.00, quantity: 0 },
                { id: 'par_002', name: 'Alvenaria Bloco Estrutural 14x19x29', unit: 'm²', price: 145.00, quantity: 0 },
                { id: 'par_003', name: 'Alvenaria Tijolinho Comum (aparente)', unit: 'm²', price: 180.00, quantity: 0 },
                { id: 'par_004', name: 'Parede Drywall Standard (ST) - Simples', unit: 'm²', price: 120.00, quantity: 0 },
                { id: 'par_005', name: 'Parede Drywall Resistente Umidade (RU) - Verde', unit: 'm²', price: 150.00, quantity: 0 },
                { id: 'par_006', name: 'Vergas e Contravergas pré-moldadas', unit: 'm', price: 45.00, quantity: 0 },
                { id: 'par_007', name: 'Divisória Naval / Eucatex', unit: 'm²', price: 95.00, quantity: 0 },
                { id: 'par_008', name: 'Cobogó de concreto / cerâmico', unit: 'm²', price: 320.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_estrutura_metalica_madeira',
            name: '7. ESTRUTURAS METÁLICAS E MADEIRA',
            items: [
                { id: 'met_001', name: 'Estrutura aço galvanizado para telhado', unit: 'kg', price: 22.00, quantity: 0 },
                { id: 'met_002', name: 'Estrutura madeira de lei para telhado', unit: 'm²', price: 140.00, quantity: 0 },
                { id: 'met_003', name: 'Mezanino Metálico (Vigas I/W)', unit: 'kg', price: 28.00, quantity: 0 },
                { id: 'met_004', name: 'Pergolado de Madeira (Eucalipto tratado)', unit: 'm²', price: 350.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_cobertura',
            name: '8. COBERTURA E TELHADO',
            items: [
                { id: 'cob_001', name: 'Telhamento com telha cerâmica tipo portuguesa', unit: 'm²', price: 95.00, quantity: 0 },
                { id: 'cob_002', name: 'Telhamento com telha de fibrocimento 6mm', unit: 'm²', price: 65.00, quantity: 0 },
                { id: 'cob_003', name: 'Telha metálica termoacústica (Sanduíche) 30mm', unit: 'm²', price: 240.00, quantity: 0 },
                { id: 'cob_004', name: 'Calha em chapa galvanizada (corte 33)', unit: 'm', price: 90.00, quantity: 0 },
                { id: 'cob_005', name: 'Rufo pingadeira em chapa galvanizada', unit: 'm', price: 65.00, quantity: 0 },
                { id: 'cob_006', name: 'Manta térmica subcobertura (alumínio)', unit: 'm²', price: 25.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_impermeabilizacao',
            name: '9. IMPERMEABILIZAÇÃO',
            items: [
                { id: 'imp_001', name: 'Manta asfáltica aluminizada 3mm (lajes expostas)', unit: 'm²', price: 140.00, quantity: 0 },
                { id: 'imp_002', name: 'Argamassa polimérica (banheiros/cozinhas)', unit: 'm²', price: 55.00, quantity: 0 },
                { id: 'imp_003', name: 'Manta líquida acrílica (3 demãos)', unit: 'm²', price: 65.00, quantity: 0 },
                { id: 'imp_004', name: 'Proteção mecânica sobre impermeabilização', unit: 'm²', price: 40.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_revest_parede',
            name: '10. REVESTIMENTOS DE PAREDE',
            items: [
                { id: 'rev_p_001', name: 'Chapisco rolaso ou convencional', unit: 'm²', price: 12.00, quantity: 0 },
                { id: 'rev_p_002', name: 'Emboço/Reboco (massa única) interno', unit: 'm²', price: 48.00, quantity: 0 },
                { id: 'rev_p_003', name: 'Reboco externo (com impermeabilizante)', unit: 'm²', price: 55.00, quantity: 0 },
                { id: 'rev_p_004', name: 'Azulejo/Cerâmica branca padrão médio', unit: 'm²', price: 120.00, quantity: 0 },
                { id: 'rev_p_005', name: 'Porcelanato Polido (parede/banheiro)', unit: 'm²', price: 210.00, quantity: 0 },
                { id: 'rev_p_006', name: 'Pastilha de vidro/cerâmica', unit: 'm²', price: 350.00, quantity: 0 },
                { id: 'rev_p_007', name: 'Gesso liso direto na alvenaria', unit: 'm²', price: 45.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_forros',
            name: '11. FORROS',
            items: [
                { id: 'for_001', name: 'Forro de Gesso Acartonado (Plaquinha)', unit: 'm²', price: 65.00, quantity: 0 },
                { id: 'for_002', name: 'Forro de Gesso Estruturado (Drywall) C/ Tabica', unit: 'm²', price: 110.00, quantity: 0 },
                { id: 'for_003', name: 'Forro de PVC branco liso', unit: 'm²', price: 75.00, quantity: 0 },
                { id: 'for_004', name: 'Sanca de gesso aberta (iluminação indireta)', unit: 'm', price: 85.00, quantity: 0 },
                { id: 'for_005', name: 'Moldura de gesso (rodateto) 15cm', unit: 'm', price: 25.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_pisos',
            name: '12. PISOS E RODAPÉS',
            items: [
                { id: 'pis_001', name: 'Contrapiso argamassa farofa (4cm)', unit: 'm²', price: 45.00, quantity: 0 },
                { id: 'pis_002', name: 'Regularização autonivelante', unit: 'm²', price: 65.00, quantity: 0 },
                { id: 'pis_003', name: 'Piso Cerâmico PEI-4 (médio)', unit: 'm²', price: 110.00, quantity: 0 },
                { id: 'pis_004', name: 'Porcelanato Polido/Acetinado 80x80', unit: 'm²', price: 240.00, quantity: 0 },
                { id: 'pis_005', name: 'Piso Vinílico LVT Colado (Régua)', unit: 'm²', price: 160.00, quantity: 0 },
                { id: 'pis_006', name: 'Piso Laminado Durafloor/Eucafloor', unit: 'm²', price: 110.00, quantity: 0 },
                { id: 'pis_007', name: 'Piso Cimento Queimado', unit: 'm²', price: 85.00, quantity: 0 },
                { id: 'pis_008', name: 'Piso Intertravado de Concreto (Paver) 6cm', unit: 'm²', price: 105.00, quantity: 0 },
                { id: 'pis_009', name: 'Rodapé Poliestireno (Santa Luzia) 10cm', unit: 'm', price: 55.00, quantity: 0 },
                { id: 'pis_010', name: 'Rodapé Cerâmico/Porcelanato', unit: 'm', price: 35.00, quantity: 0 },
                { id: 'pis_011', name: 'Soleira de Granito (largura 15cm)', unit: 'm', price: 120.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_esquadrias',
            name: '13. ESQUADRIAS E VIDROS',
            items: [
                { id: 'esq_001', name: 'Porta de Madeira Lisa (Kit Completo) - 80cm', unit: 'un', price: 1100.00, quantity: 0 },
                { id: 'esq_002', name: 'Porta de Madeira Maciça (Entrada)', unit: 'un', price: 2500.00, quantity: 0 },
                { id: 'esq_003', name: 'Porta de Alumínio Veneziana', unit: 'un', price: 1800.00, quantity: 0 },
                { id: 'esq_004', name: 'Janela de Correr Vidro Temperado 8mm (Blindex)', unit: 'm²', price: 650.00, quantity: 0 },
                { id: 'esq_005', name: 'Janela em Alumínio Branco suprema c/ vidro', unit: 'm²', price: 950.00, quantity: 0 },
                { id: 'esq_006', name: 'Box de Banheiro Vidro Temperado Incolor', unit: 'm²', price: 450.00, quantity: 0 },
                { id: 'esq_007', name: 'Espelhos Lapidados 4mm', unit: 'm²', price: 550.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_eletrica',
            name: '14. INSTALAÇÕES ELÉTRICAS',
            items: [
                { id: 'ele_001', name: 'Ponto de Luz no Teto (Caixa + Eletroduto + Fiação)', unit: 'pt', price: 180.00, quantity: 0 },
                { id: 'ele_002', name: 'Ponto de Tomada Baixa/Média/Alta', unit: 'pt', price: 195.00, quantity: 0 },
                { id: 'ele_003', name: 'Interruptor Simples (Módulo + Placa)', unit: 'un', price: 45.00, quantity: 0 },
                { id: 'ele_004', name: 'Tomada 10A/20A (Módulo + Placa)', unit: 'un', price: 35.00, quantity: 0 },
                { id: 'ele_005', name: 'Quadro de Distribuição 24 disjuntores (Instalado)', unit: 'un', price: 1200.00, quantity: 0 },
                { id: 'ele_006', name: 'Disjuntor Monopolar DIN (10 a 32A)', unit: 'un', price: 35.00, quantity: 0 },
                { id: 'ele_007', name: 'Disjuntor Bipolar DIN', unit: 'un', price: 85.00, quantity: 0 },
                { id: 'ele_008', name: 'Dispositivo DR (Diferencial Residual)', unit: 'un', price: 210.00, quantity: 0 },
                { id: 'ele_009', name: 'Padrão de Entrada Energia Bifásico (Completo)', unit: 'un', price: 2200.00, quantity: 0 },
                { id: 'ele_010', name: 'Luminária Plafon LED 18/24W Sobrepor/Embutir', unit: 'un', price: 85.00, quantity: 0 },
                { id: 'ele_011', name: 'Fita LED com fonte (metro)', unit: 'm', price: 55.00, quantity: 0 },
                { id: 'ele_012', name: 'Cabeamento estruturado Rede/TV (Cat6)', unit: 'pt', price: 250.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_hidraulica',
            name: '15. INSTALAÇÕES HIDRÁULICAS',
            items: [
                { id: 'hid_001', name: 'Ponto de Água Fria PVC Soldável', unit: 'pt', price: 210.00, quantity: 0 },
                { id: 'hid_002', name: 'Ponto de Água Quente CPVC ou PPR', unit: 'pt', price: 350.00, quantity: 0 },
                { id: 'hid_003', name: 'Ponto de Esgoto Secundário 40/50mm', unit: 'pt', price: 180.00, quantity: 0 },
                { id: 'hid_004', name: 'Ponto de Esgoto Primário 100mm (Vaso)', unit: 'pt', price: 280.00, quantity: 0 },
                { id: 'hid_005', name: 'Caixa Sifonada 150x150x50', unit: 'un', price: 85.00, quantity: 0 },
                { id: 'hid_006', name: 'Caixa de Gordura PVC', unit: 'un', price: 420.00, quantity: 0 },
                { id: 'hid_007', name: 'Caixa D\'água Polietileno 1000L Instalação', unit: 'un', price: 950.00, quantity: 0 },
                { id: 'hid_008', name: 'Registro de Pressão com Acabamento', unit: 'un', price: 180.00, quantity: 0 },
                { id: 'hid_009', name: 'Tubulação de águas pluviais 100mm', unit: 'm', price: 65.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_loucas',
            name: '16. LOUÇAS E METAIS',
            items: [
                { id: 'lou_001', name: 'Vaso Sanitário com Caixa Acoplada (Linha média)', unit: 'un', price: 850.00, quantity: 0 },
                { id: 'lou_002', name: 'Assento Sanitário Soft Close', unit: 'un', price: 120.00, quantity: 0 },
                { id: 'lou_003', name: 'Cuba de Apoio para Banheiro', unit: 'un', price: 450.00, quantity: 0 },
                { id: 'lou_004', name: 'Torneira de Mesa Bica Alta (Banheiro)', unit: 'un', price: 320.00, quantity: 0 },
                { id: 'lou_005', name: 'Misturador Monocomando Cozinha', unit: 'un', price: 550.00, quantity: 0 },
                { id: 'lou_006', name: 'Tanque de Lavar Roupa (Louça/Inox/Sintético)', unit: 'un', price: 450.00, quantity: 0 },
                { id: 'lou_007', name: 'Kit Acessórios Banheiro 5 peças (Metal)', unit: 'jg', price: 280.00, quantity: 0 },
                { id: 'lou_008', name: 'Chuveiro Elétrico 7500W', unit: 'un', price: 220.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_pintura',
            name: '17. PINTURA',
            items: [
                { id: 'pin_001', name: 'Aplicação de Selador Acrílico', unit: 'm²', price: 8.00, quantity: 0 },
                { id: 'pin_002', name: 'Aplicação de Massa Corrida (2 demãos)', unit: 'm²', price: 28.00, quantity: 0 },
                { id: 'pin_003', name: 'Aplicação de Massa Acrílica (áreas externas)', unit: 'm²', price: 35.00, quantity: 0 },
                { id: 'pin_004', name: 'Pintura Látex Acrílico Fosco (2 demãos) - Paredes', unit: 'm²', price: 28.00, quantity: 0 },
                { id: 'pin_005', name: 'Pintura Teto Látex PVA (2 demãos)', unit: 'm²', price: 25.00, quantity: 0 },
                { id: 'pin_006', name: 'Textura Rústica / Grafiato (Hidrorrepelente)', unit: 'm²', price: 42.00, quantity: 0 },
                { id: 'pin_007', name: 'Pintura Esmalte em Portas e Batentes', unit: 'm²', price: 55.00, quantity: 0 },
                { id: 'pin_008', name: 'Verniz em Madeira (3 demãos)', unit: 'm²', price: 45.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_servicos_finais',
            name: '18. SERVIÇOS FINAIS / DIVERSOS',
            items: [
                { id: 'fin_001', name: 'Limpeza Final de Obra (Fina)', unit: 'm²', price: 25.00, quantity: 0 },
                { id: 'fin_002', name: 'Verba para Jardinagem e Paisagismo', unit: 'vb', price: 2500.00, quantity: 0 },
                { id: 'fin_003', name: 'Bancada de Granito/Mármore (Cozinha/Banheiro)', unit: 'm²', price: 1200.00, quantity: 0 },
                { id: 'fin_004', name: 'Administração de Obra local (Mensal)', unit: 'mes', price: 3500.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_pavimentacao',
            name: '19. PAVIMENTAÇÃO E CALÇAMENTO',
            items: [
                { id: 'sic_pav_001', name: 'Pavimentação em paralelepípedo sobre colchão de areia', unit: 'm²', price: 85.40, quantity: 0 },
                { id: 'sic_pav_002', name: 'Pavimentação em bloco de concreto sextavado (bloquete)', unit: 'm²', price: 72.80, quantity: 0 },
                { id: 'sic_pav_003', name: 'Piso tátil de concreto direcional/alerta (40x40cm)', unit: 'm²', price: 95.00, quantity: 0 },
                { id: 'sic_pav_004', name: 'Meio-fio de concreto moldado in loco (extrusado)', unit: 'm', price: 35.00, quantity: 0 },
                { id: 'sic_pav_005', name: 'Execução de passeio em concreto desempolado esp. 6cm', unit: 'm²', price: 58.00, quantity: 0 },
                { id: 'sic_pav_006', name: 'Pavimento asfáltico CBUQ (Capa + Binder) esp. 5cm', unit: 'm²', price: 110.00, quantity: 0 },
                { id: 'sic_pav_007', name: 'Imprimação asfáltica com CM-30 (Ligante)', unit: 'm²', price: 12.50, quantity: 0 },
                { id: 'sic_pav_008', name: 'Pintura de ligação com emulsão asfáltica RR-1C', unit: 'm²', price: 4.50, quantity: 0 },
                { id: 'sic_pav_009', name: 'Piso intertravado de concreto (Paver) 8cm - Tráfego Pesado', unit: 'm²', price: 118.00, quantity: 0 },
                { id: 'sic_pav_010', name: 'Piso intertravado de concreto (Paver) 6cm - Tráfego Leve', unit: 'm²', price: 98.00, quantity: 0 },
                { id: 'sic_pav_011', name: 'Base de brita graduada simples (BGS)', unit: 'm³', price: 145.00, quantity: 0 },
                { id: 'sic_pav_012', name: 'Sub-base de solo estabilizado granulometricamente', unit: 'm³', price: 65.00, quantity: 0 },
                { id: 'sic_pav_013', name: 'Guia (meio-fio) reta de concreto pré-moldado', unit: 'm', price: 42.00, quantity: 0 },
                { id: 'sic_pav_014', name: 'Guia (meio-fio) curva de concreto pré-moldado', unit: 'm', price: 48.00, quantity: 0 },
                { id: 'sic_pav_015', name: 'Sarjeta de concreto moldada in loco (30cm largura)', unit: 'm', price: 45.00, quantity: 0 },
                { id: 'sic_pav_016', name: 'Piso grama (concregrama) esp. 8cm', unit: 'm²', price: 85.00, quantity: 0 },
                { id: 'sic_pav_017', name: 'Regularização e compactação de subleito', unit: 'm²', price: 8.50, quantity: 0 },
                { id: 'sic_pav_018', name: 'Demolição mecânica de pavimento asfáltico', unit: 'm³', price: 45.00, quantity: 0 },
                { id: 'sic_pav_019', name: 'Remoção de paralelepípedos manual', unit: 'm²', price: 18.00, quantity: 0 },
                { id: 'sic_pav_020', name: 'Colchão de areia para pavimentação (esp. 5cm)', unit: 'm²', price: 15.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_drenagem',
            name: '20. DRENAGEM PLUVIAL EXTERNA',
            items: [
                { id: 'sic_dre_001', name: 'Tubo de concreto armado PA-1, diâmetro 400mm', unit: 'm', price: 145.00, quantity: 0 },
                { id: 'sic_dre_002', name: 'Tubo de concreto armado PA-1, diâmetro 600mm', unit: 'm', price: 210.00, quantity: 0 },
                { id: 'sic_dre_003', name: 'Tubo de concreto armado PA-1, diâmetro 800mm', unit: 'm', price: 340.00, quantity: 0 },
                { id: 'sic_dre_004', name: 'Tubo de concreto armado PA-1, diâmetro 1000mm', unit: 'm', price: 480.00, quantity: 0 },
                { id: 'sic_dre_005', name: 'Tubo de concreto simples PS-1, diâmetro 200mm', unit: 'm', price: 45.00, quantity: 0 },
                { id: 'sic_dre_006', name: 'Tubo de concreto simples PS-1, diâmetro 300mm', unit: 'm', price: 68.00, quantity: 0 },
                { id: 'sic_dre_007', name: 'Boca de lobo simples em alvenaria e concreto', unit: 'un', price: 850.00, quantity: 0 },
                { id: 'sic_dre_008', name: 'Boca de lobo dupla combinada', unit: 'un', price: 1450.00, quantity: 0 },
                { id: 'sic_dre_009', name: 'Grelha de ferro fundido para boca de lobo (70x30)', unit: 'un', price: 320.00, quantity: 0 },
                { id: 'sic_dre_010', name: 'Poço de visita (bueiro) em anéis de concreto D=1.00m (até 1.5m)', unit: 'un', price: 1800.00, quantity: 0 },
                { id: 'sic_dre_011', name: 'Poço de visita (bueiro) em anéis de concreto D=1.20m (até 2.5m)', unit: 'un', price: 2800.00, quantity: 0 },
                { id: 'sic_dre_012', name: 'Tampão circular de ferro fundido D=600mm - Tráfego Pesado', unit: 'un', price: 550.00, quantity: 0 },
                { id: 'sic_dre_013', name: 'Sarjeta triangular de concreto (drenagem superficial)', unit: 'm', price: 65.00, quantity: 0 },
                { id: 'sic_dre_014', name: 'Canaleta retangular de concreto com grelha (20x20)', unit: 'm', price: 120.00, quantity: 0 },
                { id: 'sic_dre_015', name: 'Caixa de passagem em alvenaria 60x60cm', unit: 'un', price: 450.00, quantity: 0 },
                { id: 'sic_dre_016', name: 'Dissipador de energia em concreto armado', unit: 'm³', price: 1200.00, quantity: 0 },
                { id: 'sic_dre_017', name: 'Dreno profundo com tubo PEAD corrugado 100mm', unit: 'm', price: 85.00, quantity: 0 },
                { id: 'sic_dre_018', name: 'Manta geotêxtil não-tecido (Bidim)', unit: 'm²', price: 12.00, quantity: 0 },
                { id: 'sic_dre_019', name: 'Lastro de brita para tubulação', unit: 'm³', price: 130.00, quantity: 0 },
                { id: 'sic_dre_020', name: 'Reaterro compactado de valas de drenagem', unit: 'm³', price: 35.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_cercamentos',
            name: '21. CERCAMENTOS E FECHAMENTOS',
            items: [
                { id: 'sic_cer_001', name: 'Cerca de arame farpado com mourões de concreto curva', unit: 'm', price: 45.00, quantity: 0 },
                { id: 'sic_cer_002', name: 'Alambrado com tela de arame galvanizado revestido PVC', unit: 'm²', price: 88.00, quantity: 0 },
                { id: 'sic_cer_003', name: 'Gradil eletrofudido (tipo Nylofor) malha 5x20cm', unit: 'm²', price: 150.00, quantity: 0 },
                { id: 'sic_cer_004', name: 'Portão metálico de abrir com tela de arame', unit: 'm²', price: 280.00, quantity: 0 },
                { id: 'sic_cer_005', name: 'Gabião tipo caixa (1,0x1,0) para muro de arrimo', unit: 'm³', price: 450.00, quantity: 0 },
                { id: 'sic_cer_006', name: 'Gabião tipo colchão Reno (esp 0.30m)', unit: 'm³', price: 520.00, quantity: 0 },
                { id: 'sic_cer_007', name: 'Muro pré-moldado de concreto placas (h=2.00m)', unit: 'm', price: 220.00, quantity: 0 },
                { id: 'sic_cer_008', name: 'Concetina dupla clipada 45cm', unit: 'm', price: 65.00, quantity: 0 },
                { id: 'sic_cer_009', name: 'Cerca de madeira rústica (tipo rancho)', unit: 'm', price: 85.00, quantity: 0 },
                { id: 'sic_cer_010', name: 'Portão de ferro basculante para veículos', unit: 'm²', price: 450.00, quantity: 0 },
                { id: 'sic_cer_011', name: 'Portão social de chapa/grade', unit: 'un', price: 850.00, quantity: 0 },
                { id: 'sic_cer_012', name: 'Mourão de concreto seção quadrada 15x15cm', unit: 'un', price: 65.00, quantity: 0 },
                { id: 'sic_cer_013', name: 'Tela de arame galvanizado malha 2" fio 12', unit: 'm²', price: 22.00, quantity: 0 },
                { id: 'sic_cer_014', name: 'Arame farpado fio 16 (rolo 500m)', unit: 'un', price: 450.00, quantity: 0 },
                { id: 'sic_cer_015', name: 'Muro de alvenaria de bloco de concreto (rebocado e pintado)', unit: 'm²', price: 180.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_sinalizacao',
            name: '23. SINALIZAÇÃO VIÁRIA',
            items: [
                { id: 'sic_sin_001', name: 'Pintura de faixa de sinalização horizontal (tinta acrílica base água)', unit: 'm²', price: 35.00, quantity: 0 },
                { id: 'sic_sin_002', name: 'Pintura de setas e legendas no solo', unit: 'm²', price: 45.00, quantity: 0 },
                { id: 'sic_sin_003', name: 'Placa de regulamentação octogonal (pare) refletiva', unit: 'un', price: 280.00, quantity: 0 },
                { id: 'sic_sin_004', name: 'Placa de advertência (losango) refletiva', unit: 'un', price: 260.00, quantity: 0 },
                { id: 'sic_sin_005', name: 'Placa de identificação de logradouro (nome rua)', unit: 'un', price: 350.00, quantity: 0 },
                { id: 'sic_sin_006', name: 'Tachão refletivo bidirecional (tartaruga)', unit: 'un', price: 45.00, quantity: 0 },
                { id: 'sic_sin_007', name: 'Tacha refletiva monodirecional (taxinha)', unit: 'un', price: 18.00, quantity: 0 },
                { id: 'sic_sin_008', name: 'Lombada física em asfalto (quebra-molas) padrão CONTRAN', unit: 'm³', price: 650.00, quantity: 0 },
                { id: 'sic_sin_009', name: 'Pintura zebrada de obstáculo (amarelo/preto)', unit: 'm²', price: 38.00, quantity: 0 },
                { id: 'sic_sin_010', name: 'Defensa metálica maleável semimaleável (Guard-rail)', unit: 'm', price: 320.00, quantity: 0 }
            ]
        },
        {
            id: 'cat_paisagismo',
            name: '24. PAISAGISMO E URBANISMO',
            items: [
                { id: 'sic_pai_001', name: 'Plantio de grama esmeralda em placas', unit: 'm²', price: 18.00, quantity: 0 },
                { id: 'sic_pai_002', name: 'Plantio de grama batatais em leivas', unit: 'm²', price: 12.00, quantity: 0 },
                { id: 'sic_pai_003', name: 'Plantio de árvore ornamental (Mudas h=1.5m)', unit: 'un', price: 85.00, quantity: 0 },
                { id: 'sic_pai_004', name: 'Plantio de arbustos ornamentais', unit: 'un', price: 35.00, quantity: 0 },
                { id: 'sic_pai_005', name: 'Terra vegetal preta adubada (espalhamento)', unit: 'm³', price: 120.00, quantity: 0 },
                { id: 'sic_pai_006', name: 'Banco de concreto aparente com encosto (jardim)', unit: 'un', price: 450.00, quantity: 0 },
                { id: 'sic_pai_007', name: 'Lixeira metálica com suporte (padrão urbano)', unit: 'un', price: 280.00, quantity: 0 },
                { id: 'sic_pai_008', name: 'Bicicletário em tubo galvanizado (p/ 5 bikes)', unit: 'un', price: 650.00, quantity: 0 },
                { id: 'sic_pai_009', name: 'Pérgola de eucalipto tratado (estrutura)', unit: 'm²', price: 250.00, quantity: 0 },
                { id: 'sic_pai_010', name: 'Iluminação de jardim tipo espeto LED', unit: 'un', price: 65.00, quantity: 0 },
                { id: 'sic_pai_011', name: 'Hidrossemeadura para proteção de taludes', unit: 'm²', price: 6.50, quantity: 0 }
            ]
        }
    ]
};

export const DEFAULT_BOQ_CATEGORIES = BOQ_TEMPLATES.obra_nova;


// --- GAMIFICATION / PRICING CONSTANTS ---

export const LEAD_PRICES = {
    STANDARD: 75,
    HIGH_VALUE: 150,
    THRESHOLD: 50000 // R$ 50.000,00
};

export function getLeadPrice(totalValue: number): number {
    return totalValue >= LEAD_PRICES.THRESHOLD ? LEAD_PRICES.HIGH_VALUE : LEAD_PRICES.STANDARD;
}
