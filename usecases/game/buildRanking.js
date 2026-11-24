import { puntosDe } from "./gameRules.js";

// Suma las respuestas de cada usuario: { puntos, aciertos, intentos }
function acumularPorUsuario(respuestas) {
  const porUsuario = new Map();
  for (const r of respuestas) {
    const acumulado = porUsuario.get(r.user_id) ?? { puntos: 0, aciertos: 0, intentos: 0 };
    acumulado.puntos += puntosDe(r);
    acumulado.aciertos += r.es_correcta ? 1 : 0;
    acumulado.intentos += 1;
    porUsuario.set(r.user_id, acumulado);
  }
  return porUsuario;
}

// La fila de un jugador, todavía sin posición
function filaDe(user, { puntos, aciertos, intentos } = { puntos: 0, aciertos: 0, intentos: 0 }) {
  return {
    user_id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    puntos_totales: puntos,
    aciertos,
    fallos: intentos - aciertos,
  };
}

/**
 * Arma el ranking completo a partir de los usuarios y TODAS las respuestas.
 * Función pura: la usan el ranking y las métricas del jugador (para saber su posición).
 * Solo entran los que tienen puntos, igual que el backend de Python: quien no sumó nada no tiene puesto.
 * Orden: más puntos primero; si empatan, más aciertos; si siguen empatados, el usuario más viejo.
 * Cada fila lleva su `posicion` (1, 2, 3...).
 */
function buildRanking(users, respuestas) {
  const porUsuario = acumularPorUsuario(respuestas);

  return users
    .map((user) => filaDe(user, porUsuario.get(user.id)))
    .filter((jugador) => jugador.puntos_totales > 0)
    .sort((a, b) => b.puntos_totales - a.puntos_totales || b.aciertos - a.aciertos || a.user_id - b.user_id)
    .map((jugador, i) => ({ ...jugador, posicion: i + 1 }));
}

/**
 * La fila de UN jugador con su posición: la que tiene en el ranking, o `null` si todavía no sumó puntos.
 * Sirve para mostrarle su lugar aunque no esté en la página que está mirando.
 */
function buildPlayerRow(user, respuestas, ranking) {
  const enRanking = ranking.find((jugador) => jugador.user_id === user.id);
  if (enRanking) return enRanking;

  const propias = respuestas.filter((r) => r.user_id === user.id);
  return { ...filaDe(user, acumularPorUsuario(propias).get(user.id)), posicion: null };
}

export { buildPlayerRow };
export default buildRanking;
