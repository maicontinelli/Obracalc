'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Loader2, ArrowLeft, CheckCircle2, RotateCw, Wrench, Hammer, Sparkles, Trophy, Zap, Droplets, User, UserCheck } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { SelectionList } from '@/components/SelectionList';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default function NovoDiagnostico() {
    const router = useRouter();
    const [step, setStep] = useState<'upload' | 'form'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Form fields com valores padrão
    const [formData, setFormData] = useState({
        objetivo: 'revitalizacao',
        padrao: 'basico',
        instalacoes: 'nao',
        ocupacao: 'desocupado',
        area: '12', // Área fixa padrão
        observacoes: ''
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920
            });

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setStep('form');
                setLoading(false);
            };
            reader.readAsDataURL(compressed);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!image) return;

        setLoading(true);

        try {
            console.log('📤 Enviando para análise...');
            const response = await fetch('/api/diagnostico-visual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image,
                    formData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Erro na API:', data);
                alert(data.error || 'Erro ao gerar diagnóstico. Tente novamente.');
                setLoading(false);
                return;
            }

            console.log('✅ Diagnóstico recebido:', data);

            // Save to localStorage and redirect to editor
            const diagnosticId = crypto.randomUUID();
            const diagnosticData = {
                id: diagnosticId,
                image,
                formData,
                resultado: data,
                createdAt: new Date().toISOString()
            };

            console.log('💾 Salvando diagnóstico:', diagnosticId);
            localStorage.setItem(`diagnostic_${diagnosticId}`, JSON.stringify(diagnosticData));

            // Verificar se salvou corretamente
            const saved = localStorage.getItem(`diagnostic_${diagnosticId}`);
            if (!saved) {
                console.error('❌ Falha ao salvar no localStorage');
                alert('Erro ao salvar diagnóstico. Tente novamente.');
                setLoading(false);
                return;
            }

            console.log('🚀 Redirecionando para editor...');
            router.push(`/editor-diagnostico/${diagnosticId}`);
        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            alert('Erro inesperado. Verifique sua conexão e tente novamente.');
            setLoading(false);
        }
    };

    // Verificar se há imagem pendente do upload da home
    useEffect(() => {
        const pendingImage = sessionStorage.getItem('pendingDiagnosticImage');
        if (pendingImage) {
            setImage(pendingImage);
            setStep('form');
            sessionStorage.removeItem('pendingDiagnosticImage');
        }
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0D9488]/5 via-background to-[#0D9488]/5 border-b border-white/5 pt-16 pb-12 mb-40">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0D9488]/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0D9488]/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <button
                            onClick={() => router.push('/')}
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#0D9488] transition-colors mb-6 text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Voltar para o Início
                        </button>
                        <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6 tracking-tight">
                            Diagnóstico Visual com <span className="text-[#0D9488]">IA</span>
                        </h1>
                        <p className="text-xl font-manrope text-muted-foreground max-w-2xl mx-auto">
                            Envie uma foto do ambiente e a IA analisará os problemas, sugerindo soluções técnicas e gerando um orçamento preliminar.
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 pb-20">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Image Upload */}
                    <div className="md:col-span-1 space-y-6">
                        <SpotlightCard className="rounded-2xl shadow-xl p-6 border border-neutral-200 dark:border-white/10 sticky top-24" spotlightColor="rgba(255, 102, 0, 0.15)">
                            <h3 className="text-lg font-heading font-bold mb-4 text-foreground flex items-center gap-2">
                                <Camera size={20} className="text-[#0D9488]" />
                                Foto do Ambiente
                            </h3>

                            {image ? (
                                <div className="space-y-4">
                                    <div className="relative rounded-lg overflow-hidden aspect-[3/4] border border-white/10 shadow-inner group">
                                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => setImage(null)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors transform hover:scale-110 shadow-lg"
                                                aria-label="Remover imagem"
                                                title="Remover imagem"
                                            >
                                                <Upload size={20} className="rotate-45" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-green-500 font-medium flex items-center justify-center gap-1 bg-green-500/10 py-2 rounded-lg">
                                        <CheckCircle2 size={14} />
                                        Imagem carregada com sucesso
                                    </p>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-neutral-200 dark:border-white/10 hover:border-[#0D9488] dark:hover:border-[#0D9488] hover:bg-[#0D9488]/5 rounded-xl p-8 text-center transition-all group cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                                    <div className="mb-4 p-4 bg-gray-50 dark:bg-white/5 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="h-8 w-8 text-gray-400 group-hover:text-[#0D9488] transition-colors" />
                                    </div>
                                    <h4 className="font-bold text-foreground mb-1">Upload da Foto</h4>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Arraste uma foto ou clique para selecionar
                                    </p>
                                    <label className="inline-block w-full py-3 bg-[#0D9488] hover:bg-[#CC5200] text-white rounded-xl cursor-pointer transition-colors text-sm font-bold shadow-lg shadow-teal-500/20">
                                        {loading ? (
                                            <Loader2 className="animate-spin mx-auto" size={18} />
                                        ) : (
                                            'Selecionar Foto'
                                        )}
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={loading}
                                        />
                                    </label>
                                </div>
                            )}
                        </SpotlightCard>
                    </div>

                    {/* Right Column: Form */}
                    <div className="md:col-span-2">
                        <SpotlightCard className="rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-white/10" spotlightColor="rgba(255, 102, 0, 0.15)">
                            <h3 className="text-2xl font-bold mb-6 text-foreground font-heading">
                                Conte-nos mais sobre o projeto
                            </h3>

                            <div className="space-y-6">
                                {/* Pergunta 1 */}
                                <div>
                                    <SelectionList
                                        label="1. Qual o objetivo da reforma?"
                                        value={formData.objetivo}
                                        onChange={(val) => setFormData({ ...formData, objetivo: val })}
                                        options={[
                                            { value: 'revitalizacao', label: 'Revitalização estética', icon: <Sparkles size={18} /> },
                                            { value: 'correcao', label: 'Correção de problemas', icon: <Wrench size={18} /> },
                                            { value: 'ampliacao', label: 'Ampliação/Modificação', icon: <Hammer size={18} /> },
                                            { value: 'modernizacao', label: 'Modernização', icon: <RotateCw size={18} /> }
                                        ]}
                                    />
                                </div>

                                {/* Pergunta 2 */}
                                <div>
                                    <SelectionList
                                        label="2. Qual padrão de acabamento desejado?"
                                        value={formData.padrao}
                                        onChange={(val) => setFormData({ ...formData, padrao: val })}
                                        options={[
                                            { value: 'basico', label: 'Básico', icon: <Trophy size={18} className="text-gray-400" /> },
                                            { value: 'medio', label: 'Médio', icon: <Trophy size={18} className="text-yellow-600" /> },
                                            { value: 'alto', label: 'Alto', icon: <Trophy size={18} className="text-yellow-400" /> },
                                            { value: 'luxo', label: 'Luxo', icon: <Sparkles size={18} className="text-purple-400" /> }
                                        ]}
                                    />
                                </div>

                                {/* Pergunta 3 */}
                                <div>
                                    <SelectionList
                                        label="3. Será necessário mexer em instalações?"
                                        value={formData.instalacoes}
                                        onChange={(val) => setFormData({ ...formData, instalacoes: val })}
                                        options={[
                                            { value: 'nao', label: 'Não será necessário', icon: <CheckCircle2 size={18} /> },
                                            { value: 'eletrica', label: 'Apenas elétrica', icon: <Zap size={18} /> },
                                            { value: 'hidraulica', label: 'Apenas hidráulica', icon: <Droplets size={18} /> },
                                            { value: 'ambas', label: 'Elétrica e Hidráulica', icon: <Wrench size={18} /> }
                                        ]}
                                    />
                                </div>

                                {/* Pergunta 4 */}
                                <div>
                                    <SelectionList
                                        label="4. O ambiente estará ocupado durante a obra?"
                                        value={formData.ocupacao}
                                        onChange={(val) => setFormData({ ...formData, ocupacao: val })}
                                        options={[
                                            { value: 'desocupado', label: 'Desocupado', icon: <UserCheck size={18} /> },
                                            { value: 'parcialmente', label: 'Parcialmente', icon: <User size={18} /> },
                                            { value: 'totalmente', label: 'Totalmente', icon: <User size={18} className="text-red-400" /> }
                                        ]}
                                    />
                                </div>

                                {/* Pergunta 5 - Área */}
                                <div>
                                    <label className="block text-base font-semibold mb-3 text-foreground">
                                        5. Qual a área aproximada do ambiente? (m²)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        placeholder="12"
                                        className="w-full px-4 py-3 text-base rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/20 text-foreground resize-none focus:ring-1 focus:ring-[#0D9488] focus:border-[#0D9488] placeholder-muted-foreground transition-all outline-none shadow-sm"
                                    />
                                </div>

                                {/* Observações */}
                                <div>
                                    <label className="block text-base font-semibold mb-3 text-foreground">
                                        Observações adicionais
                                        <span className="text-xs font-normal text-muted-foreground ml-2">(opcional)</span>
                                    </label>
                                    <textarea
                                        value={formData.observacoes}
                                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                        placeholder="Ex: Quero trocar essa janela por um blindex e pintar tudo de branco"
                                        rows={3}
                                        className="w-full px-4 py-3 text-base rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/20 text-foreground resize-none focus:ring-1 focus:ring-[#0D9488] focus:border-[#0D9488] placeholder-muted-foreground transition-all outline-none shadow-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !image}
                                className={`w-full mt-8 px-6 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg
                                    ${!image
                                        ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#0D9488] hover:bg-[#CC5200] text-white hover:shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99]'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Analisando...
                                    </>
                                ) : !image ? (
                                    <>
                                        <Camera size={20} />
                                        Envie uma foto para continuar
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        <span className="text-sm font-bold uppercase tracking-wide">Gerar Diagnóstico com IA</span>
                                    </>
                                )}
                            </button>
                        </SpotlightCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
