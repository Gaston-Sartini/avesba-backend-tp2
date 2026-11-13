import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../connection/index.js";

class GameResultModel extends Model {}

GameResultModel.init({
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
   session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
   },
   ave_id: {
    type: DataTypes.INTEGER,
    allowNull: false
   },
   ave_nombre: {
    type: DataTypes.STRING,
    allowNull: false
   },
   respuesta_usuario: {
    type: DataTypes.STRING,
    allowNull: false
   },
   es_correcta: {
    type: DataTypes.BOOLEAN,
    allowNull: false
   },
   puntos_obtenidos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
   },
   bonus_racha: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
   },
   streak_en_respuesta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
   },
   createdAt: {
    type: DataTypes.INTEGER,
    allowNull: false,
   }
},
{
    sequelize,
    modelName: "GameResult",
    tableName: "game_results",
    timestamps: false
});

export default GameResultModel;