// Catálogo inicial de ejercicios. Los textos son de elaboración propia (no proceden de openGym
// ni de otra fuente con licencia) y no incluyen imágenes ni vídeos: `mediaUrl` queda vacío hasta
// que el gimnasio aporte recursos propios o con licencia que permita su uso.
// Para ampliar el catálogo: añade filas aquí o importa un JSON con `npm run db:seed-fitness -- --file ruta.json`
// (ver README, sección "Módulo fitness").

export interface EjercicioSemilla {
  nombre: string;
  musculoPrincipal: string;
  musculosSecundarios: string[];
  equipamiento: string;
  categoria: string;
  nivel: string;
  tipoMedicion: 'PESO_REPS' | 'SOLO_REPS' | 'TIEMPO';
  descripcion: string;
  instrucciones: string[];
}

type Fila = [string, string, string[], string, string, string, EjercicioSemilla['tipoMedicion'], string, string[]];

const FILAS: Fila[] = [
  // PECHO
  ['Press de banca con barra', 'PECHO', ['TRICEPS', 'HOMBROS'], 'BARRA', 'FUERZA', 'INTERMEDIO', 'PESO_REPS', 'Press horizontal básico para desarrollar fuerza en el pecho.', ['Túmbate en el banco con los pies firmes en el suelo.', 'Baja la barra de forma controlada hasta rozar el pecho.', 'Empuja hasta extender los brazos sin bloquear los codos.']],
  ['Press inclinado con mancuernas', 'PECHO', ['HOMBROS', 'TRICEPS'], 'MANCUERNAS', 'HIPERTROFIA', 'INTERMEDIO', 'PESO_REPS', 'Trabaja la parte superior del pecho con mayor rango de movimiento.', ['Ajusta el banco a unos 30 grados.', 'Baja las mancuernas hasta la altura del pecho con los codos a unos 45 grados.', 'Empuja hacia arriba juntando ligeramente las mancuernas.']],
  ['Aperturas con mancuernas', 'PECHO', ['HOMBROS'], 'MANCUERNAS', 'HIPERTROFIA', 'INTERMEDIO', 'PESO_REPS', 'Ejercicio de aislamiento para el pecho.', ['Con los brazos ligeramente flexionados, abre las mancuernas hacia los lados.', 'Siente el estiramiento del pecho sin bajar más allá de los hombros.', 'Vuelve arriba trazando un arco.']],
  ['Flexiones', 'PECHO', ['TRICEPS', 'HOMBROS', 'ABDOMEN'], 'PESO_CORPORAL', 'FUERZA', 'PRINCIPIANTE', 'SOLO_REPS', 'Empuje con el propio peso corporal.', ['Manos algo más abiertas que los hombros y cuerpo en línea recta.', 'Baja el pecho hacia el suelo con control.', 'Empuja hasta extender los brazos.']],
  ['Cruce de poleas', 'PECHO', ['HOMBROS'], 'POLEA', 'HIPERTROFIA', 'INTERMEDIO', 'PESO_REPS', 'Aislamiento del pecho con tensión constante.', ['Sujeta las asas a la altura de los hombros y da un paso al frente.', 'Junta las manos delante del pecho con los codos ligeramente flexionados.', 'Vuelve despacio a la posición inicial.']],
  ['Press de pecho en máquina', 'PECHO', ['TRICEPS'], 'MAQUINA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Press guiado, adecuado para aprender el patrón de empuje.', ['Ajusta el asiento para que las asas queden a la altura del pecho.', 'Empuja hasta casi extender los brazos.', 'Regresa de forma controlada.']],
  // ESPALDA
  ['Dominadas', 'ESPALDA', ['BICEPS', 'ANTEBRAZOS'], 'PESO_CORPORAL', 'FUERZA', 'AVANZADO', 'SOLO_REPS', 'Tracción vertical con el peso corporal.', ['Agarra la barra algo más ancho que los hombros.', 'Tira llevando el pecho hacia la barra.', 'Baja controlando hasta extender los brazos.']],
  ['Jalón al pecho', 'ESPALDA', ['BICEPS'], 'POLEA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Tracción vertical en polea, alternativa a las dominadas.', ['Siéntate con los muslos fijos bajo el apoyo.', 'Baja la barra hasta la parte alta del pecho.', 'Sube despacio sin balancear el torso.']],
  ['Remo con barra', 'ESPALDA', ['BICEPS', 'ISQUIOTIBIALES'], 'BARRA', 'FUERZA', 'INTERMEDIO', 'PESO_REPS', 'Tracción horizontal para espalda media y dorsales.', ['Inclina el torso con la espalda recta y las rodillas flexionadas.', 'Tira de la barra hacia el abdomen.', 'Baja controlando sin perder la postura.']],
  ['Remo con mancuerna a una mano', 'ESPALDA', ['BICEPS'], 'MANCUERNAS', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Remo unilateral apoyado en un banco.', ['Apoya una rodilla y una mano en el banco.', 'Tira de la mancuerna hacia la cadera.', 'Baja hasta estirar el brazo sin girar el tronco.']],
  ['Remo sentado en polea', 'ESPALDA', ['BICEPS'], 'POLEA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Remo guiado con buena estabilidad.', ['Siéntate con la espalda recta y las rodillas ligeramente flexionadas.', 'Tira del agarre hacia el abdomen juntando los omóplatos.', 'Extiende los brazos sin encorvarte.']],
  ['Peso muerto convencional', 'ESPALDA', ['GLUTEOS', 'ISQUIOTIBIALES', 'ANTEBRAZOS'], 'BARRA', 'FUERZA', 'AVANZADO', 'PESO_REPS', 'Levantamiento básico de cuerpo entero.', ['Barra sobre el medio del pie, espalda neutra y pecho arriba.', 'Empuja el suelo con las piernas y extiende la cadera.', 'Baja la barra cerca de las piernas controlando el movimiento.']],
  ['Hiperextensiones', 'ESPALDA', ['GLUTEOS', 'ISQUIOTIBIALES'], 'MAQUINA', 'FUERZA', 'PRINCIPIANTE', 'SOLO_REPS', 'Fortalece la zona lumbar y los glúteos.', ['Fija las caderas en el apoyo con el cuerpo alineado.', 'Baja el torso con la espalda recta.', 'Sube hasta alinear el cuerpo sin hiperextender.']],
  // HOMBROS
  ['Press militar con barra', 'HOMBROS', ['TRICEPS'], 'BARRA', 'FUERZA', 'INTERMEDIO', 'PESO_REPS', 'Press vertical de pie para hombros.', ['Barra a la altura de la clavícula, glúteos y abdomen firmes.', 'Empuja la barra por encima de la cabeza.', 'Baja controlando hasta la posición inicial.']],
  ['Press de hombros con mancuernas', 'HOMBROS', ['TRICEPS'], 'MANCUERNAS', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Press vertical sentado o de pie.', ['Mancuernas a la altura de las orejas, palmas al frente.', 'Empuja hacia arriba sin arquear la espalda.', 'Baja de forma controlada.']],
  ['Elevaciones laterales', 'HOMBROS', [], 'MANCUERNAS', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Aislamiento del deltoides lateral.', ['Brazos a los lados con los codos ligeramente flexionados.', 'Eleva las mancuernas hasta la altura de los hombros.', 'Baja despacio sin impulso.']],
  ['Pájaros con mancuernas', 'HOMBROS', ['ESPALDA'], 'MANCUERNAS', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Trabaja la parte posterior del hombro.', ['Inclina el torso con la espalda recta.', 'Abre los brazos hacia los lados hasta la altura de los hombros.', 'Baja de forma controlada.']],
  ['Face pull', 'HOMBROS', ['ESPALDA'], 'POLEA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Salud del hombro y deltoides posterior.', ['Cuerda a la altura de la cara.', 'Tira hacia la frente separando las manos.', 'Vuelve despacio manteniendo los codos altos.']],
  // BRAZOS
  ['Curl con barra', 'BICEPS', ['ANTEBRAZOS'], 'BARRA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Flexión de codo básica para bíceps.', ['De pie con los codos pegados al cuerpo.', 'Sube la barra sin balancear el tronco.', 'Baja controlando hasta extender los brazos.']],
  ['Curl con mancuernas alterno', 'BICEPS', ['ANTEBRAZOS'], 'MANCUERNAS', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Curl unilateral con giro de muñeca.', ['Sube una mancuerna girando la palma hacia arriba.', 'Aprieta el bíceps arriba un instante.', 'Baja y alterna con el otro brazo.']],
  ['Curl martillo', 'BICEPS', ['ANTEBRAZOS'], 'MANCUERNAS', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Curl con agarre neutro, trabaja también el antebrazo.', ['Palmas enfrentadas durante todo el recorrido.', 'Sube sin mover los codos.', 'Baja de forma controlada.']],
  ['Extensión de tríceps en polea', 'TRICEPS', [], 'POLEA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Aislamiento del tríceps.', ['Codos pegados al cuerpo.', 'Extiende los brazos hacia abajo.', 'Vuelve arriba sin separar los codos.']],
  ['Fondos en paralelas', 'TRICEPS', ['PECHO', 'HOMBROS'], 'PESO_CORPORAL', 'FUERZA', 'AVANZADO', 'SOLO_REPS', 'Empuje con el propio peso para tríceps y pecho.', ['Apoya las manos en las barras con los brazos extendidos.', 'Baja hasta que los codos formen unos 90 grados.', 'Empuja hasta extender los brazos.']],
  ['Press francés con barra Z', 'TRICEPS', [], 'BARRA', 'HIPERTROFIA', 'INTERMEDIO', 'PESO_REPS', 'Extensión de tríceps tumbado.', ['Tumbado, sujeta la barra con los brazos extendidos sobre el pecho.', 'Flexiona los codos llevando la barra hacia la frente.', 'Extiende de nuevo sin abrir los codos.']],
  // PIERNAS
  ['Sentadilla con barra', 'CUADRICEPS', ['GLUTEOS', 'ISQUIOTIBIALES', 'ABDOMEN'], 'BARRA', 'FUERZA', 'INTERMEDIO', 'PESO_REPS', 'Ejercicio base de fuerza para las piernas.', ['Barra sobre la espalda alta, pies a la anchura de los hombros.', 'Baja flexionando cadera y rodillas con la espalda neutra.', 'Sube empujando el suelo hasta extender las caderas.']],
  ['Sentadilla goblet', 'CUADRICEPS', ['GLUTEOS', 'ABDOMEN'], 'MANCUERNAS', 'FUERZA', 'PRINCIPIANTE', 'PESO_REPS', 'Sentadilla con carga al frente, ideal para aprender el patrón.', ['Sujeta una mancuerna contra el pecho.', 'Baja entre las rodillas manteniendo el pecho alto.', 'Sube empujando con todo el pie.']],
  ['Prensa de piernas', 'CUADRICEPS', ['GLUTEOS', 'ISQUIOTIBIALES'], 'MAQUINA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Empuje de piernas guiado.', ['Pies a la anchura de los hombros sobre la plataforma.', 'Baja hasta unos 90 grados de rodilla sin despegar la zona lumbar.', 'Empuja sin bloquear las rodillas.']],
  ['Zancadas con mancuernas', 'CUADRICEPS', ['GLUTEOS', 'ISQUIOTIBIALES'], 'MANCUERNAS', 'HIPERTROFIA', 'INTERMEDIO', 'PESO_REPS', 'Trabajo unilateral de piernas.', ['Da un paso largo al frente.', 'Baja hasta que ambas rodillas formen unos 90 grados.', 'Empuja con la pierna delantera para volver.']],
  ['Extensión de cuádriceps en máquina', 'CUADRICEPS', [], 'MAQUINA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Aislamiento del cuádriceps.', ['Ajusta el respaldo para que las rodillas queden alineadas con el eje.', 'Extiende las piernas sin dar tirones.', 'Baja de forma controlada.']],
  ['Curl femoral tumbado', 'ISQUIOTIBIALES', [], 'MAQUINA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Aislamiento de isquiotibiales.', ['Tumbado boca abajo, rodillas alineadas con el eje.', 'Flexiona las rodillas llevando los talones hacia los glúteos.', 'Baja despacio.']],
  ['Peso muerto rumano', 'ISQUIOTIBIALES', ['GLUTEOS', 'ESPALDA'], 'BARRA', 'FUERZA', 'INTERMEDIO', 'PESO_REPS', 'Bisagra de cadera para la cadena posterior.', ['Rodillas ligeramente flexionadas y espalda neutra.', 'Lleva la cadera hacia atrás bajando la barra pegada a las piernas.', 'Sube extendiendo la cadera.']],
  ['Puente de glúteo', 'GLUTEOS', ['ISQUIOTIBIALES'], 'PESO_CORPORAL', 'FUERZA', 'PRINCIPIANTE', 'SOLO_REPS', 'Activación de glúteos tumbado.', ['Tumbado con las rodillas flexionadas y los pies en el suelo.', 'Eleva la cadera apretando los glúteos.', 'Baja sin apoyar del todo.']],
  ['Hip thrust con barra', 'GLUTEOS', ['ISQUIOTIBIALES'], 'BARRA', 'HIPERTROFIA', 'INTERMEDIO', 'PESO_REPS', 'Ejercicio principal para el desarrollo del glúteo.', ['Apoya la espalda alta en un banco con la barra sobre la cadera.', 'Empuja con los talones hasta alinear rodillas, cadera y hombros.', 'Baja controlando.']],
  ['Elevación de talones de pie', 'GEMELOS', [], 'MAQUINA', 'HIPERTROFIA', 'PRINCIPIANTE', 'PESO_REPS', 'Trabaja los gemelos.', ['Apoya la parte delantera de los pies en el borde.', 'Sube sobre las puntas al máximo.', 'Baja hasta estirar el gemelo.']],
  ['Sentadilla búlgara', 'CUADRICEPS', ['GLUTEOS'], 'MANCUERNAS', 'HIPERTROFIA', 'AVANZADO', 'PESO_REPS', 'Sentadilla unilateral con el pie trasero elevado.', ['Apoya el empeine trasero en un banco.', 'Baja verticalmente con la pierna delantera.', 'Sube empujando con el talón delantero.']],
  // CORE
  ['Plancha', 'ABDOMEN', ['HOMBROS'], 'PESO_CORPORAL', 'CORE', 'PRINCIPIANTE', 'TIEMPO', 'Isométrico de estabilidad del core.', ['Apóyate en antebrazos y puntas de los pies.', 'Mantén el cuerpo recto sin hundir la cadera.', 'Respira con normalidad durante todo el tiempo.']],
  ['Plancha lateral', 'ABDOMEN', ['GLUTEOS'], 'PESO_CORPORAL', 'CORE', 'INTERMEDIO', 'TIEMPO', 'Isométrico para oblicuos.', ['Apoya un antebrazo y los pies apilados.', 'Eleva la cadera hasta formar una línea recta.', 'Mantén y cambia de lado.']],
  ['Crunch abdominal', 'ABDOMEN', [], 'PESO_CORPORAL', 'CORE', 'PRINCIPIANTE', 'SOLO_REPS', 'Flexión del tronco para el recto abdominal.', ['Tumbado con las rodillas flexionadas.', 'Eleva los hombros del suelo contrayendo el abdomen.', 'Baja despacio.']],
  ['Elevación de piernas colgado', 'ABDOMEN', ['ANTEBRAZOS'], 'PESO_CORPORAL', 'CORE', 'AVANZADO', 'SOLO_REPS', 'Core inferior con agarre en barra.', ['Cuélgate de la barra sin balancearte.', 'Eleva las piernas con control.', 'Baja despacio.']],
  ['Bicho muerto', 'ABDOMEN', [], 'PESO_CORPORAL', 'CORE', 'PRINCIPIANTE', 'SOLO_REPS', 'Control del core con movimiento de extremidades.', ['Tumbado con brazos y rodillas hacia el techo.', 'Extiende brazo y pierna contrarios sin despegar la zona lumbar.', 'Vuelve y alterna.']],
  ['Rueda abdominal', 'ABDOMEN', ['HOMBROS', 'ESPALDA'], 'OTRO', 'CORE', 'AVANZADO', 'SOLO_REPS', 'Core avanzado con rueda.', ['De rodillas, agarra la rueda.', 'Rueda hacia delante manteniendo el abdomen firme.', 'Vuelve sin hundir la zona lumbar.']],
  // CARDIO Y CUERPO COMPLETO
  ['Cinta de correr', 'CARDIO', ['CUADRICEPS', 'GEMELOS'], 'CARDIO_MAQUINA', 'CARDIO', 'PRINCIPIANTE', 'TIEMPO', 'Caminata o carrera continua.', ['Empieza con un calentamiento suave.', 'Ajusta velocidad e inclinación a tu nivel.', 'Termina con unos minutos de vuelta a la calma.']],
  ['Bicicleta estática', 'CARDIO', ['CUADRICEPS'], 'CARDIO_MAQUINA', 'CARDIO', 'PRINCIPIANTE', 'TIEMPO', 'Cardio de bajo impacto.', ['Ajusta la altura del sillín para extender casi del todo la pierna.', 'Mantén una cadencia constante.', 'Aumenta la resistencia de forma progresiva.']],
  ['Remo en máquina (ergómetro)', 'CARDIO', ['ESPALDA', 'CUADRICEPS'], 'CARDIO_MAQUINA', 'CARDIO', 'INTERMEDIO', 'TIEMPO', 'Cardio de cuerpo completo.', ['Empuja con las piernas, luego inclina el torso y tira con los brazos.', 'Vuelve en orden inverso.', 'Mantén un ritmo constante.']],
  ['Saltos de tijera', 'CUERPO_COMPLETO', ['GEMELOS'], 'PESO_CORPORAL', 'CARDIO', 'PRINCIPIANTE', 'TIEMPO', 'Calentamiento o cardio sin material.', ['Salta abriendo piernas y brazos a la vez.', 'Vuelve a la posición inicial.', 'Mantén un ritmo constante.']],
  ['Swing con kettlebell', 'CUERPO_COMPLETO', ['GLUTEOS', 'ISQUIOTIBIALES', 'HOMBROS'], 'KETTLEBELL', 'FUERZA', 'INTERMEDIO', 'PESO_REPS', 'Bisagra de cadera explosiva.', ['Lleva la cadera atrás y balancea la pesa entre las piernas.', 'Extiende la cadera con fuerza para lanzar la pesa al frente.', 'Deja que baje y repite sin flexionar la espalda.']],
  ['Burpees', 'CUERPO_COMPLETO', ['PECHO', 'CUADRICEPS'], 'PESO_CORPORAL', 'CARDIO', 'INTERMEDIO', 'SOLO_REPS', 'Ejercicio metabólico de cuerpo completo.', ['Baja a posición de flexión.', 'Recoge los pies y salta hacia arriba.', 'Aterriza suave y repite.']],
  // MOVILIDAD
  ['Estiramiento de isquiotibiales', 'ISQUIOTIBIALES', [], 'PESO_CORPORAL', 'MOVILIDAD', 'PRINCIPIANTE', 'TIEMPO', 'Estiramiento para la parte trasera del muslo.', ['Sentado con una pierna extendida.', 'Inclínate desde la cadera hasta notar tensión suave.', 'Mantén sin rebotar y cambia de pierna.']],
  ['Movilidad de cadera 90/90', 'GLUTEOS', ['CUADRICEPS'], 'PESO_CORPORAL', 'MOVILIDAD', 'INTERMEDIO', 'TIEMPO', 'Rotaciones de cadera.', ['Siéntate con ambas rodillas a 90 grados hacia un lado.', 'Inclina el torso sobre la pierna delantera.', 'Cambia de lado de forma controlada.']],
  ['Postura del gato-camello', 'ESPALDA', ['ABDOMEN'], 'PESO_CORPORAL', 'MOVILIDAD', 'PRINCIPIANTE', 'SOLO_REPS', 'Movilidad de columna.', ['A cuatro apoyos, redondea la espalda exhalando.', 'Después hunde la espalda inhalando.', 'Alterna con movimientos lentos.']],
];

export const CATALOGO_INICIAL: EjercicioSemilla[] = FILAS.map(
  ([nombre, musculoPrincipal, musculosSecundarios, equipamiento, categoria, nivel, tipoMedicion, descripcion, instrucciones]) => ({
    nombre, musculoPrincipal, musculosSecundarios, equipamiento, categoria, nivel, tipoMedicion, descripcion, instrucciones,
  }),
);
