"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronRight, TrendingUp, TrendingDown, Minus, Target, Award, Calendar, Activity, Scale, Ruler, Heart, Flame, User, CreditCard, Phone } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import GlassCard from '@/components/ui/glass-card';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface WeightRecord {
    id: string;
    fecha: string;
    peso: number;
    altura: number;
    gluteo: number;
    imc: number;
    grasaCorporal: number;
    cuello: number;
    pecho: number;
    brazo: number;
    cintura: number;
    cadera: number;
    muslo: number;
}

interface WeightTrackingComponentProps {
    clientId: string;
}

interface WeightRecordPartial {
    peso: number;
    altura: number;
    imc?: number;
    grasaCorporal: number;
    cuello: number;
    pecho: number;
    brazo: number;
    cintura: number;
    cadera: number;
    muslo: number;
    gluteo?: number;
}

function calcularPesoIdeal(alturaCm: number): { promedio: number; broca: number; lorentz: number; devine: number; robinson: number } {
    const broca = alturaCm - 100;
    const lorentz = alturaCm - 100 - ((alturaCm - 150) / 4);
    const devine = 50 + 2.3 * ((alturaCm / 2.54) - 60);
    const robinson = 52 + 1.9 * ((alturaCm / 2.54) - 60);
    return { promedio: (broca + lorentz + devine + robinson) / 4, broca, lorentz, devine, robinson };
}

