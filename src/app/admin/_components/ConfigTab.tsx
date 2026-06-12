"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

interface Configuracion {
    clave: string;
    valor: string;
    descripcion?: string;
}

export default function ConfigTab() {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/admin/config");
            if (res.ok) {
                const data = await res.json();
                setConfigs(data);
            }
        } catch (error) {
            console.error("Error fetching config:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setConfigs((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const configsArray = Object.entries(configs).map(([clave, valor]) => ({
                clave,
                valor,
                descripcion: getDescripcion(clave)
            }));

            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ configs: configsArray })
            });

            if (res.ok) {
                toast.success("Configuración guardada con éxito");
                setHasChanges(false);
            } else {
                throw new Error("Error al guardar");
            }
        } catch (error) {
            toast.error("Error al guardar la configuración");
        } finally {
            setSaving(false);
        }
    };

    const getDescripcion = (clave: string): string => {
        const descripciones: Record<string, string> = {
            PRECIO_MENSUAL: "Precio de membresía mensual en CUP",
            PRECIO_TRIMESTRAL: "Precio de membresía trimestral en CUP",
            PRECIO_ANUAL: "Precio de membresía anual en CUP",
            PRECIO_MENSUAL_USD: "Precio de membresía mensual en USD",
            PRECIO_TRIMESTRAL_USD: "Precio de membresía trimestral en USD",
            PRECIO_ANUAL_USD: "Precio de membresía anual en USD",
            PRECIO_MENSUAL_MLC: "Precio de membresía mensual en MLC",
            PRECIO_TRIMESTRAL_MLC: "Precio de membresía trimestral en MLC",
            PRECIO_ANUAL_MLC: "Precio de membresía anual en MLC",
            TELEFONO_ADMIN: "Teléfono de contacto principal",
            DIRECCION: "Dirección del gimnasio",
            NOMBRE_GIMNASIO: "Nombre del gimnasio",
            META_CLIENTES: "Meta de clientes activos",
            META_INGRESOS_MENSUAL: "Meta de ingreso mensual (CUP)",
            META_ASISTENCIA_DIARIA: "Meta de asistencias por día",
            TASA_USD: "Tasa de cambio (1 USD = ? CUP)",
        };
        return descripciones[clave] || "";
    };

    const configFields = [
        { clave: "NOMBRE_GIMNASIO", label: "Nombre del Gimnasio", type: "text" as const },
        { clave: "TELEFONO_ADMIN", label: "Teléfono de Contacto", type: "text" as const },
        { clave: "DIRECCION", label: "Dirección", type: "text" as const },
    ];

    const cupFields = [
        { clave: "PRECIO_MENSUAL", label: "Mensual (CUP)", type: "number" as const },
        { clave: "PRECIO_TRIMESTRAL", label: "Trimestral (CUP)", type: "number" as const },
        { clave: "PRECIO_ANUAL", label: "Anual (CUP)", type: "number" as const },
    ];

    const usdFields = [
        { clave: "PRECIO_MENSUAL_USD", label: "Mensual (USD)", type: "number" as const },
        { clave: "PRECIO_TRIMESTRAL_USD", label: "Trimestral (USD)", type: "number" as const },
        { clave: "PRECIO_ANUAL_USD", label: "Anual (USD)", type: "number" as const },
    ];

    const mlcFields = [
        { clave: "PRECIO_MENSUAL_MLC", label: "Mensual (MLC)", type: "number" as const },
        { clave: "PRECIO_TRIMESTRAL_MLC", label: "Trimestral (MLC)", type: "number" as const },
        { clave: "PRECIO_ANUAL_MLC", label: "Anual (MLC)", type: "number" as const },
    ];

    const metasFields = [
        { clave: "META_CLIENTES", label: "Meta de Clientes", type: "number" as const },
        { clave: "META_INGRESOS_MENSUAL", label: "Meta Ingreso Mensual (CUP)", type: "number" as const },
        { clave: "META_ASISTENCIA_DIARIA", label: "Meta Asistencias por Día", type: "number" as const },
        { clave: "TASA_USD", label: "Tasa de Cambio (CUP x USD)", type: "number" as const },
    ];

    const renderField = (field: { clave: string; label: string; type: string }) => (
        <div key={field.clave} className="border border-white/10 p-6">
            <label className="block text-white font-medium mb-2">{field.label}</label>
            <input
                type={field.type}
                value={configs[field.clave] || ""}
                onChange={(e) => handleChange(field.clave, e.target.value)}
                className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                placeholder={`Ingrese ${field.label.toLowerCase()}`}
            />
            {getDescripcion(field.clave) && (
                <p className="text-slate-500 text-xs mt-2">{getDescripcion(field.clave)}</p>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[#02F5D4]/20 border-t-[#02F5D4] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
            >
                <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Configuración</p>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
                    Ajustes del <span className="text-outline">Sistema</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Configura los precios de membresías y datos generales del gimnasio.
                </p>
            </motion.div>

            <div className="grid gap-8 max-w-3xl">
                <div>
                    <h3 className="text-white font-bold text-lg mb-4 border-b border-white/10 pb-2">Datos Generales</h3>
                    <div className="grid gap-6">
                        {configFields.map((f) => renderField(f))}
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-4 border-b border-white/10 pb-2">Precios en CUP</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cupFields.map((f) => renderField(f))}
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-4 border-b border-white/10 pb-2">Precios en USD</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {usdFields.map((f) => renderField(f))}
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-4 border-b border-white/10 pb-2">Precios en MLC</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {mlcFields.map((f) => renderField(f))}
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-4 border-b border-white/10 pb-2">Metas del Gimnasio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {metasFields.map((f) => renderField(f))}
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className={`px-8 py-3 font-bold transition-colors ${
                            hasChanges
                                ? "bg-[#02F5D4] hover:bg-[#02F5D4]/80 text-black"
                                : "bg-white/10 text-slate-500 cursor-not-allowed"
                        }`}
                    >
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}