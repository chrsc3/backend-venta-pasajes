const Usuarios = require("./usuarios");
const Rol = require("./roles");
const Permiso = require("./permisos");
const Rol_Permiso = require("./roles_permisos");
const Chofer = require("./choferes");
const Ciudad = require("./ciudades");
const Oficina = require("./oficinas");
const Bus = require("./buses");
Usuarios.belongsTo(Rol, { foreignKey: "Roles_idRol" });
Rol.hasOne(Usuarios, { foreignKey: "idRol" });
Rol.hasMany(Rol_Permiso, { foreignKey: "Roles_idRol" });
Rol_Permiso.belongsTo(Rol, { foreignKey: "Roles_idRol" });
Permiso.hasMany(Rol_Permiso, { foreignKey: "Permisos_idPermiso" });
Rol_Permiso.belongsTo(Permiso, { foreignKey: "Permisos_idPermiso" });
Oficina.belongsTo(Ciudad, { foreignKey: "Ciudades_idCiudad" });
Ciudad.hasMany(Oficina, { foreignKey: "idCiudad" });

module.exports = {
  Usuarios,
  Rol,
  Permiso,
  Rol_Permiso,
  Chofer,
  Ciudad,
  Oficina,
  Bus,
};
