"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LogIn, LogOut, User, Clock, Users, QrCode, KeyRound, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";

interface ClientMinimal {
  id: number; nombre: string; telefono?: string; foto?: string;
  membresiaActual?: { fechaFin: string };
}

interface CheckInRecord {
  id: number; clienteId: number; tipo: string; metodo: string; fecha: string;
  cliente: { id: number; nombre: string; foto?: string };
}

export default function CheckInTab() {
  const [clientes, setClientes] = useState<ClientMinimal[]>([]);
  const [checkins, setCheckins] = useState<CheckInRecord[]>([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"manual" | "pin" | "qr">("manual");
  const [pin, setPin] = useState("");
  const [stats, setStats] = useState({ enGimnasio: 0, entradas: 0, salidas: 0, clientesUnicosHoy: 0 });
  const [lastCheckin, setLastCheckin] = useState<CheckInRecord | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);

  const fetchClientes = async () => {
    const res = await fetch("/api/admin/clientes");
    if (res.ok) { const data = await res.json(); setClientes(data.clientes || []); }
  };

  const fetchToday = async () => {
    const res = await fetch("/api/admin/checkin/hoy");
    if (res.ok) setStats(await res.json());
  };

  const fetchCheckins = async () => {
    const res = await fetch("/api/admin/checkin/hoy");
    if (res.ok) {
      const data = await res.json();
      setCheckins(data.checkins || []);
      setStats({ enGimnasio: data.enGimnasio, entradas: data.entradas, salidas: data.salidas, clientesUnicosHoy: data.clientesUnicosHoy });
    }
  };

  useEffect(() => { fetchClientes(); fetchCheckins(); }, []);

  const handleCheckin = async (clienteId: number, metodo: string, pinVal?: string) => {
    const res = await fetch("/api/admin/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId, tipo: "ENTRADA", metodo, pin: pinVal }),
    });
    if (res.ok) {
      const data = await res.json();
      setLastCheckin(data);
      toast.success(`Entrada registrada`);
      fetchCheckins();
    } else {
      const err = await res.json();
      if (err.warning) toast.warning("Cliente sin membresía activa");
      else toast.error(err.error || "Error al registrar");
    }
  };

  const handleCheckout = async (clienteId: number) => {
    const res = await fetch("/api/admin/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId, tipo: "SALIDA", metodo: "MANUAL" }),
    });
    if (res.ok) { toast.success("Salida registrada"); fetchCheckins(); }
    else toast.error("Error al registrar salida");
  };

  const handlePinCheckin = () => {
    if (pin.length < 4) { toast.error("El PIN debe tener al menos 4 dígitos"); return; }
    const cliente = clientes.find(c => c.id.toString().endsWith(pin) || (c.telefono && c.telefono.endsWith(pin)));
    if (!cliente) { toast.error("Cliente no encontrado con ese PIN"); return; }
    handleCheckin(cliente.id, "PIN", pin);
    setPin(""); setMode("manual");
  };

  const handleQuickCheckin = (cliente: ClientMinimal) => {
    handleCheckin(cliente.id, "MANUAL");
    setSearch("");
    searchRef.current?.focus();
  };

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (html5QrRef.current) { html5QrRef.current.clear(); }
      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          stopScanner();
          const match = decodedText.match(/GYM:(\d+)/);
          if (match) {
            const clienteId = parseInt(match[1]);
            const cliente = clientes.find((c) => c.id === clienteId);
            if (cliente) {
              handleCheckin(cliente.id, "QR");
            } else {
              toast.error("Cliente no encontrado");
            }
          } else {
            toast.error("Código QR inválido");
          }
        },
        () => {}
      );
      setScannerActive(true);
    } catch (err) {
      toast.error("Error al iniciar la cámara");
      console.error(err);
    }
  };

  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current.clear().catch(() => {});
      html5QrRef.current = null;
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const filteredClientes = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toString().includes(search)
  );

  const adentroIds = new Set(
    checkins.filter(c => c.tipo === "ENTRADA").map(c => c.clienteId)
  );
  const afueraIds = new Set(
    checkins.filter(c => c.tipo === "SALIDA").map(c => c.clienteId)
  );
  const enGimnasioIds = Array.from(adentroIds).filter(id => !afueraIds.has(id));

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Check-In</p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Registro de <span className="text-outline">Entrada</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Control de acceso diario con PIN opcional.
        </p>
      </motion.div>

      {lastCheckin && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-4">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="text-white font-bold">{lastCheckin.cliente.nombre}</p>
            <p className="text-slate-400 text-sm">Entrada: {new Date(lastCheckin.fecha).toLocaleTimeString("es-ES")}</p>
          </div>
          <button onClick={() => setLastCheckin(null)} className="ml-auto p-1 hover:bg-white/10"><XCircle className="w-4 h-4 text-slate-400" /></button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 mb-8">
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">En el Gimnasio</p>
          <p className="text-4xl font-black text-emerald-400">{stats.enGimnasio}</p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Entradas Hoy</p>
          <p className="text-4xl font-black text-[#02F5D4]">{stats.entradas}</p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Salidas Hoy</p>
          <p className="text-4xl font-black text-orange-400">{stats.salidas}</p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Clientes Únicos</p>
          <p className="text-4xl font-black text-white">{stats.clientesUnicosHoy}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-xl">Registro Rápido</h3>
            <div className="flex gap-2">
              {(["manual", "pin", "qr"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setPin(""); if (m !== "qr") setScannerActive(false); }}
                  className={`px-4 py-2 text-xs font-bold transition-colors flex items-center gap-2 ${mode === m ? "bg-[#02F5D4] text-black" : "bg-white/5 text-white hover:bg-white/10"}`}>
                  {m === "manual" ? <><Search size={14} /> Manual</> : m === "pin" ? <><KeyRound size={14} /> PIN</> : <><QrCode size={14} /> QR</>}
                </button>
              ))}
            </div>
          </div>

          {mode === "pin" ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-4">Ingresa los últimos 4 dígitos del teléfono o el ID del cliente</p>
              <input type="text" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="PIN"
                className="text-6xl font-black text-white text-center w-full bg-transparent border-b-2 border-[#02F5D4] py-4 focus:outline-none tracking-widest"
                autoFocus />
              <button onClick={handlePinCheckin} disabled={pin.length < 4}
                className="mt-6 px-10 py-4 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-lg transition-all duration-300 rounded-xl disabled:opacity-30 flex items-center gap-3 mx-auto">
                <KeyRound size={20} /> Registrar Entrada
              </button>
            </div>
          ) : mode === "qr" ? (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-4">Escanea el código QR del cliente con la cámara</p>
              <div id="qr-reader" className="w-full max-w-[320px] mx-auto overflow-hidden bg-black" style={{ minHeight: "240px" }} />
              {!scannerActive && (
                <button onClick={startScanner}
                  className="mt-4 px-8 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold transition-all duration-300 rounded-xl flex items-center gap-2 mx-auto">
                  <QrCode size={18} /> Iniciar Escáner
                </button>
              )}
              {scannerActive && (
                <button onClick={stopScanner}
                  className="mt-4 px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-colors flex items-center gap-2 mx-auto">
                  Detener Cámara
                </button>
              )}
              <p className="text-slate-500 text-xs mt-4">El check-in se registrará automáticamente al detectar un código válido</p>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input ref={searchRef} type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none text-lg" autoFocus />
              </div>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {filteredClientes.slice(0, 15).map((cliente) => (
                  <motion.div key={cliente.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 hover:bg-white/[0.03] border-l-2 border-white/10 hover:border-[#02F5D4] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center">
                        <User size={18} className="text-white/40" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{cliente.nombre}</p>
                        <p className="text-slate-600 text-xs">ID: {cliente.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {enGimnasioIds.includes(cliente.id) ? (
                        <button onClick={() => handleCheckout(cliente.id)}
                          className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold transition-colors flex items-center gap-1">
                          <LogOut size={14} /> Salida
                        </button>
                      ) : (
                        <button onClick={() => handleQuickCheckin(cliente)}
                          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1">
                          <LogIn size={14} /> Entrada
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {search && filteredClientes.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-8">Cliente no encontrado</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="border border-white/10 p-6">
          <h3 className="text-white font-bold text-xl mb-6">Actividad del Día</h3>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {checkins.slice(0, 30).map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.01 }}
                className="flex items-center justify-between p-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  {c.tipo === "ENTRADA" ? <LogIn size={14} className="text-emerald-400" /> : <LogOut size={14} className="text-orange-400" />}
                  <span className="text-white text-sm">{c.cliente.nombre}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs">{new Date(c.fecha).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 ${c.metodo === "PIN" ? "bg-[#02F5D4]/10 text-[#02F5D4]" : "bg-white/5 text-slate-400"}`}>
                    {c.metodo}
                  </span>
                </div>
              </motion.div>
            ))}
            {checkins.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-12">Sin actividad hoy</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
