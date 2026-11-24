import express from "express";
import validate from "../middlewares/validate.js";
import parseTextJson from "../middlewares/parseTextJson.js";
import { connectionLogSchema } from "../schemas/activitySchema.js";

/**
 * Factory de Router de Actividad (se monta en /api).
 * Necesita login: el tramo se guarda a nombre del usuario del token (la cookie viaja también con sendBeacon).
 */
function createActivityRouter(controller, { authenticate }) {
  const router = express.Router();

  // express.text() + parseTextJson: sendBeacon manda el JSON como texto plano
  router.post("/user-connection-log", authenticate, express.text(), parseTextJson, validate(connectionLogSchema), controller.connectionLog);

  return router;
}

export default createActivityRouter;
