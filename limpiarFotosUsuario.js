// limpiarFotosUsuario.js
const { createClient } = require('@supabase/supabase-js');

// Reemplaza estos valores con los de tu proyecto Supabase
const SUPABASE_URL = 'https://yrhjeqezlmzpckjyhhuf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGplcWV6bG16cGNranloaHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjg5NTI2NywiZXhwIjoyMDQyNDcxMjY3fQ.-GWnmSY5l3cHbrMw00N91CvugppMOE_kquMA36pYOZ8'; // ¡NO uses el anon key! Usa el service_role key (lo encuentras en la configuración de tu proyecto Supabase)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Datos del usuario (ajusta estos valores)
const username = 'Abel valdes araujo';
const fotoValida = 'Abel valdes araujo-1736779755379.jpg'; // Solo el nombre del archivo, no la URL completa
const bucket = 'profile-images';
const carpeta = 'public'; // Si tus fotos están en profile-images/public/

async function limpiarFotosDuplicadasUsuario() {
  // 1. Listar todos los archivos en la carpeta del bucket
  const { data: files, error } = await supabase.storage.from(bucket).list(carpeta, { limit: 1000 });
  if (error) {
    console.error('Error al listar archivos:', error);
    return;
  }

  // 2. Filtrar archivos que pertenecen al usuario
  const archivosUsuario = files.filter(file => file.name.startsWith(username));
  console.log('Archivos encontrados para el usuario:', archivosUsuario.map(f => f.name));

  // 3. Eliminar los archivos que NO sean la foto válida
  for (const archivo of archivosUsuario) {
    if (archivo.name !== fotoValida) {
      const { error: deleteError } = await supabase.storage.from(bucket).remove([`${carpeta}/${archivo.name}`]);
      if (deleteError) {
        console.error(`Error al eliminar ${archivo.name}:`, deleteError);
      } else {
        console.log(`Eliminado: ${archivo.name}`);
      }
    }
  }
}

limpiarFotosDuplicadasUsuario();