const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class Permiso extends Model {}

Permiso.init(
  {
    idPermiso: {
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
    modelName: "permisos",
  }
);
module.exports = Permiso;
