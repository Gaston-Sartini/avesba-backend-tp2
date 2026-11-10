import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../connection/index.js";

class UserModel extends Model {}

UserModel.init(
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },

    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
      defaultValue: "jugador",
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    createdAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    updatedAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    lastLogin: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },

  { sequelize, modelName: "User", timestamps: false, tableName: "users" },
);

export default UserModel;
