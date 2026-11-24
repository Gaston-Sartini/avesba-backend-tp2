import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./middlewares/logger.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import { CORS_ORIGIN } from "./config/config.js";
import buildContainer from "./container/container.js";
import createDocsRouter from "./docs/swagger.js";

// http://localhost o http://127.0.0.1, con cualquier puerto (o sin puerto)
const LOCALHOST_CUALQUIER_PUERTO = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Arma la aplicación Express completa, pero SIN ponerla a escuchar en un puerto.
 * Está separada de index.js para que los tests puedan crear una app nueva cuando quieran.
 */
async function createApp(overrides = {}) {
  const app = express();

  // Middlewares globales — el orden es el orden de ejecución
  // CORS: el front corre en otro origen. Se aceptan los de CORS_ORIGIN y cualquier puerto de localhost
  // (Vite a veces cambia de puerto). `credentials: true` deja pasar las cookies, por eso no se puede usar "*".
  app.use(cors({ origin: [...CORS_ORIGIN, LOCALHOST_CUALQUIER_PUERTO], credentials: true }));
  app.use(logger);
  app.use(express.json());
  app.use(cookieParser()); // deja las cookies del pedido en req.cookies

  // Documentación Swagger en /api-docs (pública)
  app.use(createDocsRouter());

  // Todas las rutas salen del Composition Root (Container)
  app.use(await buildContainer(overrides));

  // Cierre de la fila: primero el 404, después el manejador de errores
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
