import getProfile from "./getProfile.js";
import getUserById from "./getUserById.js";
import listUsers from "./listUsers.js";
import createUser from "./createUser.js";
import updateUser from "./updateUser.js";
import deleteUser from "./deleteUser.js";
import changePassword from "./changePassword.js";
import resetPassword from "./resetPassword.js";

/**
 * Factory de Casos de Uso de Usuarios.
 * `actor` es el usuario logueado ({ id, role }) que el controlador saca de req.user.
 */
function makeUserUseCases({ usersDao, gameSessionsDao, gameResultsDao, connectionLogsDao, hasher, events, clock }) {
  return {
    getProfile: (actor) => getProfile(actor, { usersDao }),
    getUserById: (id, actor) => getUserById(id, actor, { usersDao }),
    listUsers: (filters) => listUsers(filters, { usersDao }),
    createUser: (data) => createUser(data, { usersDao, hasher, events, clock }),
    updateUser: (id, changes) => updateUser(id, changes, { usersDao, clock }),
    deleteUser: (id, actor) => deleteUser(id, actor, { usersDao, gameSessionsDao, gameResultsDao, connectionLogsDao }),
    changePassword: (actor, data) => changePassword(actor, data, { usersDao, hasher, clock }),
    resetPassword: (id) => resetPassword(id, { usersDao, hasher, clock }),
  };
}

export default makeUserUseCases;
