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
const Viaje_Chofer = require("./viajes_choferes");
Rol.hasOne(Usuarios, { foreignKey: "Roles_idRol" });
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

Viaje.hasMany(Asiento, { foreignKey: "Viajes_idViaje" });
Asiento.belongsTo(Viaje, { foreignKey: "Viajes_idViaje" });

Detalle_Boletos.belongsTo(Viaje, { foreignKey: "Viajes_idViaje" });
Viaje.hasMany(Detalle_Boletos, { foreignKey: "Viajes_idViaje" });
Detalle_Boletos.belongsTo(Boleto, { foreignKey: "Boletos_idBoleto" });
Boleto.hasMany(Detalle_Boletos, { foreignKey: "Boletos_idBoleto" });
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
  Viaje_Chofer,
};
