const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class Rol extends Model {}

Rol.init(
  {
    idRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo nombre no puede ser nulo",
        },
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "roles",
  }
);
module.exports = Rol;
