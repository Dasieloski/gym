"use client";

import { useState, useEffect } from "react";

let cachedTasa = 0;

export function useTasaUsd() {
  const [tasa, setTasa] = useState(cachedTasa);
  useEffect(() => {
    if (cachedTasa > 0) return;
    fetch("/api/admin/config")
      .then((r) => r.ok && r.json())
      .then((data) => {
        const t = parseInt(data?.TASA_USD) || 0;
        cachedTasa = t;
        setTasa(t);
      })
      .catch(() => {});
  }, []);
  return tasa;
}

export default function UsdValue({ amount, className }: { amount: number; className?: string }) {
  const tasa = useTasaUsd();
  const [show, setShow] = useState(false);
  const usd = tasa > 0 ? (amount / tasa).toFixed(2) : null;

  if (!usd) return <span className={className}>{amount.toLocaleString()}</span>;

  return (
    <span
      className={`relative ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {amount.toLocaleString()}
      {show && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono whitespace-nowrap z-50 pointer-events-none">
          ~${usd} USD
        </span>
      )}
    </span>
  );
}
