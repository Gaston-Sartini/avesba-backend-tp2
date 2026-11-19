import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../connection/index.js";

class GameSessionModel extends Model {}

GameSessionModel.init({
   id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
   },
   user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
   },
   estado: {
    type: DataTypes.STRING,
    defaultValue: "activa",
    allowNull: false,
    validate: {
        isIn: { args: [["activa", "terminada"]], msg: "El estado debe ser 'activa' o 'terminada'"},
    }
   },
   preguntas: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
   },
   place_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
   },
   locale: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
   },
   streak_actual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
   },
   streak_maximo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
   },
   puntos_totales: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
   },
   total_intentos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
   },
   total_aciertos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
   },   
   createdAt: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   terminadaAt: {
    type: DataTypes.INTEGER,
    allowNull: true,
   }
},
{
    sequelize,
    modelName: "GameSession",
    tableName: "game_sessions",
    timestamps: false,
});

export default GameSessionModel;