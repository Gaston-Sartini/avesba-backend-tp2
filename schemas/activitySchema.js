import { z } from "zod";

// Tope por tramo: 24 h. Evita guardar valores absurdos si el cliente manda cualquier cosa.
const MAX_TIEMPO_CONECTADO_MS = 24 * 60 * 60 * 1000;

const ms = (campo) => z.number({ error: `${campo} debe ser un número` }).int(`${campo} debe ser un entero (milisegundos)`);

// Body de POST /api/user-connection-log (lo manda el front al cerrar sesión o la pestaña).
// inicioMs, finMs y registroId son opcionales, pero van los tres juntos (lo revisa el caso de uso).
// El userId que mande el cliente se ignora: el dueño del tramo es siempre el usuario logueado.
const connectionLogSchema = z.object({
  tiempoConectado: ms("tiempoConectado")
    .nonnegative("tiempoConectado no puede ser negativo")
    .max(MAX_TIEMPO_CONECTADO_MS, "tiempoConectado no puede superar las 24 horas"),
  inicioMs: ms("inicioMs").nonnegative("inicioMs no puede ser negativo").optional(),
  finMs: ms("finMs").nonnegative("finMs no puede ser negativo").optional(),
  registroId: z.string().min(1, "registroId no puede estar vacío").max(128, "registroId es demasiado largo").optional(),
});

export { MAX_TIEMPO_CONECTADO_MS, connectionLogSchema };
