// Simple UUID generator for our form builder
export function generateId() {
  return "id_" + Math.random().toString(36).substring(2, 11);
}