function getImcCategoria(imc: number): { label: string; color: string; bgColor: string } {
    if (imc < 18.5) return { label: 'Bajo peso', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
    if (imc < 25) return { label: 'Normal', color: 'text-green-400', bgColor: 'bg-green-500/10' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
    if (imc < 35) return { label: 'Obesidad I', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    if (imc < 40) return { label: 'Obesidad II', color: 'text-red-500', bgColor: 'bg-red-500/20' };
    return { label: 'Obesidad III', color: 'text-red-600', bgColor: 'bg-red-500/30' };
}

function getGrasaCorporalCategoria(grasa: number, esHombre: boolean): { label: string; color: string } {
    if (esHombre) {
        if (grasa < 6) return { label: 'Grasa esencial', color: 'text-blue-400' };
        if (grasa < 14) return { label: 'Atleta', color: 'text-green-400' };
        if (grasa < 18) return { label: 'Fitness', color: 'text-emerald-400' };
        if (grasa < 25) return { label: 'Normal', color: 'text-yellow-400' };
        return { label: 'Obeso', color: 'text-red-400' };
    } else {
        if (grasa < 14) return { label: 'Grasa esencial', color: 'text-blue-400' };
        if (grasa < 21) return { label: 'Atleta', color: 'text-green-400' };
        if (grasa < 25) return { label: 'Fitness', color: 'text-emerald-400' };
        if (grasa < 32) return { label: 'Normal', color: 'text-yellow-400' };
        return { label: 'Obeso', color: 'text-red-400' };
    }
}

export default function WeightTrackingComponent({ clientId }: WeightTrackingComponentProps) {
    const [activeTab, setActiveTab] = useState('resumen');
    const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
    const [showWeightForm, setShowWeightForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchWeightRecords = useCallback(async () => {
        try {
            const response = await fetch(`/api/cliente/${clientId}/registro-peso`);
            if (!response.ok) throw new Error('Error al obtener los registros');
            const data = await response.json();
            setWeightRecords(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        fetchWeightRecords();
    }, [clientId, fetchWeightRecords]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const addWeightRecord = async (data: WeightRecordPartial) => {
        try {
            const registro = {
                fecha: new Date().toISOString(),
                peso: data.peso,
                altura: data.altura,
                grasaCorporal: data.grasaCorporal || 0,
                cuello: data.cuello || 0,
                pecho: data.pecho || 0,
                brazo: data.brazo || 0,
                cintura: data.cintura || 0,
                cadera: data.cadera || 0,
                muslo: data.muslo || 0,
                gluteo: data.gluteo || 0,
                imc: data.imc || 0,
            };
            console.log('Enviando registro:', registro);
            const response = await fetch(`/api/cliente/${clientId}/registro-peso`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registro)
            });
            console.log('Respuesta:', response.status);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar');
            }
            const nuevoRegistro = await response.json();
            console.log('Nuevo registro:', nuevoRegistro);
            setWeightRecords(prev => [...prev, nuevoRegistro]);
            setShowWeightForm(false);
            toast.success('Registro agregado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar el registro');
        }
    };

    const latestRecord = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1] : null;
    const firstRecord = weightRecords.length > 0 ? weightRecords[0] : null;

    const stats = latestRecord && firstRecord ? {
        pesoCambio: latestRecord.peso - firstRecord.peso,
        diasTranscurridos: Math.ceil((new Date(latestRecord.fecha).getTime() - new Date(firstRecord.fecha).getTime()) / (1000 * 60 * 60 * 24)),
        pesoMasAlto: Math.max(...weightRecords.map(r => r.peso)),
        pesoMasBajo: Math.min(...weightRecords.map(r => r.peso)),
        imcCambio: latestRecord.imc - firstRecord.imc,
    } : null;

    const chartColors = {
        primary: '#02F5D4',
        secondary: '#2272FF',
        accent: '#02F5D4',
        warning: '#F59E0B',
        danger: '#EF4444',
        success: '#10B981',
        purple: '#8B5CF6',
        pink: '#EC4899',
    };

    const pesoChartData = {
        labels: weightRecords.slice(-10).map(r => formatDate(r.fecha)),
        datasets: [{
            label: 'Peso (kg)',
            data: weightRecords.slice(-10).map(r => r.peso),
            borderColor: chartColors.primary,
            backgroundColor: `${chartColors.primary}20`,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: chartColors.primary,
        }]
    };

    const imcChartData = {
        labels: weightRecords.slice(-10).map(r => formatDate(r.fecha)),
        datasets: [{
            label: 'IMC',
            data: weightRecords.slice(-10).map(r => r.imc),
            borderColor: chartColors.secondary,
            backgroundColor: `${chartColors.secondary}20`,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: chartColors.secondary,
        }]
    };

    const medidasChartData = {
        labels: weightRecords.slice(-10).map(r => formatDate(r.fecha)),
        datasets: [
            {
                label: 'Pecho',
                data: weightRecords.slice(-10).map(r => r.pecho || 0),
                borderColor: chartColors.pink,
                backgroundColor: `${chartColors.pink}20`,
                tension: 0.4,
            },
            {
                label: 'Cintura',
                data: weightRecords.slice(-10).map(r => r.cintura || 0),
                borderColor: chartColors.warning,
                backgroundColor: `${chartColors.warning}20`,
                tension: 0.4,
            },
            {
                label: 'Cadera',
                data: weightRecords.slice(-10).map(r => r.cadera || 0),
                borderColor: chartColors.purple,
                backgroundColor: `${chartColors.purple}20`,
                tension: 0.4,
            },
            {
                label: 'Brazo',
                data: weightRecords.slice(-10).map(r => r.brazo || 0),
                borderColor: chartColors.success,
                backgroundColor: `${chartColors.success}20`,
                tension: 0.4,
            },
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } }
            },
        },
        scales: {
            x: {
                ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
                grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
                ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
                grid: { color: 'rgba(255,255,255,0.05)' }
            }
        }
    };

    if (loading) {
        return (
            <GlassCard>
                <div className="p-6 flex items-center justify-center h-40">
                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <Activity className="w-8 h-8 text-[#02F5D4]" />
                    </motion.div>
                </div>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
                {[
                    { id: 'resumen', label: 'Resumen', icon: <Target size={16} /> },
                    { id: 'progreso', label: 'Progreso', icon: <TrendingUp size={16} /> },
                    { id: 'medidas', label: 'Medidas', icon: <Ruler size={16} /> },
                    { id: 'historial', label: 'Historial', icon: <Calendar size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg ${
                            activeTab === tab.id
                                ? 'bg-white/10 text-[#02F5D4] border border-white/10 border-b-transparent'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'resumen' && (
                    <motion.div
                        key="resumen"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Current Stats - Only show if records exist */}
                        {latestRecord ? (
                        <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <GlassCard>
                                <div className="p-4 text-center">
                                    <Scale className="w-6 h-6 text-[#02F5D4] mx-auto mb-2" />
                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Peso Actual</p>
                                    <p className="text-3xl font-heading font-bold text-white">{latestRecord.peso.toFixed(1)}</p>
                                    <p className="text-white/40 text-xs">kg</p>
                                </div>
                            </GlassCard>

                            <GlassCard>
                                <div className="p-4 text-center">
                                    <Activity className="w-6 h-6 text-[#2272FF] mx-auto mb-2" />
                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">IMC</p>
                                    <p className="text-3xl font-heading font-bold text-white">{latestRecord.imc.toFixed(1)}</p>
                                    <p className={`text-xs ${getImcCategoria(latestRecord.imc).color}`}>
                                        {getImcCategoria(latestRecord.imc).label}
                                    </p>
                                </div>
                            </GlassCard>

                            <GlassCard>
                                <div className="p-4 text-center">
                                    <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Grasa Corporal</p>
                                    <p className="text-3xl font-heading font-bold text-white">{latestRecord.grasaCorporal.toFixed(1)}%</p>
                                </div>
                            </GlassCard>

                            <GlassCard>
                                <div className="p-4 text-center">
                                    <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Peso Ideal</p>
                                    <p className="text-3xl font-heading font-bold text-white">
                                        {calcularPesoIdeal(latestRecord.altura).promedio.toFixed(1)}
                                    </p>
                                    <p className="text-white/40 text-xs">kg promedio</p>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Progress Summary */}
                        {stats && stats.diasTranscurridos > 0 && (
                            <GlassCard>
                                <div className="p-6">
                                    <h3 className="text-lg font-heading font-bold text-white mb-4">Tu Progreso</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                                            <p className="text-white/40 text-xs mb-1">Cambio Total</p>
                                            <p className={`text-2xl font-bold ${stats.pesoCambio < 0 ? 'text-green-400' : stats.pesoCambio > 0 ? 'text-red-400' : 'text-white/60'}`}>
                                                {stats.pesoCambio > 0 ? '+' : ''}{stats.pesoCambio.toFixed(1)} kg
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                                            <p className="text-white/40 text-xs mb-1">En Período</p>
                                            <p className="text-2xl font-bold text-white">{stats.diasTranscurridos}</p>
                                            <p className="text-white/40 text-xs">días</p>
                                        </div>
                                        <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                                            <p className="text-white/40 text-xs mb-1">Peso Más Bajo</p>
                                            <p className="text-2xl font-bold text-[#02F5D4]">{stats.pesoMasBajo.toFixed(1)}</p>
                                            <p className="text-white/40 text-xs">kg</p>
                                        </div>
                                        <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                                            <p className="text-white/40 text-xs mb-1">Peso Más Alto</p>
                                            <p className="text-2xl font-bold text-yellow-400">{stats.pesoMasAlto.toFixed(1)}</p>
                                            <p className="text-white/40 text-xs">kg</p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        )}
                        </>
                        ) : (
                            <GlassCard>
                                <div className="p-8 text-center">
                                    <Scale className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <h3 className="text-xl font-heading font-bold text-white mb-2">Sin registros aún</h3>
                                    <p className="text-white/50 mb-6">Comienza a registrar tu peso y medidas para seguir tu progreso</p>
                                </div>
                            </GlassCard>
                        )}

                        {/* Quick Add Button - Always Visible */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowWeightForm(true)}
                            className="w-full py-4 bg-gradient-to-r from-[#02F5D4]/20 to-[#2272FF]/20 border border-[#02F5D4]/30 hover:border-[#02F5D4] text-[#02F5D4] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            <Plus size={20} />
                            Agregar Nuevo Registro
                        </motion.button>
                    </motion.div>
                )}

                {activeTab === 'progreso' && (
                    <motion.div
                        key="progreso"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Peso Chart */}
                        <GlassCard>
                            <div className="p-6">
                                <h3 className="text-lg font-heading font-bold text-white mb-4">Evolución del Peso</h3>
                                <div className="h-64">
                                    <Line data={pesoChartData} options={chartOptions} />
                                </div>
                            </div>
                        </GlassCard>

                        {/* IMC Chart */}
                        <GlassCard>
                            <div className="p-6">
                                <h3 className="text-lg font-heading font-bold text-white mb-4">Evolución del IMC</h3>
                                <div className="h-64">
                                    <Line data={imcChartData} options={chartOptions} />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Add Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowWeightForm(true)}
                            className="w-full py-4 bg-gradient-to-r from-[#02F5D4]/20 to-[#2272FF]/20 border border-[#02F5D4]/30 hover:border-[#02F5D4] text-[#02F5D4] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            <Plus size={20} />
                            Agregar Nuevo Registro
                        </motion.button>
                    </motion.div>
                )}

                {activeTab === 'medidas' && (
                    <motion.div
                        key="medidas"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Medidas Chart */}
                        <GlassCard>
                            <div className="p-6">
                                <h3 className="text-lg font-heading font-bold text-white mb-4">Progreso de Medidas</h3>
                                <div className="h-80">
                                    <Line data={medidasChartData} options={chartOptions} />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Latest Measurements */}
                        {latestRecord && (
                            <GlassCard>
                                <div className="p-6">
                                    <h3 className="text-lg font-heading font-bold text-white mb-4">Medidas Actuales</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Cuello', value: latestRecord.cuello, icon: '🦒' },
                                            { label: 'Pecho', value: latestRecord.pecho, icon: '👕' },
                                            { label: 'Brazo', value: latestRecord.brazo, icon: '💪' },
                                            { label: 'Cintura', value: latestRecord.cintura, icon: '🧍' },
                                            { label: 'Cadera', value: latestRecord.cadera, icon: '🍑' },
                                            { label: 'Muslo', value: latestRecord.muslo, icon: '🦵' },
                                            { label: 'Glúteo', value: latestRecord.gluteo, icon: '🍑' },
                                            { label: 'Altura', value: latestRecord.altura, icon: '📏' },
                                        ].map((m, i) => (
                                            <div key={i} className="p-3 bg-white/[0.02] rounded-xl text-center">
                                                <p className="text-2xl mb-1">{m.icon}</p>
                                                <p className="text-white/40 text-xs">{m.label}</p>
                                                <p className="text-xl font-bold text-white">{m.value?.toFixed(1) || '-'}</p>
                                                <p className="text-white/40 text-xs">cm</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {/* Add Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowWeightForm(true)}
                            className="w-full py-4 bg-gradient-to-r from-[#02F5D4]/20 to-[#2272FF]/20 border border-[#02F5D4]/30 hover:border-[#02F5D4] text-[#02F5D4] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            <Plus size={20} />
                            Agregar Nuevo Registro
                        </motion.button>
                    </motion.div>
                )}

                {activeTab === 'historial' && (
                    <motion.div
                        key="historial"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {weightRecords.length === 0 ? (
                            <GlassCard>
                                <div className="p-8 text-center">
                                    <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/50">No hay registros de peso todavía.</p>
                                    <p className="text-white/30 text-sm">Agrega tu primer registro para comenzar a trackear tu progreso.</p>
                                </div>
                            </GlassCard>
                        ) : (
                            <>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowWeightForm(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#02F5D4]/10 hover:bg-[#02F5D4]/20 text-[#02F5D4] text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <Plus size={16} />
                                        Agregar
                                    </button>
                                </div>
                                {weightRecords.slice().reverse().map((registro, index) => {
                                    const prevRecord = weightRecords[weightRecords.length - 1 - index - 1];
                                    const pesoDiff = prevRecord ? registro.peso - prevRecord.peso : 0;
                                    return (
                                        <GlassCard key={registro.id} delay={index * 0.05}>
                                            <div className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center">
                                                        <Scale className="w-6 h-6 text-[#02F5D4]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold">{formatDate(registro.fecha)}</p>
                                                        <p className="text-white/50 text-sm">
                                                            Peso: {registro.peso}kg · IMC: {registro.imc.toFixed(1)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {pesoDiff !== 0 && (
                                                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                                                            pesoDiff < 0 ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                            {pesoDiff < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                                                            {pesoDiff > 0 ? '+' : ''}{pesoDiff.toFixed(1)} kg
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </GlassCard>
                                    );
                                })}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Weight Form Modal */}
            <AnimatePresence>
                {showWeightForm && (
                    <WeightFormModal
                        onSubmit={addWeightRecord}
                        onCancel={() => setShowWeightForm(false)}
                        lastRecord={latestRecord}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function WeightFormModal({ onSubmit, onCancel, lastRecord }: {
    onSubmit: (data: WeightRecordPartial) => void;
    onCancel: () => void;
    lastRecord: WeightRecord | null;
}) {
    const [formData, setFormData] = useState<WeightRecordPartial>({
        peso: lastRecord?.peso || 0,
        altura: lastRecord?.altura || 170,
        grasaCorporal: lastRecord?.grasaCorporal || 0,
        cuello: lastRecord?.cuello || 0,
        pecho: lastRecord?.pecho || 0,
        brazo: lastRecord?.brazo || 0,
        cintura: lastRecord?.cintura || 0,
        cadera: lastRecord?.cadera || 0,
        muslo: lastRecord?.muslo || 0,
        gluteo: lastRecord?.gluteo || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.altura <= 0) {
            toast.error('La altura debe ser mayor que 0');
            return;
        }
        const imc = formData.peso / Math.pow(formData.altura / 100, 2);
        onSubmit({ ...formData, imc });
    };

    const inputClass = "w-full bg-white/5 border border-white/10 focus:border-[#02F5D4] rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none transition-colors";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl shadow-black/50"
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-xl font-heading font-bold text-white">Nuevo Registro</h3>
                        <p className="text-white/50 text-sm mt-1">Completa todas las medidas corporales</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.peso || ''}
                                    onChange={e => setFormData({ ...formData, peso: parseFloat(e.target.value) || 0 })}
                                    className={inputClass}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Altura (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.altura || ''}
                                    onChange={e => setFormData({ ...formData, altura: parseFloat(e.target.value) || 0 })}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">% Grasa Corporal</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.grasaCorporal || ''}
                                onChange={e => setFormData({ ...formData, grasaCorporal: parseFloat(e.target.value) || 0 })}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            <div>
                                <label className="text-white/50 text-xs block mb-1">Cuello</label>
                                <input type="number" step="0.1" value={formData.cuello || ''} onChange={e => setFormData({ ...formData, cuello: parseFloat(e.target.value) || 0 })} className={inputClass} />
                            </div>
                            <div>
                                <label className="text-white/50 text-xs block mb-1">Pecho</label>
                                <input type="number" step="0.1" value={formData.pecho || ''} onChange={e => setFormData({ ...formData, pecho: parseFloat(e.target.value) || 0 })} className={inputClass} />
                            </div>
                            <div>
                                <label className="text-white/50 text-xs block mb-1">Brazo</label>
                                <input type="number" step="0.1" value={formData.brazo || ''} onChange={e => setFormData({ ...formData, brazo: parseFloat(e.target.value) || 0 })} className={inputClass} />
                            </div>
                            <div>
                                <label className="text-white/50 text-xs block mb-1">Cintura</label>
                                <input type="number" step="0.1" value={formData.cintura || ''} onChange={e => setFormData({ ...formData, cintura: parseFloat(e.target.value) || 0 })} className={inputClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-white/50 text-xs block mb-1">Cadera</label>
                                <input type="number" step="0.1" value={formData.cadera || ''} onChange={e => setFormData({ ...formData, cadera: parseFloat(e.target.value) || 0 })} className={inputClass} />
                            </div>
                            <div>
                                <label className="text-white/50 text-xs block mb-1">Muslo</label>
                                <input type="number" step="0.1" value={formData.muslo || ''} onChange={e => setFormData({ ...formData, muslo: parseFloat(e.target.value) || 0 })} className={inputClass} />
                            </div>
                            <div>
                                <label className="text-white/50 text-xs block mb-1">Glúteo</label>
                                <input type="number" step="0.1" value={formData.gluteo || ''} onChange={e => setFormData({ ...formData, gluteo: parseFloat(e.target.value) || 0 })} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 flex gap-3">
                        <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="flex-1 px-4 py-3 bg-[#02F5D4] hover:bg-[#02F5D4]/80 text-black font-bold rounded-xl transition-colors">
                            Guardar
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}