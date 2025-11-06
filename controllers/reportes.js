const reportesRouter = require("express").Router();
require("express-async-errors");
const { Op } = require("sequelize");
const { Boleto, Viaje, Detalle_Boleto, Usuarios } = require("../models");

reportesRouter.get("/viaje/:idviaje", async (request, response) => {
  const { idviaje } = request.params;
  const Detalle = await Detalle_Boleto.findAll({
    where: { Viajes_idViaje: idviaje },
  });
  const uniqueBoletos = [
    ...new Set(Detalle.map((det) => det.Boletos_idBoleto)),
  ];
  const boletos = await Boleto.findAll({
    where: { idBoleto: uniqueBoletos },
    include: [
      { model: Detalle_Boleto },
      {
        model: Usuarios,
        attributes: ["nombre", "apellido"],
      },
    ],
  });
  response.json(boletos);
});
reportesRouter.post("/fechas", async (request, response) => {
  const { fechaInicio, fechaFin } = request.body;
  const boletos = await Boleto.findAll({
    where: {
      fecha: {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
      },
    },
    include: [
      { model: Detalle_Boleto },
      {
        model: Usuarios,
        attributes: ["nombre", "apellido"],
      },
    ],
  });
  response.json(boletos);
});

// Reporte de viajes con estadísticas
reportesRouter.post("/viajes", async (request, response) => {
  const { fechaInicio, fechaFin } = request.body;

  const whereClause = {};
  if (fechaInicio && fechaFin) {
    whereClause.fechaViaje = {
      [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
    };
  }

  const viajes = await Viaje.findAll({
    where: whereClause,
    include: [
      {
        model: Detalle_Boleto,
        include: [{ model: Boleto }],
      },
    ],
  });

  // Calcular estadísticas por viaje
  const reporteViajes = viajes.map((viaje) => {
    const boletos = viaje.detalle_boletos || [];
    const totalVentas = boletos.reduce((sum, det) => {
      return sum + Number(det.boleto?.total || 0);
    }, 0);
    const asientosVendidos = boletos.length;

    return {
      idViaje: viaje.idViaje,
      origen: viaje.origen,
      destino: viaje.destino,
      fechaViaje: viaje.fechaViaje,
      asientosVendidos,
      totalVentas: Number(totalVentas.toFixed(2)),
      cantidadBoletos: [...new Set(boletos.map((b) => b.Boletos_idBoleto))]
        .length,
    };
  });

  response.json(reporteViajes);
});

// Reporte de usuarios con ventas
reportesRouter.post("/usuarios", async (request, response) => {
  const { fechaInicio, fechaFin } = request.body;

  const whereClause = {};
  if (fechaInicio && fechaFin) {
    whereClause.fecha = {
      [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
    };
  }

  const usuarios = await Usuarios.findAll({
    include: [
      {
        model: Boleto,
        where: whereClause,
        required: false,
      },
    ],
  });

  // Calcular estadísticas por usuario
  const reporteUsuarios = usuarios
    .map((usuario) => {
      const boletos = usuario.boletos || [];
      const totalVentas = boletos.reduce((sum, boleto) => {
        return sum + Number(boleto.total || 0);
      }, 0);
      const cantidadBoletos = boletos.length;

      return {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        user: usuario.user,
        cantidadBoletos,
        totalVentas: Number(totalVentas.toFixed(2)),
        estado: usuario.estado,
      };
    })
    .filter((u) => u.cantidadBoletos > 0 || !fechaInicio); // Filtrar solo usuarios con ventas si hay rango de fechas

  response.json(reporteUsuarios);
});

module.exports = reportesRouter;
