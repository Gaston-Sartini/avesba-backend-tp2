import registerUser from "./registerUser.js";
import loginUser from "./loginUser.js";
import refreshSession from "./refreshSession.js";

/**
 * Factory de Casos de Uso de Autenticación.
 * Recibe todas las dependencias juntas y devuelve los casos de uso "preconectados":
 * el controlador los llama solo con los datos del pedido.
 */
function makeAuthUseCases({ usersDao, hasher, tokens, loginAttempts, events, clock }) {
  return {
    register: (data) => registerUser(data, { usersDao, hasher, tokens, events, clock }),
    login: (credentials) => loginUser(credentials, { usersDao, hasher, tokens, loginAttempts, clock }),
    refresh: (refreshToken) => refreshSession(refreshToken, { usersDao, tokens }),
  };
}

export default makeAuthUseCases;
