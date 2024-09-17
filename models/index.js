const Usuarios = require("./usuarios");
const Rol = require("./roles");
const Permiso = require("./permisos");
const Rol_Permiso = require("./roles_permisos");
const Chofer = require("./choferes");
const Oficina = require("./oficinas");
const Bus = require("./buses");
const Viaje = require("./viajes");
const Asiento = require("./asientos");
const Detalle_Boletos = require("./detalle_boletos");
const Boleto = require("./boletos");
Usuarios.belongsTo(Rol, { foreignKey: "Roles_idRol" });
Rol.hasOne(Usuarios, { foreignKey: "idRol" });
Rol.hasMany(Rol_Permiso, { foreignKey: "Roles_idRol" });
Rol_Permiso.belongsTo(Rol, { foreignKey: "Roles_idRol" });
Permiso.hasMany(Rol_Permiso, { foreignKey: "Permisos_idPermiso" });
Rol_Permiso.belongsTo(Permiso, { foreignKey: "Permisos_idPermiso" });
Viaje.belongsTo(Bus, { foreignKey: "Buses_idBus" });
Bus.hasMany(Viaje, { foreignKey: "idBus" });
Viaje.belongsTo(Oficina, { foreignKey: "Oficinas_idOficina" });
Oficina.hasMany(Viaje, { foreignKey: "idOficina" });
Viaje.belongsTo(Chofer, { foreignKey: "Choferes_idChofer" });
Chofer.hasMany(Viaje, { foreignKey: "idChofer" });
Asiento.belongsTo(Viaje, { foreignKey: "Viajes_idViaje" });
Viaje.hasMany(Asiento, { foreignKey: "idViaje" });
Detalle_Boletos.belongsTo(Viaje, { foreignKey: "Viajes_idViaje" });
Viaje.hasMany(Detalle_Boletos, { foreignKey: "idViaje" });
Detalle_Boletos.belongsTo(Boleto, { foreignKey: "Boletos_idBoleto" });
Boleto.hasMany(Detalle_Boletos, { foreignKey: "idBoleto" });
module.exports = {
  Usuarios,
  Rol,
  Permiso,
  Rol_Permiso,
  Chofer,
  Oficina,
  Bus,
  Viaje,
  Asiento,
  Detalle_Boletos,
  Boleto,
};
