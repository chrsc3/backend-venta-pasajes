const { DataTypes, Model } = require("sequelize");

const { sequelize } = require("../utils/db");

class Usuarios extends Model {}

Usuarios.init(
  {
    idUsuario: {
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
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo apellido no puede ser nulo",
        },
      },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo telefono no puede ser nulo",
        },
      },
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo direccion no puede ser nulo",
        },
      },
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo usuario no puede ser nulo",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo password no puede ser nulo",
        },
      },
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo estado no puede ser nulo",
        },
      },
    },
    Roles_idRol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "El campo Roles_idROl no puede ser nulo",
        },
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "usuarios",
  }
);
module.exports = Usuarios;
