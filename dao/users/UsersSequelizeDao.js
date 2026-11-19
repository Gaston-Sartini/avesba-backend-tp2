import UserModel from "../models/UserModel.js";
import AppError from "../../errors/AppError.js";    

class UsersSequelizeDao {

async getAll({ role, is_active, page = 1, limit } = {}) {
  try {
    const where = {};
    if (role !== undefined) where.role = role;
    if (is_active !== undefined) where.is_active = is_active;

    const options = {
  where,
  attributes: ["id","nombre", "apellido", "email", "role", "is_active", "createdAt", "updatedAt", "lastLogin"],
  order: [["id", "ASC"]],
};
    if (limit) {
      options.limit = limit;
      options.offset = (page - 1) * limit;
    }
    const users = await UserModel.findAll(options);
return users.map((u) => u.get({ plain: true }));
  } catch (error) {
    throw new AppError("USERS_FETCH_FAILED", "No se pudieron obtener los usuarios", 500, error);
  }
}

  async count({ role, is_active } = {}) {
    try {
      const where = {};
      if (role !== undefined) where.role = role;
      if (is_active !== undefined) where.is_active = is_active;
      return await UserModel.count({ where });
    } catch (error) {
     throw new AppError("USERS_COUNT_FAILED", "No se pudo contar los usuarios", 500, error);
    }
  }

  async getById(id) {
  try {
    const user = await UserModel.findByPk(id, {
      attributes: ["id","nombre", "apellido", "email", "role", "is_active", "createdAt", "updatedAt", "lastLogin"],
    });
    return user ? user.get({ plain: true }) : null;
  } catch (error) {
    throw new AppError("USER_FETCH_FAILED", "No se pudo obtener el usuario", 500, error);
  }
}

  async getByEmail(email) {
  try {
    const user = await UserModel.findOne({
      where: { email },
      attributes: ["id","nombre", "apellido", "email", "role", "is_active", "createdAt", "updatedAt", "lastLogin"],
    });
    return user ? user.get({ plain: true }) : null;
  } catch (error) {
    throw new AppError("USER_FETCH_FAILED", "No se pudo buscar el usuario por email", 500, error);
  }
}

  async getCredentialsByEmail(email) {
  try {
    const user = await UserModel.findOne({
      where: { email },
    });
    return user ? user.get({ plain: true }) : null;
  } catch (error) {
    throw new AppError("USER_FETCH_FAILED", "No se pudo buscar el usuario por email", 500, error);
  }
}

  async save(data) {
    try {
      const { id, ...userData } = data;
      const newUser = await UserModel.create(userData);
      const plain = newUser.dataValues;
      const { passwordHash, ...safeUser } = plain;
      return safeUser;
    } catch (error) {
      throw new AppError("USER_CREATION_FAILED", "No se pudo crear el usuario", 500, error);    
    }
  }

  async update(id, changes) {
  try {
    const instance = await UserModel.findByPk(id);
    if (!instance) {
      return null; 
    }
    const { id: ignoredId, ...allowedChanges } = changes; 
    await instance.update(allowedChanges);
    const plain = instance.dataValues;
    const { passwordHash, ...safeUser } = plain;
    return safeUser;
  } catch (error) {
    throw new AppError("USER_UPDATE_FAILED", "No se pudo actualizar el usuario", 500, error);
  }
}

async delete(id) {
  try {
    const cantidadBorrada = await UserModel.destroy({ where: { id } });
    return cantidadBorrada > 0; // Devuelve true si se eliminó al menos un usuario
  } catch (error) {
    throw new AppError("USER_DELETE_FAILED", "No se pudo eliminar el usuario", 500, error);
  }
}
}   

export { UsersSequelizeDao };
export default UsersSequelizeDao;