const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class Permiso_Rol extends Model {}

Permiso_Rol.init(
  {
    Roles_idRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    Permisos_idPermiso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "roles_has_permisos",
  }
);
module.exports = Permiso_Rol;
