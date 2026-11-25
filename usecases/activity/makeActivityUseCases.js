import logConnection from "./logConnection.js";

/**
 * Factory de Casos de Uso de Actividad.
 */
function makeActivityUseCases({ connectionLogsDao, events, clock }) {
  return {
    logConnection: (data, actor) => logConnection(data, actor, { connectionLogsDao, events, clock }),
  };
}

export default makeActivityUseCases;
