import AppError from "../../errors/AppError.js";
import EVENTS from "../../events/eventNames.js";

// El fin de un tramo puede estar hasta 1 minuto en el futuro (relojes un poco desfasados)
const TOLERANCIA_RELOJ_MS = 60 * 1000;

/**
 * Caso de Uso: Guardar un tramo de tiempo conectado del jugador logueado.
 * Reglas de negocio:
 *  - inicioMs, finMs y registroId van los tres juntos o ninguno. Si vienen, el tramo tiene que
 *    ser coherente (fin - inicio = tiempoConectado) y no puede terminar en el futuro.
 *  - Reintentos sin duplicar: si ya existe ese registroId con el mismo tramo, no se guarda de nuevo.
 *    Si existe con OTRO tramo, es un error (409).
 * Efecto secundario desacoplado: emite "user.disconnected".
 */
async function logConnection({ tiempoConectado, inicioMs, finMs, registroId }, actor, { connectionLogsDao, events }) {
  const conTramo = [inicioMs, finMs, registroId].some((valor) => valor !== undefined);
  if (conTramo) {
    const completo = inicioMs !== undefined && finMs !== undefined && registroId !== undefined;
    if (!completo || finMs - inicioMs !== tiempoConectado || finMs > Date.now() + TOLERANCIA_RELOJ_MS) {
      throw new AppError("INVALID_INTERVAL", "Intervalo de conexión inválido", 400);
    }

    const existente = await connectionLogsDao.getByRegistro(actor.id, registroId);
    if (existente) {
      const mismoTramo = existente.inicio_ms === inicioMs && existente.fin_ms === finMs;
      if (!mismoTramo) {
        throw new AppError("REGISTRO_DUPLICATED", "registroId ya utilizado para otro intervalo", 409);
      }
      return { status: "ok", tiempo_conectado_ms: tiempoConectado };
    }
  }

  await connectionLogsDao.save({
    user_id: actor.id,
    registro_id: registroId ?? null,
    inicio_ms: inicioMs ?? null,
    fin_ms: finMs ?? null,
    tiempo_conectado_ms: tiempoConectado,
    createdAt: Date.now(),
  });

  events.emit(EVENTS.USER_DISCONNECTED, { userId: actor.id, tiempoConectado });

  return { status: "ok", tiempo_conectado_ms: tiempoConectado };
}

export default logConnection;
