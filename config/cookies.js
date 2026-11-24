import { IS_PRODUCTION, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS } from "./config.js";

/**
 * Configuración de las cookies donde viajan los tokens.
 * El front de AvesBA hace fetch con `credentials: "include"`: no manda el header Authorization,
 * así que el token tiene que ir en una cookie que el navegador envía solo.
 *
 * - httpOnly: JavaScript del navegador NO puede leerla (protege contra robo por XSS).
 * - secure: solo viaja por HTTPS (en desarrollo usamos http, por eso solo en producción).
 * - sameSite: cuándo la manda el navegador si el pedido viene de otro sitio.
 *   En desarrollo, "lax": el front y la API están los dos en localhost (mismo sitio).
 *   En producción el front y la API están en dominios distintos: con "strict" o "lax" el navegador
 *   no mandaría la cookie, así que va "none", que obliga a usar secure (HTTPS). Lo que evita que otra
 *   página use la sesión es CORS: solo los orígenes permitidos reciben respuesta con credenciales.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "lax",
  path: "/",
};

// Express espera maxAge en milisegundos
const ACCESS_COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRE_MINUTES * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000;

export { COOKIE_OPTIONS, ACCESS_COOKIE_MAX_AGE, REFRESH_COOKIE_MAX_AGE };
