"use client";
import GestionEntrenamiento from "@/components/fitness/GestionEntrenamiento";

// La gestión de rutinas del entrenador vive en el módulo fitness (plantillas, asignaciones, progreso y catálogo).
export default function RutinasEntrenadorTab() {
  return <GestionEntrenamiento rol="ENTRENADOR" />;
}
