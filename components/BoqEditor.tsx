'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, FileText, Settings, ChevronDown, Sparkles, Loader2, Cloud, CloudOff, Check, AlertTriangle } from 'lucide-react';
import CommandSearch, { BoqItem } from './CommandSearch';
import { BOQ_TEMPLATES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

import { getDddInfo } from '@/lib/ddd-data';
import { useProfile } from '@/hooks/useProfile';
import { PLAN_LIMITS } from '@/lib/plan-limits';

// Categories that have been removed from the catalog and should be filtered out
const OBSOLETE_CATEGORIES = [
    '19. PAVIMENTAÇÃO E CALÇAMENTO',
    '20. DRENAGEM PLUVIAL EXTERNA',
    '21. CERCAMENTOS E FECHAMENTOS',
    '23. SINALIZAÇÃO VIÁRIA',
    '24. PAISAGISMO E URBANISMO'
].map(cat => cat.toUpperCase().trim().replace(/\s+/g, ' '));


const PriceInput = ({ value, onChange, className, ...props }: { value: number, onChange: (val: number) => void, className?: string } & React.InputHTMLAttributes<HTMLInputElement>) => {
    const [localValue, setLocalValue] = useState<string | null>(null);

    // Sync only when not editing (localValue is null)
    const displayValue = localValue !== null ? localValue : (value === 0 ? '0' : value.toString());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setLocalValue(raw);

        // Normalize decimal separator
        const normalized = raw.replace(',', '.');

        // Allow empty string to mean 0 temporarily
        if (normalized === '') {
            onChange(0);
            return;
        }

        // Only emit change if valid number
        // Check strict format to avoid partial jumps (e.g. "12." shouldn't trigger yet if strict, but parseFloat handles leading)
        const parsed = parseFloat(normalized);
        if (!isNaN(parsed)) {
            // We pass the parsed value but KEEP the localValue string for display
            onChange(parsed);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setLocalValue(null); // Revert to parent value on blur (formats it cleanly)
        props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setLocalValue(value === 0 ? '' : value.toString().replace('.', ',')); // Show friendly format on focus
        e.target.select();
        props.onFocus?.(e);
    };

    return (
        <input
            {...props}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className={className}
            placeholder={props.placeholder || "0,00"}
        />
    );
};

export default function BoqEditor({ estimateId }: { estimateId: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = (searchParams?.get('type') as 'obra_nova') || 'obra_nova';

    const supabase = createClient();
    const { profile, isLoading: isProfileLoading } = useProfile();
    const [user, setUser] = useState<User | null>(null);
    const [isCloudSynced, setIsCloudSynced] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [items, setItems] = useState<BoqItem[]>([]);
    const [bdi, setBdi] = useState(12);
    const [providerName, setProviderName] = useState('');
    const [clientName, setClientName] = useState('');
    const [projectType, setProjectType] = useState('');
    const [deadline, setDeadline] = useState('');
    const [providerPhone, setProviderPhone] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientDocument, setClientDocument] = useState(''); // New: CPF/CNPJ
    const [clientAddress, setClientAddress] = useState('');   // New: Endereço
    const [includeContract, setIncludeContract] = useState(false); // New: Toggle (Default Inactive)
    const [workCity, setWorkCity] = useState('');
    const [workState, setWorkState] = useState('');
    const [projectArea, setProjectArea] = useState<number>(0); // New: Area in m2
    const [projectDuration, setProjectDuration] = useState(1); // New: Duration in months
    const [status, setStatus] = useState<'parado' | 'andamento' | 'concluido' | 'draft'>('andamento');
    const [aiRequests, setAiRequests] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [budgetCount, setBudgetCount] = useState(0); // Track budget count for limits

    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [isManualCatalogExpanded, setIsManualCatalogExpanded] = useState(true);
    const [includeMaterials, setIncludeMaterials] = useState(true);

    const [defaultItems, setDefaultItems] = useState<BoqItem[]>([]);

    useEffect(() => {
        const fetchCatalog = async () => {
            const { getCatalogItems } = await import('@/lib/catalog-service');
            const catalog = await getCatalogItems();

            // Helper to normalize strings for comparison (remove extra spaces, casing)
            const normalizeCategory = (cat: string) => cat.toUpperCase().trim().replace(/\s+/g, ' ');

            const formattedItems = catalog.map(item => ({
                id: item.id,
                category: normalizeCategory(item.category),
                name: item.name,
                unit: item.unit,
                quantity: 0,
                price: item.price,
                materialPrice: item.materialPrice,
                laborPrice: item.laborPrice,
                included: false
            }));
            setDefaultItems(formattedItems);
        };
        fetchCatalog();
    }, []);

    // Auth & Limit Check
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { count } = await supabase
                    .from('budgets')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);
                setBudgetCount(count || 0);
            }
        };
        checkUser();
    }, []);

    // Force Dark Mode for Editor Page - REMOVED to allow theme toggling
    /* 
    useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
            document.documentElement.classList.remove('dark');
        };
    }, []);
    */

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            let dataToLoad = null;
            let fromCloud = false;

            // 1. Try Supabase first if logged in
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('budgets')
                        .select('content, updated_at')
                        .eq('id', estimateId)
                        .maybeSingle();

                    if (data && data.content) {
                        dataToLoad = data.content;
                        fromCloud = true;
                        setLastSaved(new Date(data.updated_at));
                        setIsCloudSynced(true);
                    }
                } catch (err) {
                    console.error("Error loading from cloud:", err);
                }
            }

            // 2. Fallback to LocalStorage if not in cloud
            if (!dataToLoad) {
                const localData = localStorage.getItem(`estimate_${estimateId}`);
                if (localData) {
                    dataToLoad = JSON.parse(localData);
                }
            }

            // 3. Apply Data
            let finalItems: BoqItem[] = [];

            if (dataToLoad) {
                try {
                    const parsed = dataToLoad;
                    let loadedItems = parsed.items || [];
                    const hasStructure = loadedItems.some((i: BoqItem) => i.category?.includes('ESTRUTURA') || i.category?.includes('Estrutura'));

                    if (loadedItems.length < 10 && !hasStructure) {
                        const mergedItems = [...defaultItems];
                        loadedItems.forEach((savedItem: BoqItem) => {
                            const index = mergedItems.findIndex(def => def.id === savedItem.id);
                            if (index !== -1) {
                                if (savedItem.quantity > 0 || savedItem.included) {
                                    mergedItems[index] = { ...mergedItems[index], ...savedItem };
                                }
                            } else if (savedItem.isCustom || savedItem.included) {
                                mergedItems.push(savedItem);
                            }
                        });
                        loadedItems = mergedItems;
                    }

                    // Filter out obsolete categories
                    const normalizeCategory = (cat: string) => cat.toUpperCase().trim().replace(/\s+/g, ' ');
                    loadedItems = loadedItems.filter((item: BoqItem) =>
                        !OBSOLETE_CATEGORIES.includes(normalizeCategory(item.category))
                    );

                    finalItems = loadedItems;
                    setItems(loadedItems);
                    setBdi(parsed.bdi || 12);
                    setProviderName(parsed.providerName || '');
                    setClientName(parsed.clientName || '');
                    setProjectType(parsed.projectType || '');
                    setDeadline(parsed.deadline || '');
                    setIncludeMaterials(parsed.includeMaterials !== undefined ? parsed.includeMaterials : true);
                    setProviderPhone(parsed.providerPhone || '');
                    setClientPhone(parsed.clientPhone || '');
                    setClientDocument(parsed.clientDocument || '');
                    setClientAddress(parsed.clientAddress || '');
                    setIncludeContract(parsed.includeContract !== undefined ? parsed.includeContract : false);
                    setWorkCity(parsed.workCity || '');
                    setWorkState(parsed.workState || '');
                    setProjectArea(parsed.projectArea || 0);
                    setProjectDuration(parsed.projectDuration || 1);
                    setStatus(parsed.status !== undefined ? parsed.status : (fromCloud ? 'andamento' : 'andamento'));
                    setAiRequests(parsed.aiRequests || []);
                } catch (e) {
                    console.error("Error parsing estimate:", e);
                    finalItems = defaultItems;
                    setItems(defaultItems);
                }
            } else {
                finalItems = defaultItems;
                setItems(defaultItems);
            }

            // Auto-fill Provider Info from User Profile if empty (New Budget Strategy)
            if (user && user.user_metadata) {
                // Prefer company name, fallback to full name
                const profileName = user.user_metadata.company_name || user.user_metadata.full_name;
                const profilePhone = user.user_metadata.phone;

                // Only overwrite if current state is empty (don't overwrite saved data)
                if (!providerName && !dataToLoad?.providerName && profileName) {
                    setProviderName(profileName);
                }
                if (!providerPhone && !dataToLoad?.providerPhone && profilePhone) {
                    setProviderPhone(profilePhone);
                }
            }

            // 4. Auto-expand
            const initialExpanded: Record<string, boolean> = {};
            finalItems.forEach((item: BoqItem) => {
                if (item.isCustom || (item.aiRequestId && item.included)) {
                    initialExpanded[item.category] = true;
                }
            });
            setExpandedCategories(prev => ({ ...prev, ...initialExpanded }));

            // 5. Handle Focus Item (from Homepage Search)
            if (dataToLoad?.focusItemId) {
                const targetId = dataToLoad.focusItemId;
                const targetItem = finalItems.find(i => i.id === targetId);

                if (targetItem) {
                    // Check if it's a standard cat in the manual section
                    const isStandardCategory = BOQ_TEMPLATES.obra_nova.some(c => c.name.toUpperCase() === targetItem.category);
                    if (isStandardCategory) {
                        setIsManualCatalogExpanded(true);
                    }

                    // Force Expand Category
                    setExpandedCategories(prev => ({
                        ...prev,
                        [targetItem.category]: true
                    }));

                    // Delay Scroll & Focus
                    setTimeout(() => {
                        const element = document.getElementById(`item-${targetId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('bg-blue-50/10'); // Pulse effect
                            setTimeout(() => element.classList.remove('bg-blue-50/10'), 2000);

                            const quantityInput = element.querySelector('input[type="number"]') as HTMLInputElement;
                            if (quantityInput) {
                                quantityInput.focus();
                                quantityInput.select();
                            }
                        }
                    }, 800); // 800ms to allow rendering and animation
                }
            }

            setIsLoaded(true);
        };

        if (defaultItems.length > 0 && (!isLoaded || user)) { // Reload if user changes (login) or if defaultItems become available
            loadData();
        }

    }, [estimateId, user, defaultItems]);

    // Save to localStorage ONLY (Cloud save will be manual)
    useEffect(() => {
        if (!isLoaded) return;

        const dataToSave = {
            id: estimateId,
            items,
            bdi,
            providerName,
            clientName,
            projectType,
            deadline,
            providerPhone,
            clientPhone,
            workCity,
            workState,
            updatedAt: new Date().toISOString(),
            includeMaterials, // Always save this state
            projectArea,
            aiRequests
        };

        // LocalStorage (Immediate & Cheap)
        localStorage.setItem(`estimate_${estimateId}`, JSON.stringify(dataToSave));

        // Update estimates list locally
        const estimatesList = JSON.parse(localStorage.getItem('estimates_list') || '[]');
        const existingIndex = estimatesList.findIndex((e: any) => e.id === estimateId);

        const listEntry = {
            id: estimateId,
            clientName: clientName || 'Novo Orçamento',
            updatedAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            estimatesList[existingIndex] = listEntry;
        } else {
            estimatesList.push(listEntry);
        }
        localStorage.setItem('estimates_list', JSON.stringify(estimatesList));

        // Note: Cloud save removed from here to reduce traffic. 
        // Will be triggered manually or on report generation.
        setIsCloudSynced(false);

    }, [estimateId, items, bdi, providerName, clientName, projectType, deadline, providerPhone, clientPhone, workCity, workState, includeMaterials, aiRequests, isLoaded]);



    // Handlers
    const toggleInclude = (id: string, forceState?: boolean) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const willBeIncluded = forceState !== undefined ? forceState : !item.included;

        // Count currently included items
        const currentCount = items.filter(i => i.included).length;

        // Check Plan Limits & Payment Status
        if (profile?.subscription_status === 'past_due') {
            alert('Acesso suspenso por falta de pagamento. Regularize sua assinatura no dashboard para adicionar mais itens.');
            window.open('/dashboard', '_blank');
            return;
        }

        const tier = profile?.tier || 'free';
        const limit = PLAN_LIMITS[tier].max_items_per_estimate;

        // If turning ON, and hitting limit
        if (willBeIncluded && !item.included && currentCount >= limit) {
            const message = tier === 'free'
                ? `Limite do Plano Grátis atingido! \n\nVocê só pode adicionar até ${limit} itens no plano gratuito.\n\nAssine o Plano Profissional para ilimitado.`
                : `Limite de itens atingido (${limit}).`;
            alert(message);
            if (tier === 'free') {
                // Open plans page in new tab or specific modal
                window.open('/planos', '_blank');
            }
            return;
        }

        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, included: willBeIncluded };
            }
            return item;
        }));
    };

    const handleQuantityChange = (id: string, value: string) => {
        const numValue = parseFloat(value);
        setItems(prev => prev.map(item => item.id === id ? { ...item, quantity: isNaN(numValue) ? 0 : numValue, included: true } : item));
    };

    const handlePriceChange = (id: string, value: string) => {
        const numValue = parseFloat(value);
        setItems(prev => prev.map(item => item.id === id ? { ...item, manualPrice: isNaN(numValue) ? 0 : numValue, included: true } : item));
    };

    const handleNameChange = (id: string, name: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, name, included: true } : item));
    };

    const handleUnitChange = (id: string, unit: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, unit, included: true } : item));
    };

    const handleDelete = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleDeleteCategory = (categoryName: string) => {
        if (confirm(`Tem certeza que deseja excluir todos os itens de "${categoryName}"?`)) {
            setItems(prev => prev.filter(item => item.category !== categoryName));
        }
    };

    const handleAddCustomItem = (category: string) => {
        const newId = crypto.randomUUID();
        const newItem: BoqItem = {
            id: newId,
            name: '',
            unit: 'un',
            quantity: 0,
            price: 0,
            category: category,
            included: true,
            isCustom: true
        };
        setItems([...items, newItem]);

        // Focus the new item after a short delay
        setTimeout(() => {
            const element = document.getElementById(`item-${newId}`);
            if (element) {
                const nameInput = element.querySelector('input[type="text"]') as HTMLInputElement;
                if (nameInput) {
                    nameInput.focus();
                }
            }
        }, 100);
    };

    const toggleCategoryItems = (category: string, shouldInclude: boolean) => {
        setItems(items.map(item =>
            item.category === category ? { ...item, included: shouldInclude } : item
        ));
    };

    const toggleCategoryExpansion = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const calculateTotal = () => {
        let total = 0;
        items.forEach(item => {
            if (item.included) {
                const price = item.manualPrice !== undefined ? item.manualPrice : item.price;
                total += item.quantity * price;
            }
        });
        // Add BDI
        return total * (1 + (bdi / 100));
    };

    const handleSaveToCloud = async () => {
        if (!user) return;

        if (profile?.subscription_status === 'past_due') {
            alert('Acesso suspenso por falta de pagamento. Regularize sua assinatura no dashboard para salvar orçamentos na nuvem.');
            window.open('/dashboard', '_blank');
            return;
        }

        const tier = profile?.tier || 'free';
        const limit = PLAN_LIMITS[tier].max_estimates;

        // Check only if limit is finite (free tier)
        if (limit < Infinity && !lastSaved && budgetCount >= limit) {
            alert(`Limite do Plano Grátis Atingido!\n\nVocê já possui ${budgetCount} orçamentos salvos.\nO plano gratuito permite salvar até ${limit} orçamentos.\n\nAssine o Plano Profissional.`);
            window.open('/planos', '_blank');
            return;
        }

        setIsCloudSynced(false);

        const dataToSave = {
            id: estimateId,
            items,
            bdi,
            providerName,
            clientName,
            projectType,
            deadline,
            providerPhone,
            clientPhone,
            workCity,
            workState,
            updatedAt: new Date().toISOString(),
            includeMaterials,
            includeContract,
            clientDocument,
            clientAddress,
            projectArea,
            projectDuration,
            status,
            aiRequests
        };

        // Extract unique categories for summary
        const uniqueCategories = Array.from(new Set(items.map(item => item.category))).filter(Boolean).slice(0, 8);

        try {
            const { error } = await supabase.from('budgets').upsert({
                id: estimateId,
                user_id: user.id,
                title: clientName ? `${clientName} - ${projectType || 'Obra'}` : 'Novo Orçamento',
                services_summary: uniqueCategories,
                total_value: calculateTotal(),
                content: dataToSave,
                updated_at: new Date().toISOString(),
                client_name: clientName,
                client_phone: clientPhone,
                project_type: projectType,
                work_city: workCity,
                work_state: workState,
                status: status
            });

            if (error) {
                console.error("ERRO AO SALVAR NO SUPABASE:", error);
                alert(`Erro ao salvar: ${error.message}\nVerifique o console para mais detalhes.`);
            } else {
                setIsCloudSynced(true);
                setLastSaved(new Date());
            }
        } catch (err) {
            console.error('Cloud Save Exception:', err);
            alert('Erro inesperado ao salvar.');
        }
    };

    const handleGenerateReport = async () => {
        setIsSaving(true);
        // Force save locally one last time
        const dataToSave = {
            id: estimateId,
            items,
            bdi,
            providerName,
            clientName,
            projectType,
            deadline,
            providerPhone,
            clientPhone,
            workCity,
            workState,
            includeMaterials,
            includeContract,
            clientDocument,
            clientAddress,
            updatedAt: new Date().toISOString(),
            projectArea,
            projectDuration,
            aiRequests
        };
        localStorage.setItem(`estimate_${estimateId}`, JSON.stringify(dataToSave));

        // Save to Cloud if logged in (already checked)
        await handleSaveToCloud();

        // Always redirect to report page logic locally
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(`/report/${estimateId}`);
    };

    const handleLocalSelect = (item: any) => {
        const normalizeCategory = (cat: string) => cat.toUpperCase().trim().replace(/\s+/g, ' ');
        // Check if category exists in standards
        const standardCats = BOQ_TEMPLATES.obra_nova.map(c => normalizeCategory(c.name));
        const isStandardCategory = standardCats.includes(normalizeCategory(item.category));

        if (isStandardCategory) {
            setIsManualCatalogExpanded(true);
        }

        setExpandedCategories(prev => ({
            ...prev,
            [item.category]: true
        }));

        setTimeout(() => {
            const element = document.getElementById(`item-${item.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
                setTimeout(() => element.classList.remove('bg-blue-50', 'dark:bg-blue-900/20'), 2000);

                // Focus specifically on the quantity input field
                const quantityInput = element.querySelector<HTMLInputElement>(`input[data-item-id="${item.id}"]`);
                if (quantityInput) {
                    setTimeout(() => {
                        quantityInput.focus();
                        quantityInput.select();
                    }, 300);
                }
            }
        }, 300);
    };

    const handleAddAiItems = (newItems: any[], request: any) => {
        if (profile?.subscription_status === 'past_due') {
            alert('Acesso suspenso por falta de pagamento. Regularize sua assinatura no dashboard para usar a IA.');
            window.open('/dashboard', '_blank');
            return;
        }
        const requestId = crypto.randomUUID();
        const targetCategory = (request?.suggestedTitle || request?.query || 'ITENS ADICIONAIS').toUpperCase();

        const itemsWithIds = newItems.map((item: any) => ({
            ...item,
            id: crypto.randomUUID(),
            included: true,
            category: targetCategory,
            aiRequestId: requestId,
            isCustom: true
        }));

        setItems(prev => [...itemsWithIds, ...prev]);

        if (request) {
            setAiRequests(prev => [...prev, { ...request, id: requestId, timestamp: new Date().toISOString() }]);
            if (request.projectArea && request.projectArea > 0) {
                setProjectArea(request.projectArea);
            }
        }
        setExpandedCategories(prev => ({
            ...prev,
            [targetCategory]: true
        }));
    };

    // Recalculate Totals & Groups
    const { subtotal, bdiValue, total, groupedItems, categories } = useMemo(() => {
        let sub = 0;
        const groupMap: Record<string, BoqItem[]> = {};

        // Ensure default categories exist even if empty
        const defaultCats = BOQ_TEMPLATES.obra_nova.map((c: any) => c.name.toUpperCase());
        defaultCats.forEach((c: string) => groupMap[c] = []);

        const includedItems = items.filter((i: BoqItem) => i.included);

        includedItems.forEach((item: BoqItem) => {
            // Apply Sanitization Logic for Total Calculation
            const baseP = Number(item.price);
            const rawLabor = Number(item.laborPrice);
            // Ignore corrupted labor price if it equals or exceeds base price
            const safeLabor = (rawLabor > 0 && rawLabor < baseP) ? rawLabor : baseP * 0.4;

            const calculatedPrice = item.manualPrice ?? (includeMaterials ? baseP : safeLabor);

            sub += (Number(calculatedPrice) * Number(item.quantity));
        });

        items.forEach((item: BoqItem) => {
            const cat = item.category || 'ITENS ADICIONAIS';
            if (!groupMap[cat]) groupMap[cat] = [];
            groupMap[cat].push(item);
        });

        const sortedCategories = Object.keys(groupMap).sort((a: string, b: string) => {
            const indexA = defaultCats.indexOf(a);
            const indexB = defaultCats.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        return {
            subtotal: sub,
            bdiValue: sub * (bdi / 100),
            total: sub * (1 + bdi / 100),
            groupedItems: groupMap,
            categories: sortedCategories
        };
    }, [items, bdi, includeMaterials]);

    const providerDddInfo = useMemo(() => getDddInfo(providerPhone), [providerPhone]);
    const clientDddInfo = useMemo(() => getDddInfo(clientPhone), [clientPhone]);

    // Auto-fill Work Location from Client Phone DDD
    useEffect(() => {
        if (clientDddInfo) {
            if (!workState) {
                setWorkState(clientDddInfo.state);
            }
            if (!workCity) {
                if (clientDddInfo.cities.length > 0) {
                    setWorkCity(clientDddInfo.cities[0]);
                }
            }
        }
    }, [clientDddInfo, workState, workCity]);

    const formatDocument = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            // CPF: 000.000.000-00
            return numbers
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1');
        } else {
            // CNPJ: 00.000.000/0000-00
            return numbers
                .replace(/(\d{2})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1/$2')
                .replace(/(\d{4})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1');
        }
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatDocument(e.target.value);
        setClientDocument(formatted);
    };

    const handlePhoneChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numeric = rawValue.replace(/\D/g, '');
        if (numeric.length > 11) return;
        let formatted = numeric;
        if (numeric.length > 2) formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2)}`;
        if (numeric.length > 7) formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2, 7)}-${numeric.slice(7)}`;
        setter(formatted);
    };



    const isFormValid = useMemo(() => {
        return (
            clientName.trim() !== '' &&
            clientPhone.replace(/\D/g, '').length >= 10
        );
    }, [clientName, clientPhone]);

    return (
        <div className="min-h-screen bg-background font-sans">
            <div className="max-w-[1600px] mx-auto p-6 lg:p-8">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN: Main Content (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Past-due hard block banner */}
                        {profile?.subscription_status === 'past_due' && (
                            <div className="flex items-center justify-between gap-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl p-3 text-xs mb-2">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="text-red-500 shrink-0" size={16} />
                                    <div>
                                        <p className="font-bold text-red-700 dark:text-red-400">Acesso suspenso por falta de pagamento.</p>
                                        <p className="text-red-600 dark:text-red-500 mt-0.5">Regularize sua assinatura para continuar editando e exportando orçamentos.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.open('/dashboard', '_blank')}
                                    className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Regularizar
                                </button>
                            </div>
                        )}



                        {/* Labels for AI vs Manual */}
                        <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-orange-500/80">
                                ✨ Gerar com IA
                            </span>

                            {/* Cloud Save Button */}
                            {user && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSaveToCloud}
                                        disabled={isCloudSynced}
                                        className={`flex items-center gap-1.5 transition-all duration-300 px-2 py-1 rounded-md group ${isCloudSynced ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer'}`}
                                        title={isCloudSynced ? "Sincronizado com a nuvem" : "Clique para salvar na nuvem"}
                                    >
                                        {isCloudSynced ? (
                                            <>
                                                <Cloud className="w-3 h-3 text-green-500" />
                                                <span className="text-[10px] font-medium">Salvo {lastSaved ? `às ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                                            </>
                                        ) : (
                                            <>
                                                <CloudOff className="w-3 h-3 text-blue-500 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-medium">Salvar na Nuvem</span>
                                            </>
                                        )}
                                    </button>


                                </div>
                            )}
                        </div>

                        {/* AI Assistant Search Bar */}
                        <div className="mb-2">
                            <CommandSearch
                                items={items}
                                onSelect={handleLocalSelect}
                                onAddCustom={handleAddAiItems}
                            />
                        </div>

                        {/* Main List Container */}
                        <div className="">

                            {/* AI / Custom Items Loop (Always Visible at Top) */}
                            <div className="space-y-2 mb-6">
                                {categories.filter(cat => {
                                    const normalizeCategory = (c: string) => c.toUpperCase().trim().replace(/\s+/g, ' ');
                                    const standardCats = BOQ_TEMPLATES.obra_nova.map(c => normalizeCategory(c.name));
                                    return !standardCats.includes(normalizeCategory(cat));
                                }).map((category) => {
                                    const categoryItems = groupedItems[category];
                                    if (!categoryItems) return null;
                                    const categoryIncluded = categoryItems.filter(i => i.included).length;
                                    const isExpanded = expandedCategories[category];
                                    const hasIncluded = categoryItems.some(i => i.included);
                                    const showContent = isExpanded || hasIncluded;

                                    const categoryTotal = categoryItems.reduce((sum, item) => {
                                        if (!item.included) return sum;
                                        // Apply Same Sanitization Logic for Category Total
                                        const baseP = Number(item.price);
                                        const rawLabor = Number(item.laborPrice);
                                        const safeLabor = (rawLabor > 0 && rawLabor < baseP) ? rawLabor : baseP * 0.4;

                                        const price = item.manualPrice ?? (includeMaterials ? baseP : safeLabor);
                                        return sum + (price * item.quantity);
                                    }, 0);

                                    return (
                                        <div key={category} className="rounded-lg">
                                            {/* Group Header */}
                                            <div className="flex items-center justify-between px-4 py-3 group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleCategoryExpansion(category)}>
                                                <div className="flex items-center gap-3">
                                                    <ChevronDown
                                                        className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${!isExpanded ? '-rotate-90' : ''}`}
                                                    />
                                                    <div className="flex items-baseline gap-2">
                                                        <h3 className="text-xs font-bold text-foreground/80 dark:text-[#F5E6D3] uppercase tracking-wide">
                                                            {category}
                                                        </h3>
                                                        <span className="text-[10px] text-muted-foreground font-normal">
                                                            ({categoryItems.length})
                                                        </span>
                                                        {bdi > 0 && category === 'ITENS ADICIONAIS' && (
                                                            <span className="ml-2 text-[9px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-400/20">
                                                                SUGESTÃO IA
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                    <span className="text-xs font-bold text-foreground tabular-nums">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(categoryTotal)}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleCategoryItems(category, categoryIncluded < categoryItems.length)}
                                                        className={`w-4 h-4 border rounded transition-colors flex items-center justify-center ${categoryIncluded > 0
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-[#222120] hover:border-black/20 dark:hover:border-white/20'
                                                            }`}
                                                    >
                                                        {categoryIncluded > 0 && <span className="text-[8px] font-bold">✓</span>}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category)}
                                                        className="w-4 h-4 rounded transition-colors flex items-center justify-center text-red-500 hover:bg-red-500/10 ml-1"
                                                        title="Excluir Grupo"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Items List (Accordion Body) */}
                                            {showContent && (
                                                <div className="pb-4 pt-1 bg-card border-t border-white/5">
                                                    {/* Column Headers */}
                                                    <div className="grid grid-cols-12 gap-4 mb-2 px-4 text-[9px] font-bold text-[#8a8886] uppercase tracking-wider">
                                                        <div className="col-span-1"></div>
                                                        <div className="col-span-4">Descrição</div>
                                                        <div className="col-span-1 text-center">Un.</div>
                                                        <div className="col-span-2 text-center">Qtd</div>
                                                        <div className="col-span-2 text-right">Unit</div>
                                                        <div className="col-span-2 text-right">Total</div>
                                                    </div>
                                                    <div className="space-y-0 text-[11px]">
                                                        {categoryItems.map((item, index) => {
                                                            if (!isExpanded && !item.included) return null;

                                                            // EXPLICIT DISPLAY CALCULATION (Fix for DB items & Dirty Data)
                                                            const basePrice = Number(item.price);
                                                            // Safety: If laborPrice is >= basePrice, it's invalid (dirty data), so force fallback logic
                                                            const rawLabor = Number(item.laborPrice);
                                                            const safeLabor = (rawLabor > 0 && rawLabor < basePrice) ? rawLabor : basePrice * 0.4;

                                                            const hasManual = item.manualPrice !== undefined && item.manualPrice !== null;
                                                            const displayValue = hasManual
                                                                ? Number(item.manualPrice)
                                                                : (includeMaterials ? basePrice : safeLabor);

                                                            return (
                                                                <React.Fragment key={item.id}>
                                                                    <div
                                                                        id={`item-${item.id}`}
                                                                        onClick={() => toggleInclude(item.id, true)}
                                                                        className={`grid grid-cols-12 gap-4 px-4 py-1 items-center hover:bg-white/5 transition-colors group/item cursor-pointer ${!item.included ? 'opacity-50' : ''}`}
                                                                    >
                                                                        <div className="col-span-1 flex justify-center -ml-4" onClick={(e) => e.stopPropagation()}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={item.included}
                                                                                onChange={() => toggleInclude(item.id)}
                                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-4 pl-0 py-1">
                                                                            <input
                                                                                type="text"
                                                                                value={item.name}
                                                                                onChange={(e) => handleNameChange(item.id, e.target.value)}
                                                                                className="w-full bg-transparent border-none p-0 text-[11px] font-medium text-foreground focus:text-foreground focus:ring-0 placeholder-[#B5B5B5] leading-tight"
                                                                                placeholder="Nome do item"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-1 text-center">
                                                                            <input
                                                                                type="text"
                                                                                value={item.unit}
                                                                                onChange={(e) => handleUnitChange(item.id, e.target.value)}
                                                                                className="w-full text-center bg-transparent border-none p-0 text-[10px] text-muted-foreground uppercase focus:ring-0"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 px-2">
                                                                            <PriceInput
                                                                                value={item.quantity}
                                                                                onChange={(val) => handleQuantityChange(item.id, val.toString())}
                                                                                data-item-id={item.id}
                                                                                className="w-full text-center bg-black/5 dark:bg-[#222120] border-none rounded py-1 text-[11px] text-foreground focus:text-foreground focus:ring-1 focus:ring-blue-500 hover:bg-black/10 dark:hover:bg-white/10 tabular-nums"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 text-right">
                                                                            <PriceInput
                                                                                value={displayValue}
                                                                                onChange={(val) => handlePriceChange(item.id, val.toString())}
                                                                                className="w-full text-right bg-transparent border-none p-0 text-[11px] text-muted-foreground focus:text-foreground focus:ring-0 tabular-nums"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 text-right flex items-center justify-end gap-2 group/actions relative">
                                                                            <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
                                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                                                    displayValue * item.quantity
                                                                                )}
                                                                            </span>
                                                                            <button
                                                                                onClick={() => handleDelete(item.id)}
                                                                                className="opacity-0 group-hover/item:opacity-100 text-red-400 hover:text-red-600 p-1 absolute -right-6 md:static transition-all"
                                                                                title="Excluir"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Add Custom Item Button */}
                                                    {isExpanded && (
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddCustomItem(category);
                                                            }}
                                                            className="grid grid-cols-12 gap-4 px-4 py-2.5 items-center hover:bg-blue-500/5 transition-colors group/add cursor-pointer border-t border-white/5 border-dashed mt-1"
                                                        >
                                                            <div className="col-span-1 flex justify-center -ml-4">
                                                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center group-hover/add:bg-blue-500/20 transition-colors">
                                                                    <Plus size={12} className="text-blue-500" />
                                                                </div>
                                                            </div>
                                                            <div className="col-span-11">
                                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest transition-colors">
                                                                    Adicionar Item Manual em {category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                            }
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Separator - MANUAL CATALOG STARTS HERE */}
                            <div className="flex items-center gap-4 my-8">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <button
                                    onClick={() => {
                                        const newState = !isManualCatalogExpanded;
                                        setIsManualCatalogExpanded(newState);

                                        // Always collapse all groups when toggling catalog visibility
                                        // User will manually expand the groups they want to see
                                        setExpandedCategories({});
                                    }}
                                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                                >
                                    {isManualCatalogExpanded ? 'Ocultar Catálogo Manual' : 'Mostrar Catálogo Manual'}
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isManualCatalogExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>

                            {/* Standard / Manual Items Loop (Collapsible Section) */}
                            {/* Standard / Manual Items Loop (Collapsible Section) */}
                            <div className={`space-y-2 transition-opacity ${isManualCatalogExpanded ? 'opacity-80 hover:opacity-100' : ''}`}>
                                {categories.filter(cat => {
                                    const normalizeCategory = (c: string) => c.toUpperCase().trim().replace(/\s+/g, ' ');
                                    const standardCats = BOQ_TEMPLATES.obra_nova.map(c => normalizeCategory(c.name));
                                    return standardCats.includes(normalizeCategory(cat));
                                }).map((category) => {
                                    const categoryItems = groupedItems[category];
                                    if (!categoryItems) return null;

                                    const hasIncluded = categoryItems.some(i => i.included);

                                    // If catalog is hidden AND no items are included in this category, hide it
                                    if (!isManualCatalogExpanded && !hasIncluded) return null;

                                    const categoryIncluded = categoryItems.filter(i => i.included).length;
                                    const isExpanded = expandedCategories[category];
                                    const showContent = isExpanded || hasIncluded;

                                    const categoryTotal = categoryItems.reduce((sum, item) => {
                                        if (!item.included) return sum;

                                        // Apply Same Sanitization Logic for Category Total
                                        const baseP = Number(item.price);
                                        const rawLabor = Number(item.laborPrice);
                                        const safeLabor = (rawLabor > 0 && rawLabor < baseP) ? rawLabor : baseP * 0.4;

                                        const price = item.manualPrice ?? (includeMaterials ? baseP : safeLabor);

                                        return sum + (price * item.quantity);
                                    }, 0);

                                    return (
                                        <div key={category} className="rounded-lg">
                                            {/* Group Header */}
                                            <div className="flex items-center justify-between px-4 py-3 group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleCategoryExpansion(category)}>
                                                <div className="flex items-center gap-3">
                                                    <ChevronDown
                                                        className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${!isExpanded ? '-rotate-90' : ''}`}
                                                    />
                                                    <div className="flex items-baseline gap-2">
                                                        <h3 className={`text-xs font-bold uppercase tracking-wide transition-colors ${categoryItems.filter(i => (i.quantity || 0) > 0).length > 0 ? 'text-foreground dark:text-[#F5E6D3]' : 'text-muted-foreground/60 dark:text-gray-500 font-medium'}`}>
                                                            {category}
                                                        </h3>
                                                        <span className="text-[10px] text-muted-foreground font-normal">
                                                            ({categoryItems.filter(i => (i.quantity || 0) > 0).length})
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                    <span className="text-xs font-bold text-foreground tabular-nums">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(categoryTotal)}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleCategoryItems(category, categoryIncluded < categoryItems.length)}
                                                        className={`w-4 h-4 border rounded transition-colors flex items-center justify-center ${categoryIncluded > 0
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-[#222120] hover:border-black/20 dark:hover:border-white/20'
                                                            }`}
                                                    >
                                                        {categoryIncluded > 0 && <span className="text-[8px] font-bold">✓</span>}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Items List (Accordion Body) */}
                                            {showContent && (
                                                <div className="pb-4 pt-1 bg-card border-t border-white/5">
                                                    {/* Column Headers */}
                                                    <div className="grid grid-cols-12 gap-4 mb-2 px-4 text-[9px] font-bold text-[#8a8886] uppercase tracking-wider">
                                                        <div className="col-span-1"></div>
                                                        <div className="col-span-4">Descrição</div>
                                                        <div className="col-span-1 text-center">Un.</div>
                                                        <div className="col-span-2 text-center">Qtd</div>
                                                        <div className="col-span-2 text-right">Unit</div>
                                                        <div className="col-span-2 text-right">Total</div>
                                                    </div>
                                                    <div className="space-y-0 text-[11px]">
                                                        {categoryItems.map((item, index) => {
                                                            if (!isExpanded && !item.included) return null;

                                                            // EXPLICIT DISPLAY CALCULATION DUPLICATED (Since separate loop)
                                                            const basePrice = Number(item.price);
                                                            const rawLabor = Number(item.laborPrice);
                                                            const safeLabor = (rawLabor > 0 && rawLabor < basePrice) ? rawLabor : basePrice * 0.4;
                                                            const hasManual = item.manualPrice !== undefined && item.manualPrice !== null;
                                                            const displayValue = hasManual
                                                                ? Number(item.manualPrice)
                                                                : (includeMaterials ? basePrice : safeLabor);

                                                            return (
                                                                <React.Fragment key={item.id}>
                                                                    <div
                                                                        id={`item-${item.id}`}
                                                                        onClick={() => toggleInclude(item.id, true)}
                                                                        className={`grid grid-cols-12 gap-4 px-4 py-1 items-center hover:bg-white/5 transition-colors group/item cursor-pointer ${!item.included ? 'opacity-50' : ''}`}
                                                                    >
                                                                        <div className="col-span-1 flex justify-center -ml-4" onClick={(e) => e.stopPropagation()}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={item.included}
                                                                                onChange={() => toggleInclude(item.id)}
                                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-4 flex items-center gap-2">

                                                                            <input
                                                                                type="text"
                                                                                value={item.name}
                                                                                onChange={(e) => handleNameChange(item.id, e.target.value)}
                                                                                className="w-full bg-transparent border-none p-0 text-[11px] font-medium text-foreground focus:text-foreground focus:ring-0 placeholder-[#B5B5B5] leading-tight"
                                                                                placeholder="Nome do item"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-1 text-center">
                                                                            <input
                                                                                type="text"
                                                                                value={item.unit}
                                                                                onChange={(e) => handleUnitChange(item.id, e.target.value)}
                                                                                className="w-full text-center bg-transparent border-none p-0 text-[10px] text-muted-foreground uppercase focus:ring-0"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 px-2">
                                                                            <PriceInput
                                                                                value={item.quantity}
                                                                                onChange={(val) => handleQuantityChange(item.id, val.toString())}
                                                                                data-item-id={item.id}
                                                                                className="w-full text-center bg-black/5 dark:bg-[#222120] border-none rounded py-1 text-[11px] text-foreground focus:text-foreground focus:ring-1 focus:ring-blue-500 hover:bg-black/10 dark:hover:bg-white/10 tabular-nums"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 text-right">
                                                                            <PriceInput
                                                                                value={displayValue}
                                                                                onChange={(val) => handlePriceChange(item.id, val.toString())}
                                                                                className="w-full text-right bg-transparent border-none p-0 text-[11px] text-muted-foreground focus:text-foreground focus:ring-0 tabular-nums"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 text-right flex items-center justify-end gap-2 group/actions relative">
                                                                            <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
                                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                                                    displayValue * item.quantity
                                                                                )}
                                                                            </span>
                                                                            <button
                                                                                onClick={() => handleDelete(item.id)}
                                                                                className="opacity-0 group-hover/item:opacity-100 text-red-400 hover:text-red-600 p-1 absolute -right-6 md:static transition-all"
                                                                                title="Excluir"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Add Custom Item Button */}
                                                    {isExpanded && (
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddCustomItem(category);
                                                            }}
                                                            className="grid grid-cols-12 gap-4 px-4 py-2.5 items-center hover:bg-blue-500/5 transition-colors group/add cursor-pointer border-t border-white/5 border-dashed mt-1"
                                                        >
                                                            <div className="col-span-1 flex justify-center -ml-4">
                                                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center group-hover/add:bg-blue-500/20 transition-colors">
                                                                    <Plus size={12} className="text-blue-500" />
                                                                </div>
                                                            </div>
                                                            <div className="col-span-11">
                                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest transition-colors">
                                                                    Adicionar Item Manual em {category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>


                    {/* RIGHT COLUMN: Resumo Financeiro (Fixed/Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-lg p-6 border border-white/5 shadow-2xl">
                            <h2 className="text-sm font-bold text-foreground dark:text-[#F5E6D3] uppercase tracking-wider mb-6 pb-2 border-b border-black/10 dark:border-white/10">
                                📊 Resumo Financeiro
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground tabular-nums font-medium">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">BDI ({bdi}%)</span>
                                    <span className="text-foreground tabular-nums font-medium">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bdiValue)}
                                    </span>
                                </div>

                                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
                                    <span className="text-base font-bold text-foreground dark:text-[#F5E6D3]">TOTAL GERAL</span>
                                    <span className="text-xl font-bold text-orange-500 tabular-nums">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                    </span>
                                </div>
                            </div>

                            {/* Configuration Toggles */}
                            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-foreground">BDI Personalizado</span>
                                        <span className="text-[10px] text-muted-foreground">Taxa de Benefícios e Despesas</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/5 dark:bg-[#222120] rounded border border-black/10 dark:border-white/10 px-2 py-1">
                                        <input
                                            type="number"
                                            value={bdi}
                                            onChange={(e) => setBdi(Number(e.target.value))}
                                            className="w-10 bg-transparent text-right text-xs font-bold text-foreground border-none p-0 focus:ring-0"
                                            title="Porcentagem de BDI"
                                        />
                                        <span className="text-xs text-muted-foreground">%</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-foreground">Incluir Materiais</span>
                                        <span className="text-[10px] text-muted-foreground">Calcular com insumos</span>
                                    </div>
                                    <button
                                        onClick={() => setIncludeMaterials(!includeMaterials)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${includeMaterials ? 'bg-orange-500' : 'bg-[#4A4A4A]'}`}
                                        title="Alternar Inclusão de Materiais"
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${includeMaterials ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-foreground">Gerar Contrato de Serviço</span>
                                        <span className="text-[10px] text-muted-foreground">Anexa um modelo jurídico padrão ao final.</span>
                                    </div>
                                    <button
                                        onClick={() => setIncludeContract(!includeContract)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${includeContract ? 'bg-blue-600' : 'bg-[#4A4A4A]'}`}
                                        title="Alternar Geração de Contrato"
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${includeContract ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>



                            {/* Info */}
                            <div className="mt-4 text-[10px] text-center text-muted-foreground opacity-50">
                                <p>Os valores são estimados com base no SINAPI/ORSE.</p>
                                <p>Revisão de preços recomendada antes do fechamento.</p>
                            </div>
                        </div>

                        {/* LEAD CAPTURE FORM (Moved to Sidebar) */}
                        <div className="bg-card rounded-lg p-6 mt-6 border border-white/5 shadow-2xl">
                            <h2 className="text-sm font-bold text-foreground dark:text-[#F5E6D3] uppercase tracking-wider mb-4 pb-2 border-b border-black/10 dark:border-white/10 flex items-center gap-2">
                                📝 Detalhes da Obra
                            </h2>

                            <div className="space-y-6">
                                {/* Provider Info */}
                                {/* Provider Info Removed - Managed via Profile */}
                                {profile ? (
                                    <div className="p-3 bg-blue-50/10 border border-blue-500/20 rounded-lg mb-4">
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wide mb-1">Responsável Técnico</p>
                                        <p className="text-xs text-foreground font-medium">{profile.full_name || profile.company_name}</p>
                                        <Link href="/dashboard" className="text-[10px] text-muted-foreground underline hover:text-blue-400">Gerenciar Dados no Perfil</Link>
                                    </div>
                                ) : (
                                    <Link href="/login" className="block p-3 bg-orange-50/10 border border-orange-500/20 rounded-lg mb-4 hover:bg-orange-50/20 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wide mb-1">Modo Visitante</p>
                                                <p className="text-[10px] text-muted-foreground group-hover:text-orange-200/80 transition-colors">Crie uma conta grátis para personalizar seus dados no relatório.</p>
                                            </div>
                                            <div className="text-orange-400 opacity-50 group-hover:opacity-100 transition-opacity">
                                                →
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Client Info */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider">
                                        Cliente
                                    </h3>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            className="w-full bg-black/5 dark:bg-[#222120] border border-black/10 dark:border-white/10 rounded px-3 py-2 text-xs text-foreground focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-black/30 dark:placeholder-white/20"
                                            placeholder="Nome do Cliente"
                                            title="Nome do Cliente"
                                        />
                                        <input
                                            type="tel"
                                            value={clientPhone}
                                            onChange={handlePhoneChange(setClientPhone)}
                                            className="w-full bg-black/5 dark:bg-[#222120] border border-black/10 dark:border-white/10 rounded px-3 py-2 text-xs text-foreground focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-black/30 dark:placeholder-white/20 tabular-nums"
                                            placeholder="(00) 00000 - 0000"
                                            title="Telefone do Cliente"
                                            maxLength={15}
                                        />
                                        {includeContract && (
                                            <>
                                                <input
                                                    type="text"
                                                    value={clientDocument}
                                                    onChange={handleDocumentChange}
                                                    className="w-full bg-black/5 dark:bg-[#222120] border border-black/10 dark:border-white/10 rounded px-3 py-2 text-xs text-foreground focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-black/30 dark:placeholder-white/20"
                                                    placeholder="CPF ou CNPJ do Cliente"
                                                    title="CPF ou CNPJ do Cliente"
                                                    maxLength={18}
                                                />
                                                <input
                                                    type="text"
                                                    value={clientAddress}
                                                    onChange={(e) => setClientAddress(e.target.value)}
                                                    className="w-full bg-black/5 dark:bg-[#222120] border border-black/10 dark:border-white/10 rounded px-3 py-2 text-xs text-foreground focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-black/30 dark:placeholder-white/20"
                                                    placeholder="Endereço Completo do Cliente"
                                                    title="Endereço Completo do Cliente"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Project Context */}
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-1">
                                            <label className="block text-[9px] text-muted-foreground uppercase mb-1">Tipo de Serviço</label>
                                            <input
                                                type="text"
                                                value={projectType}
                                                onChange={(e) => setProjectType(e.target.value)}
                                                className="w-full bg-black/5 dark:bg-[#222120] border border-black/10 dark:border-white/10 rounded px-3 py-2 text-xs text-foreground focus:border-black/20 dark:focus:border-white/20 focus:ring-0 transition-all placeholder-black/30 dark:placeholder-white/20"
                                                placeholder="Ex: Reforma"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[9px] text-muted-foreground uppercase mb-1">Área (m²)</label>
                                            <input
                                                type="number"
                                                value={projectArea || ''}
                                                onChange={(e) => setProjectArea(Number(e.target.value))}
                                                className="w-full bg-black/5 dark:bg-[#222120] border border-black/10 dark:border-white/10 rounded px-3 py-2 text-xs text-foreground focus:border-black/20 dark:focus:border-white/20 focus:ring-0 transition-all placeholder-black/30 dark:placeholder-white/20"
                                                placeholder="0 m²"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[9px] text-muted-foreground uppercase mb-2">Previsão de Início</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Imediato', '30 dias', '60 dias', '90 dias'].map((option) => (
                                                    <button
                                                        key={option}
                                                        onClick={() => setDeadline(option)}
                                                        className={`
                                                            group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                                                            ${deadline === option
                                                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                                                                : 'bg-transparent border-border text-muted-foreground hover:border-blue-500/50 hover:text-foreground'
                                                            }
                                                        `}
                                                    >
                                                        {deadline === option && (
                                                            <div className="bg-white text-blue-600 rounded-full p-0.5">
                                                                <Check size={8} strokeWidth={4} />
                                                            </div>
                                                        )}
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Prazo da Obra Slider */}
                                        <div className="col-span-2 mt-2">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="block text-[9px] text-muted-foreground uppercase">Prazo da Obra</label>
                                                <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                                    {projectDuration} {projectDuration === 1 ? 'mês' : 'meses'}
                                                </span>
                                            </div>
                                            <div className="relative h-6 flex items-center group">
                                                {/* Labels para 1 e 24 */}
                                                <div className="absolute -bottom-4 left-0 text-[8px] text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">1m</div>
                                                <div className="absolute -bottom-4 right-0 text-[8px] text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">24m</div>

                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="24"
                                                    step="1"
                                                    value={projectDuration}
                                                    onChange={(e) => setProjectDuration(parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600 
                                                               hover:bg-black/20 dark:hover:bg-white/20 transition-all
                                                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 
                                                               [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(37,99,235,0.3)]
                                                               [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 
                                                               [&::-webkit-slider-thumb]:transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>






                            {/* GENERATE REPORT BUTTON (Moved Here) */}
                            <button
                                onClick={handleGenerateReport}
                                disabled={isSaving || !isFormValid}
                                title={!isFormValid ? "Preencha todos os campos acima para gerar o relatório" : "Gerar Relatório PDF"}
                                className={`w-full mt-6 font-bold py-3 rounded-lg transition-all transform flex items-center justify-center gap-2 shadow-lg 
                                    ${!isFormValid
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-blue-900/20'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        {isFormValid ? <FileText className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                                        {isFormValid ? 'Gerar Relatório PDF' : 'Preencha os Dados'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
}
