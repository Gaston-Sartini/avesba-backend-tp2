// usecases/users/changePassword.js
import AppError from "../../errors/AppError.js";

async function changePassword(
  actor,
  { current_password, new_password },
  { usersDao, hasher },
) {
  // 1. Buscar al usuario por el id del actor (siempre es "mi" contraseña, nunca la de otro id)
  const user = await usersDao.getById(actor.id);
  if (!user) {
    throw new AppError(
      "USER_NOT_FOUND",
      `Usuario ${actor.id} no encontrado`,
      404,
    );
  }

  // 2. Traer las credenciales completas (con el hash) por email
  const credentials = await usersDao.getCredentialsByEmail(user.email);

  // 3. Verificar que current_password coincida con credentials.passwordHash (hasher.compare)
  // 4. Si no coincide, tirar un error (no es USER_NOT_FOUND — pensá un código distinto)

  const isMatch = await hasher.compare(
    current_password,
    credentials.passwordHash,
  );
  if (!isMatch) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      "Contraseña actual incorrecta",
      400,
    );
  }

  // 5. Hashear new_password (hasher.hash)
  const newHash = await hasher.hash(new_password);
  // 6. Guardar con usersDao.update(actor.id, { passwordHash: ..., updatedAt: Date.now() })
  await usersDao.update(actor.id, {
    passwordHash: newHash,
    updatedAt: Date.now(),
  });

  return { message: "Contraseña cambiada con éxito" };
}

export default changePassword;
