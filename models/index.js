const Usuarios = require("./usuarios");
const Rol = require("./roles");
const Permiso = require("./permisos");
const Rol_Permiso = require("./roles_permisos");
Usuarios.belongsTo(Rol, { foreignKey: "Roles_idRol" });
Rol.hasOne(Usuarios, { foreignKey: "Roles_idRol" });
Rol.hasMany(Rol_Permiso, { foreignKey: "Roles_idRol" });
Rol_Permiso.belongsTo(Rol, { foreignKey: "Roles_idRol" });
Permiso.hasMany(Rol_Permiso, { foreignKey: "Permisos_idPermiso" });
Rol_Permiso.belongsTo(Permiso, { foreignKey: "Permisos_idPermiso" });
module.exports = {
  Usuarios,
  Rol,
  Permiso,
  Rol_Permiso,
};
