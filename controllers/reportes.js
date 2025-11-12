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
    where: {
      idBoleto: uniqueBoletos,
      estado: "activo", // Solo boletos vendidos
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
reportesRouter.post("/fechas", async (request, response) => {
  const { fechaInicio, fechaFin } = request.body;

  const startDate = new Date(fechaInicio);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(fechaFin);
  endDate.setHours(23, 59, 59, 999);

  const boletos = await Boleto.findAll({
    where: {
      fecha: {
        [Op.between]: [startDate, endDate],
      },
      estado: "activo", // Solo boletos vendidos
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
    const startDate = new Date(fechaInicio);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(fechaFin);
    endDate.setHours(23, 59, 59, 999);

    whereClause.fechaViaje = {
      [Op.between]: [startDate, endDate],
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

  // Calcular estadísticas por viaje (solo boletos vendidos)
  const reporteViajes = viajes.map((viaje) => {
    const boletos = viaje.detalle_boletos || [];
    // Filtrar solo boletos con estado 'activo' (vendidos)
    const boletosVendidos = boletos.filter(
      (det) => det.boleto?.estado === "activo"
    );
    const totalVentas = boletosVendidos.reduce((sum, det) => {
      return sum + Number(det.boleto?.total || 0);
    }, 0);
    const asientosVendidos = boletosVendidos.length;

    return {
      idViaje: viaje.idViaje,
      origen: viaje.origen,
      destino: viaje.destino,
      fechaViaje: viaje.fechaViaje,
      asientosVendidos,
      totalVentas: Number(totalVentas.toFixed(2)),
      cantidadBoletos: [
        ...new Set(boletosVendidos.map((b) => b.Boletos_idBoleto)),
      ].length,
    };
  });

  response.json(reporteViajes);
});

// Reporte de usuarios con ventas
reportesRouter.post("/usuarios", async (request, response) => {
  const { fechaInicio, fechaFin } = request.body;

  const whereClause = {};
  if (fechaInicio && fechaFin) {
    const startDate = new Date(fechaInicio);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(fechaFin);
    endDate.setHours(23, 59, 59, 999);

    whereClause.fecha = {
      [Op.between]: [startDate, endDate],
    };
  }

  const usuarios = await Usuarios.findAll({
    include: [
      {
        model: Boleto,
        where: {
          ...whereClause,
          estado: "activo", // Solo boletos vendidos
        },
        required: false,
      },
    ],
  });

  // Calcular estadísticas por usuario (solo boletos vendidos)
  const reporteUsuarios = usuarios
    .map((usuario) => {
      const boletos = usuario.boletos || [];
      // Filtrar solo boletos con estado 'activo' (vendidos)
      const boletosVendidos = boletos.filter(
        (boleto) => boleto.estado === "activo"
      );
      const totalVentas = boletosVendidos.reduce((sum, boleto) => {
        return sum + Number(boleto.total || 0);
      }, 0);
      const cantidadBoletos = boletosVendidos.length;

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
