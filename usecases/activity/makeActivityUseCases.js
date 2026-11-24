import logConnection from "./logConnection.js";

/**
 * Factory de Casos de Uso de Actividad.
 */
function makeActivityUseCases({ connectionLogsDao, events }) {
  return {
    logConnection: (data, actor) => logConnection(data, actor, { connectionLogsDao, events }),
  };
}

export default makeActivityUseCases;
