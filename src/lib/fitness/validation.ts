import { z } from 'zod';
import {
  CATEGORIAS, DIAS_SEMANA, EQUIPAMIENTOS, MAX_EJERCICIOS_POR_RUTINA, MAX_SERIES_POR_EJERCICIO,
  MUSCULOS, NIVELES, TIPOS_MEDICION,
} from './constants';

const texto = (max: number) => z.string().trim().max(max);

export const catalogoSchema = z.object({
  nombre: texto(120).min(2),
  descripcion: texto(1000).optional().nullable(),
  instrucciones: z.array(texto(400).min(1)).max(15).default([]),
  musculoPrincipal: z.enum(MUSCULOS),
  musculosSecundarios: z.array(z.enum(MUSCULOS)).max(6).default([]),
  equipamiento: z.enum(EQUIPAMIENTOS),
  categoria: z.enum(CATEGORIAS),
  nivel: z.enum(NIVELES).default('PRINCIPIANTE'),
  tipoMedicion: z.enum(TIPOS_MEDICION).default('PESO_REPS'),
  // Solo se aceptan recursos https cuya licencia se declara explícitamente.
  mediaUrl: z.string().url().max(500).startsWith('https://').optional().nullable(),
  mediaLicencia: texto(200).optional().nullable(),
}).refine((d) => !d.mediaUrl || !!d.mediaLicencia, { message: 'mediaLicencia obligatoria si hay mediaUrl', path: ['mediaLicencia'] });

export const ejercicioRutinaSchema = z.object({
  catalogoId: z.number().int().positive(),
  series: z.number().int().min(1).max(MAX_SERIES_POR_EJERCICIO).default(3),
  repeticiones: z.number().int().min(1).max(999).default(10),
  peso: z.number().min(0).max(1000).nullable().optional(),
  duracionSeg: z.number().int().min(1).max(36000).nullable().optional(),
  descansoSeg: z.number().int().min(0).max(1800).nullable().optional(),
  diaSemana: z.enum(DIAS_SEMANA).nullable().optional(),
  notas: texto(500).nullable().optional(),
});

export const rutinaSchema = z.object({
  nombre: texto(100).min(2),
  descripcion: texto(500).nullable().optional(),
  ejercicios: z.array(ejercicioRutinaSchema).min(1).max(MAX_EJERCICIOS_POR_RUTINA),
});

export const iniciarSesionSchema = z.object({
  rutinaId: z.number().int().positive(),
  claveCliente: z.string().min(8).max(64),
  diaSemana: z.enum(DIAS_SEMANA).nullable().optional(),
});

export const serieSchema = z.object({
  ejercicioId: z.number().int().positive(),
  numero: z.number().int().min(1).max(MAX_SERIES_POR_EJERCICIO),
  peso: z.number().min(0).max(1000).nullable().optional(),
  repeticiones: z.number().int().min(0).max(999).nullable().optional(),
  duracionSeg: z.number().int().min(0).max(36000).nullable().optional(),
  completada: z.boolean(),
});

export const finalizarSchema = z.object({ notas: texto(500).nullable().optional() }).default({});

export const asignarSchema = z.object({
  rutinaId: z.number().int().positive(),
  clienteId: z.number().int().positive(),
});

export type RutinaInput = z.infer<typeof rutinaSchema>;
export type SerieInput = z.infer<typeof serieSchema>;

/** Genera un slug estable a partir del nombre (sin acentos, minúsculas, guiones). */
export function slugify(nombre: string): string {
  return nombre
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
