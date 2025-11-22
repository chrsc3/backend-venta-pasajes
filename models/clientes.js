const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../utils/db");

class Cliente extends Model {}

Cliente.init(
  {
    idCliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notNull: { msg: "El campo nombre no puede ser nulo" } },
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ci: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notNull: { msg: "El campo ci no puede ser nulo" } },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: { msg: "Formato de email inválido" } },
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "activo",
      validate: {
        notNull: { msg: "El campo estado no puede ser nulo" },
        isIn: { args: [["activo", "inactivo"]], msg: "Estado inválido" },
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "clientes",
  }
);

module.exports = Cliente;
