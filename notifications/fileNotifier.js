import { appendFile } from "node:fs/promises";
import { NOTIFICATIONS_LOG_PATH } from "../config/config.js";

/**
 * Notificador a archivo (por defecto notifications.log; se cambia con NOTIFICATIONS_LOG_PATH).
 * Tiene la misma firma que consoleNotifier: el listener de alertas depende solo del contrato
 * notify({ subject, body }), por eso no necesita cambiar al pasar de un notificador a otro.
 */
const fileNotifier = {
  async notify({ subject, body }) {
    const line = `${new Date().toISOString()} | ${subject} | ${body}\n`;
    await appendFile(NOTIFICATIONS_LOG_PATH, line);
  },
};

export default fileNotifier;
