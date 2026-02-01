'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Download, CheckCircle, Map as MapIcon, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseKMZ, processMemorialData, MemorialData, ddToDms } from '@/lib/memorial-utils';
import { SelectionList } from '@/components/SelectionList';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { RefreshCcw, RotateCw } from 'lucide-react';

export default function MemorialPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<MemorialData | null>(null);

    // Form fields
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [startPoint, setStartPoint] = useState('A1');
    const [isClockwise, setIsClockwise] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.name.toLowerCase().endsWith('.kmz')) {
                setError('Por favor, envie um arquivo .KMZ válido.');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setData(null);
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            const polygon = await parseKMZ(file);
            const result = processMemorialData(polygon, 0, isClockwise);
            setData(result);

            // Simulating auto-detect (placeholder) or could use simple logic if we had maps
            // defaulting to empty for user to fill
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao processar o arquivo. Verifique se é um KMZ válido exportado do Google Earth.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateMemorialText = () => {
        if (!data) return '';

        const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

        let text = `MEMORIAL DESCRITIVO\n\n`;
        text += `IMÓVEL: Terreno Urbano\n`;
        text += `MUNICÍPIO: ${city || '________________'} - ${state || '___'}\n`;
        text += `ÁREA: ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.area)} m²\n`;
        text += `PERÍMETRO: ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.perimeter)} m\n\n`;
        text += `DESCRIÇÃO PERIMÉTRICA:\n\n`;

        // Build the main text
        const firstPoint = data.points[0];

        text += `Inicia-se a descrição deste perímetro no vértice ${firstPoint.id}, de coordenadas N=${firstPoint.n.toFixed(3)}m e E=${firstPoint.e.toFixed(3)}m, situado no limite com Via Pública (ou definir confrontante).\n\n`; // Assuming A1 is on street as requested

        data.segments.forEach((seg, index) => {
            const destPoint = data.points[(index + 1) % data.points.length];
            text += `Deste, segue confrontando com ${seg.confrontante}, com azimute de ${seg.azimuth} e distância de ${seg.distance.toFixed(2)} m, até o vértice ${destPoint.id} (N=${destPoint.n.toFixed(3)}m e E=${destPoint.e.toFixed(3)}m).\n`;
        });

        text += `\nFechando-se assim o polígono acima descrito.\n`;
        text += `\nTodas as coordenadas estão georreferenciadas ao Sistema Geodésico Brasileiro, e encontram-se representadas no Sistema UTM, referenciadas ao Meridiano Central nº ___ (Zona ${data.utmZone}), tendo como datum o SIRGAS2000. Todos os azimutes e distâncias, área e perímetro foram calculados no plano de projeção UTM.\n\n`;

        text += `${city || 'Município'}, ${date}.\n\n`;
        text += `__________________________________________\nResponsável Técnico`;

        return text;
    };

    const downloadExcel = () => {
        if (!data) return;

        const wb = XLSX.utils.book_new();

        // Prepare data for sheet
        const tableData = data.segments.map(seg => ({
            'Ponto Inicial': seg.from,
            'Ponto Final': seg.to,
            'Azimute': seg.azimuth,
            'Distância (m)': parseFloat(seg.distance.toFixed(3)),
            'Norte (Y)': parseFloat(seg.startN.toFixed(3)),
            'Este (X)': parseFloat(seg.startE.toFixed(3)),
            'Confrontante': seg.confrontante
        }));

        // Add coordinates of the last point to close the table logically if needed, 
        // but standard segment table is usually enough. Often table includes coordinate columns for points.
        // Let's match requested columns: Trecho, Azimute, Distância (m), N Inicial, E Inicial, N Final, E Final

        const refinedData = data.segments.map(seg => ({
            'Trecho': `${seg.from}-${seg.to}`,
            'Azimute': seg.azimuth,
            'Distância (m)': parseFloat(seg.distance.toFixed(3)),
            'N Inicial': parseFloat(seg.startN.toFixed(3)),
            'E Inicial': parseFloat(seg.startE.toFixed(3)),
            'N Final': parseFloat(seg.endN.toFixed(3)),
            'E Final': parseFloat(seg.endE.toFixed(3))
        }));

        const ws = XLSX.utils.json_to_sheet(refinedData);
        XLSX.utils.book_append_sheet(wb, ws, "Tabela Perimétrica");
        XLSX.writeFile(wb, "memorial_descritivo.xlsx");
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#C2410C]/5 via-background to-[#C2410C]/5 border-b border-white/5 pt-16 pb-12 mb-40">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C2410C]/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#C2410C]/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <button
                            onClick={() => router.push('/')}
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#C2410C] transition-colors mb-6 text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Voltar para o Início
                        </button>
                        <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6 tracking-tight">
                            Memorial Descritivo de <span className="text-[#C2410C]">Topografia</span>
                        </h1>
                        <p className="text-xl font-manrope text-muted-foreground max-w-2xl mx-auto">
                            Envie o arquivo KMZ do Google Earth e a IA cria automaticamente o memorial descritivo técnico + planilha em Excel pronta para prefeitura e cartório.
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 pb-20">

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {/* Left Column: File Upload */}
                    <div className="md:col-span-1 space-y-6">
                        <SpotlightCard className="rounded-2xl shadow-xl p-6 border border-neutral-200 dark:border-white/10 sticky top-24" spotlightColor="rgba(194, 65, 12, 0.15)">
                            <h3 className="text-lg font-heading font-bold mb-4 text-foreground flex items-center gap-2">
                                <MapIcon size={20} className="text-[#C2410C]" />
                                Arquivo da Obra
                            </h3>

                            <div
                                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer group ${file ? 'border-[#C2410C]/50 bg-[#C2410C]/5' : 'border-neutral-200 dark:border-white/10 hover:border-[#C2410C] hover:bg-[#C2410C]/5'}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".kmz"
                                    className="hidden"
                                    aria-label="Upload KMZ"
                                    title="Upload KMZ a partir do Google Earth"
                                />

                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <CheckCircle className="h-8 w-8 text-[#C2410C] mb-2" />
                                        <h3 className="text-sm font-medium text-foreground break-all">{file.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Pronto para processar</p>
                                        <button
                                            className="mt-3 text-xs text-[#C2410C] font-bold hover:underline bg-[#C2410C]/10 px-2 py-1 rounded"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                                setData(null);
                                            }}
                                        >
                                            Trocar arquivo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-8 w-8 text-neutral-400 group-hover:text-[#C2410C] transition-colors mb-2" />
                                        <p className="text-sm font-medium text-foreground group-hover:text-[#C2410C] transition-colors">Upload KMZ</p>
                                        <p className="text-xs text-muted-foreground mt-1 text-center">
                                            Exporte do Google Earth
                                        </p>
                                    </div>
                                )}
                            </div>
                        </SpotlightCard>
                    </div>

                    {/* Right Column: Configuration Form */}
                    <div className="md:col-span-2">
                        <SpotlightCard className="rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-white/10" spotlightColor="rgba(194, 65, 12, 0.15)">
                            <h3 className="text-2xl font-bold mb-6 text-foreground font-heading">
                                Configurações do Documento
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-muted-foreground mb-1">Município</label>
                                        <input
                                            id="city"
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Ex: São Paulo"
                                            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/20 text-foreground shadow-sm focus:border-[#C2410C] focus:ring-[#C2410C] placeholder-muted-foreground py-3 px-4 resize-none focus:ring-1 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
                                        <input
                                            id="state"
                                            type="text"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            placeholder="Ex: SP"
                                            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/20 text-foreground shadow-sm focus:border-[#C2410C] focus:ring-[#C2410C] placeholder-muted-foreground py-3 px-4 resize-none focus:ring-1 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="coordinateSystem" className="block text-sm font-medium text-muted-foreground mb-1">Sistema de Coordenadas</label>
                                    <select
                                        id="coordinateSystem"
                                        disabled
                                        className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800/50 text-muted-foreground shadow-sm cursor-not-allowed py-3 px-4 outline-none opacity-70"
                                        aria-label="Sistema de Coordenadas"
                                    >
                                        <option>SIRGAS 2000 / UTM (Automático)</option>
                                    </select>
                                </div>

                                <div>
                                    <SelectionList
                                        label="Sentido do Perímetro"
                                        value={isClockwise ? 'horario' : 'anti'}
                                        onChange={(val) => setIsClockwise(val === 'horario')}
                                        options={[
                                            { value: 'horario', label: 'Horário (Padrão)', icon: <RotateCw size={18} /> },
                                            { value: 'anti', label: 'Anti-horário', icon: <RefreshCcw size={18} /> }
                                        ]}
                                    />
                                </div>

                                <button
                                    onClick={handleProcess}
                                    disabled={!file || isLoading}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-4
                                        ${!file ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed' :
                                            isLoading ? 'bg-[#C2410C]/80 cursor-wait' :
                                                'bg-[#C2410C] hover:bg-[#9A3412] hover:shadow-orange-500/20 active:scale-[0.98]'}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="h-5 w-5 animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-5 w-5" />
                                            Gerar Memorial Descritivo
                                        </>
                                    )}
                                </button>
                            </div>
                        </SpotlightCard>
                    </div>
                </div>

                {/* Results Section */}
                {data && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Memorial Text */}
                        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-[#C2410C]" />
                                    Memorial Descritivo
                                </h2>
                                <button
                                    onClick={() => navigator.clipboard.writeText(generateMemorialText())}
                                    className="text-sm font-medium text-[#C2410C] hover:bg-[#C2410C]/10 px-3 py-1.5 rounded-lg transition-colors border border-[#C2410C]/20"
                                >
                                    Copiar Texto
                                </button>
                            </div>

                            <div className="bg-muted/50 p-6 rounded-xl border border-border font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground max-h-[400px] overflow-y-auto custom-scrollbar">
                                {generateMemorialText()}
                            </div>
                        </div>

                        {/* Technical Table */}
                        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                                    <Download className="h-6 w-6 text-[#C2410C]" />
                                    Tabela Técnica
                                </h2>
                                <button
                                    onClick={downloadExcel}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#C2410C] text-white text-sm font-bold rounded-lg hover:bg-[#9A3412] transition-colors shadow-md"
                                >
                                    <Download className="h-4 w-4" />
                                    Baixar Excel (.xlsx)
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Trecho</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Azimute</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Distância (m)</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">N Inicial</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">E Inicial</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-border">
                                        {data.segments.map((seg, i) => (
                                            <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{seg.from}-{seg.to}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{seg.azimuth}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{seg.distance.toFixed(3)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{seg.startN.toFixed(3)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{seg.startE.toFixed(3)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Legal Disclaimer */}
                        <div className="text-center text-xs text-muted-foreground max-w-2xl mx-auto">
                            <p>Documento gerado automaticamente. Para uso oficial, recomenda-se a conferência e assinatura com ART ou RRT por profissional habilitado.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
