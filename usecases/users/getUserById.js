import AppError from "../../errors/AppError.js";

async function getUserById(id, actor, { usersDao }) {
  const user = await usersDao.getById(id);

  if (!user) {
    throw new AppError("USER_NOT_FOUND", `Usuario ${id} no encontrado`, 404);
  }

  if (actor.role === "jugador" && actor.id !== user.id) {
    throw new AppError(
      "FORBIDDEN",
      "No tenés permisos para ver este usuario",
      403,
    );
  }

  return user;
}

export default getUserById;
