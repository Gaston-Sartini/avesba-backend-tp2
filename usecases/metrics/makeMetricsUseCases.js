import getUserMetrics from "./getUserMetrics.js";
import getGlobalMetrics from "./getGlobalMetrics.js";

/**
 * Factory de Casos de Uso de Métricas.
 */
function makeMetricsUseCases({ usersDao, gameResultsDao, connectionLogsDao }) {
  return {
    getUserMetrics: (actor) => getUserMetrics(actor, { usersDao, gameResultsDao, connectionLogsDao }),
    getGlobalMetrics: () => getGlobalMetrics({ gameResultsDao }),
  };
}

export default makeMetricsUseCases;
