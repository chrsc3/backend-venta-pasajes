const Usuarios = require("./usuarios");
const Rol = require("./roles");
const Permiso = require("./permisos");
const Rol_Permiso = require("./roles_permisos");
const Chofer = require("./choferes");
const Oficina = require("./oficinas");
const Bus = require("./buses");
const Viaje = require("./viajes");
const AsientoPa = require("./asientospa");
const AsientoPb = require("./asientospb");
const Detalle_Boleto = require("./detalle_boletos");
const Boleto = require("./boletos");
const Pago = require("./pagos");
const Viaje_Chofer = require("./viajes_choferes");
Rol.hasMany(Usuarios, { foreignKey: "Roles_idRol" });
Usuarios.belongsTo(Rol, { foreignKey: "Roles_idRol" });

Rol.hasMany(Rol_Permiso, { foreignKey: "Roles_idRol" });
Rol_Permiso.belongsTo(Rol, { foreignKey: "Roles_idRol" });

Permiso.hasMany(Rol_Permiso, { foreignKey: "Permisos_idPermiso" });
Rol_Permiso.belongsTo(Permiso, { foreignKey: "Permisos_idPermiso" });

Bus.hasMany(Viaje, { foreignKey: "Buses_idBus" });
Viaje.belongsTo(Bus, { foreignKey: "Buses_idBus" });

Oficina.hasMany(Viaje, { foreignKey: "Oficinas_idOficina" });
Viaje.belongsTo(Oficina, { foreignKey: "Oficinas_idOficina" });

Viaje.hasMany(Viaje_Chofer, { foreignKey: "Viajes_idViaje" });
Viaje_Chofer.belongsTo(Viaje, { foreignKey: "Viajes_idViaje" });
Chofer.hasMany(Viaje_Chofer, { foreignKey: "Choferes_idChofer" });
Viaje_Chofer.belongsTo(Chofer, { foreignKey: "Choferes_idChofer" });

Viaje.hasMany(AsientoPa, { foreignKey: "Viajes_idViaje" });
AsientoPa.belongsTo(Viaje, { foreignKey: "Viajes_idViaje" });

Viaje.hasMany(AsientoPb, { foreignKey: "Viajes_idViaje" });
AsientoPb.belongsTo(Viaje, { foreignKey: "Viajes_idViaje" });

Detalle_Boleto.belongsTo(Viaje, { foreignKey: "Viajes_idViaje" });
Viaje.hasMany(Detalle_Boleto, { foreignKey: "Viajes_idViaje" });
Detalle_Boleto.belongsTo(Boleto, { foreignKey: "Boletos_idBoleto" });
Boleto.hasMany(Detalle_Boleto, { foreignKey: "Boletos_idBoleto" });
Boleto.belongsTo(Usuarios, { foreignKey: "Usuarios_idUsuario" });
Usuarios.hasMany(Boleto, { foreignKey: "Usuarios_idUsuario" });
// Pagos relationships
Boleto.hasMany(Pago, { foreignKey: "Boletos_idBoleto" });
Pago.belongsTo(Boleto, { foreignKey: "Boletos_idBoleto" });
Usuarios.hasMany(Pago, { foreignKey: "Usuarios_idUsuario" });
Pago.belongsTo(Usuarios, { foreignKey: "Usuarios_idUsuario" });
module.exports = {
  Usuarios,
  Rol,
  Permiso,
  Rol_Permiso,
  Chofer,
  Oficina,
  Bus,
  Viaje,
  AsientoPa,
  AsientoPb,
  Detalle_Boleto,
  Boleto,
  Pago,
  Viaje_Chofer,
};
