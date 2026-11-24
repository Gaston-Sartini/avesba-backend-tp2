import buildRanking, { buildPlayerRow } from "./buildRanking.js";

/**
 * Caso de Uso: Ranking paginado.
 * Devuelve una página (`limit` jugadores a partir de `offset`), cuántos jugadores tienen puesto
 * en total (para armar la paginación) y la fila del jugador logueado (`jugador_actual`),
 * así el front le muestra su posición aunque no esté en la página que está mirando.
 */
async function getRanking({ limit, offset = 0 }, actor, { usersDao, gameResultsDao }) {
  const users = await usersDao.getAll();
  const respuestas = await gameResultsDao.getAll();

  const ranking = buildRanking(users, respuestas);
  const yo = users.find((user) => user.id === actor.id);

  return {
    total_jugadores: ranking.length,
    ranking: ranking.slice(offset, offset + limit),
    jugador_actual: yo ? buildPlayerRow(yo, respuestas, ranking) : null,
  };
}

export default getRanking;
