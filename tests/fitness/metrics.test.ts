import { describe, expect, it } from 'vitest';
import {
  EjercicioSesionLite, claveSemana, detectarRecords, frecuenciaMensual, frecuenciaSemanal, volumenSesion, volumenSerie,
} from '@/lib/fitness/metrics';

const serie = (id: number, peso: number | null, reps: number | null, completada = true, duracionSeg: number | null = null) => ({
  id, numero: id, peso, repeticiones: reps, duracionSeg, completada,
});

describe('volumen', () => {
  it('suma peso x repeticiones solo de series completadas con peso', () => {
    const ej: EjercicioSesionLite[] = [
      { catalogoId: 1, tipoMedicion: 'PESO_REPS', series: [serie(1, 50, 10), serie(2, 60, 8), serie(3, 70, 5, false)] },
      { catalogoId: 2, tipoMedicion: 'SOLO_REPS', series: [serie(4, null, 20)] }, // no suma: sin peso
      { catalogoId: 3, tipoMedicion: 'TIEMPO', series: [serie(5, null, null, true, 60)] }, // no suma
    ];
    expect(volumenSesion(ej)).toBe(50 * 10 + 60 * 8);
  });

  it('una serie sin repeticiones o sin peso vale 0 (caso límite)', () => {
    expect(volumenSerie('PESO_REPS', { peso: 40, repeticiones: null, completada: true })).toBe(0);
    expect(volumenSerie('PESO_REPS', { peso: 0, repeticiones: 10, completada: true })).toBe(0);
  });
});

describe('detectarRecords', () => {
  const ej = (peso: number): EjercicioSesionLite[] => [
    { catalogoId: 1, tipoMedicion: 'PESO_REPS', series: [serie(1, peso - 10, 10), serie(2, peso, 3)] },
  ];

  it('la primera vez es marca base, no un récord superado', () => {
    const r = detectarRecords(ej(80), []);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ valor: 80, previo: null, esSuperacion: false });
  });

  it('anuncia récord solo si supera estrictamente la marca previa', () => {
    const previo = [{ catalogoId: 1, tipo: 'PESO_MAXIMO' as const, valor: 80 }];
    expect(detectarRecords(ej(80), previo)).toHaveLength(0); // empate
    const r = detectarRecords(ej(85), previo);
    expect(r[0]).toMatchObject({ valor: 85, previo: 80, esSuperacion: true });
  });

  it('ignora series no completadas y ejercicios sin catálogo', () => {
    const r = detectarRecords(
      [
        { catalogoId: 1, tipoMedicion: 'PESO_REPS', series: [serie(1, 200, 1, false)] },
        { catalogoId: null, tipoMedicion: 'PESO_REPS', series: [serie(2, 100, 5)] },
      ],
      [],
    );
    expect(r).toHaveLength(0);
  });

  it('usa repeticiones para SOLO_REPS y duración para TIEMPO', () => {
    const r = detectarRecords(
      [
        { catalogoId: 7, tipoMedicion: 'SOLO_REPS', series: [serie(1, null, 15), serie(2, null, 12)] },
        { catalogoId: 8, tipoMedicion: 'TIEMPO', series: [serie(3, null, null, true, 90)] },
      ],
      [],
    );
    expect(r.map((x) => [x.tipo, x.valor]).sort()).toEqual([['MAX_DURACION', 90], ['MAX_REPS', 15]]);
  });
});

describe('frecuencia', () => {
  const ahora = new Date('2026-10-29T15:00:00Z'); // jueves

  it('claveSemana devuelve el lunes ISO', () => {
    expect(claveSemana('2026-10-29')).toBe('2026-10-26');
    expect(claveSemana('2026-11-01')).toBe('2026-10-26'); // domingo
  });

  it('agrupa por semana y rellena con ceros', () => {
    const f = frecuenciaSemanal([new Date('2026-10-27T12:00:00Z'), new Date('2026-10-28T12:00:00Z'), new Date('2026-10-14T12:00:00Z')], 4, ahora, 'UTC');
    expect(f).toHaveLength(4);
    expect(f[3]).toEqual({ clave: '2026-10-26', sesiones: 2 });
    expect(f[1]).toEqual({ clave: '2026-10-12', sesiones: 1 });
    expect(f[2].sesiones).toBe(0);
  });

  it('agrupa por mes, ignora fechas fuera de ventana', () => {
    const f = frecuenciaMensual([new Date('2026-10-02T12:00:00Z'), new Date('2026-08-30T12:00:00Z'), new Date('2025-01-01T00:00:00Z')], 3, ahora, 'UTC');
    expect(f.map((x) => x.clave)).toEqual(['2026-08', '2026-09', '2026-10']);
    expect(f.map((x) => x.sesiones)).toEqual([1, 0, 1]);
  });

  it('respeta la zona horaria: 23:30 en La Habana del día 31 cuenta en octubre', () => {
    const f = frecuenciaMensual([new Date('2026-11-01T03:30:00Z')], 2, new Date('2026-11-02T12:00:00Z'), 'America/Havana');
    expect(f.find((x) => x.clave === '2026-10')?.sesiones).toBe(1);
  });
});
