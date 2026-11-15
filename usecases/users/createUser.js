// usecases/users/createUser.js
import AppError from "../../errors/AppError.js";
import EVENTS from "../../events/eventNames.js";

async function createUser(data, { usersDao, hasher, events }) {
  const existingUser = await usersDao.getByEmail(data.email);
  if (existingUser) {
    throw new AppError(
      "EMAIL_DUPLICATED",
      `El email ${data.email} ya está en uso`,
      409,
    );
  }

  const { password, role = "jugador", ...rest } = data;
  const passwordHash = await hasher.hash(password);
  const now = Date.now();

  const user = await usersDao.save({
    ...rest,
    role,
    passwordHash,
    is_active: true,
    createdAt: now,
    updatedAt: now,
    lastLogin: null,
  });

  events.emit(EVENTS.USER_REGISTERED, {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
  });

  return user;
}

export default createUser;
