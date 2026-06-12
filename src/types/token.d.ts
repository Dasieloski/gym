export interface Token {
  id: string;
  rol: 'CLIENTE' | 'ENTRENADOR' | 'ADMIN' | 'CLIENTEESPERA';
  // otros campos si es necesario
}