// Valores permitidos para clasificar ejercicios. El catálogo guarda texto libre
// en BD para poder ampliarse sin migraciones; estas listas validan la entrada y
// alimentan los filtros de la interfaz.

export const MUSCULOS = [
  'PECHO', 'ESPALDA', 'HOMBROS', 'BICEPS', 'TRICEPS', 'ANTEBRAZOS',
  'ABDOMEN', 'CUADRICEPS', 'ISQUIOTIBIALES', 'GLUTEOS', 'GEMELOS', 'CUERPO_COMPLETO', 'CARDIO',
] as const;

export const EQUIPAMIENTOS = [
  'PESO_CORPORAL', 'MANCUERNAS', 'BARRA', 'POLEA', 'MAQUINA', 'KETTLEBELL',
  'BANDA_ELASTICA', 'BANCO', 'CARDIO_MAQUINA', 'OTRO',
] as const;

export const CATEGORIAS = ['FUERZA', 'HIPERTROFIA', 'CARDIO', 'MOVILIDAD', 'CORE'] as const;
export const NIVELES = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'] as const;
export const TIPOS_MEDICION = ['PESO_REPS', 'SOLO_REPS', 'TIEMPO'] as const;
export const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'] as const;

export const LABELS: Record<string, string> = {
  PECHO: 'Pecho', ESPALDA: 'Espalda', HOMBROS: 'Hombros', BICEPS: 'Bíceps', TRICEPS: 'Tríceps',
  ANTEBRAZOS: 'Antebrazos', ABDOMEN: 'Abdomen', CUADRICEPS: 'Cuádriceps', ISQUIOTIBIALES: 'Isquiotibiales',
  GLUTEOS: 'Glúteos', GEMELOS: 'Gemelos', CUERPO_COMPLETO: 'Cuerpo completo', CARDIO: 'Cardio',
  PESO_CORPORAL: 'Peso corporal', MANCUERNAS: 'Mancuernas', BARRA: 'Barra', POLEA: 'Polea', MAQUINA: 'Máquina',
  KETTLEBELL: 'Kettlebell', BANDA_ELASTICA: 'Banda elástica', BANCO: 'Banco', CARDIO_MAQUINA: 'Máquina de cardio',
  OTRO: 'Otro', FUERZA: 'Fuerza', HIPERTROFIA: 'Hipertrofia', MOVILIDAD: 'Movilidad', CORE: 'Core',
  PRINCIPIANTE: 'Principiante', INTERMEDIO: 'Intermedio', AVANZADO: 'Avanzado',
  PESO_REPS: 'Peso y repeticiones', SOLO_REPS: 'Solo repeticiones', TIEMPO: 'Tiempo',
};

export const MAX_SERIES_POR_EJERCICIO = 20;
export const MAX_EJERCICIOS_POR_RUTINA = 40;
export const MAX_RUTINAS_PERSONALES = 50;
