const boletoRouter = require("express").Router();
require("express-async-errors");

const { Boleto, Viaje, Detalle_Boleto, Bus, Chofer } = require("../models");
const { Op } = require("sequelize");

boletoRouter.get("/ventasDia", async (request, response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const ventas = await Boleto.findAll({
    include: [
      {
        model: Detalle_Boleto,
        include: [
          {
            model: Viaje,
            attributes: ["idViaje", "origen", "destino"],
          },
        ],
      },
    ],
    where: {
      fecha: {
        [Op.between]: [today, tomorrow],
      },
    },
  });
  const viajesMap = {};

  ventas.forEach((boleto) => {
    boleto.detalle_boletos.forEach((detalle) => {
      const viaje = detalle.viaje;
      const idViaje = viaje.idViaje;
      const monto = parseInt(detalle.precio); // Asumiendo que 'precio' es el monto recaudado

      if (!viajesMap[idViaje]) {
        viajesMap[idViaje] = {
          idViaje: viaje.idViaje,
          origen: viaje.origen,
          destino: viaje.destino,
          totalRecaudado: 0,
          totalPasajeros: 0,
        };
      }
      viajesMap[idViaje].totalRecaudado += monto;
      viajesMap[idViaje].totalPasajeros++;
    });
  });

  const viajes = Object.values(viajesMap);

  response.json(viajes);
});

boletoRouter.get("/ventasSemana", async (request, response) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(today);
  endOfWeek.setHours(23, 59, 59, 999);

  const ventas = await Boleto.findAll({
    include: [
      {
        model: Detalle_Boleto,
        include: [
          {
            model: Viaje,
            attributes: ["idViaje", "origen", "destino"],
          },
        ],
      },
    ],
    where: {
      fecha: {
        [Op.between]: [startOfWeek, endOfWeek],
      },
    },
  });

  let totalRecaudado = 0;
  let totalPasajeros = 0;

  ventas.forEach((boleto) => {
    boleto.detalle_boletos.forEach((detalle) => {
      totalRecaudado += parseInt(detalle.precio);
      totalPasajeros++;
    });
  });

  response.json({
    totalRecaudado,
    totalPasajeros,
    totalBoletos: ventas.length
  });
});

boletoRouter.get("/ventasMes", async (request, response) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const ventas = await Boleto.findAll({
    include: [
      {
        model: Detalle_Boleto,
        include: [
          {
            model: Viaje,
            attributes: ["idViaje", "origen", "destino"],
          },
        ],
      },
    ],
    where: {
      fecha: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
  });

  let totalRecaudado = 0;
  let totalPasajeros = 0;

  ventas.forEach((boleto) => {
    boleto.detalle_boletos.forEach((detalle) => {
      totalRecaudado += parseInt(detalle.precio);
      totalPasajeros++;
    });
  });

  response.json({
    totalRecaudado,
    totalPasajeros,
    totalBoletos: ventas.length
  });
});

boletoRouter.get("/estadisticas", async (request, response) => {
  // Total de buses
  const totalBuses = await Bus.count();
  
  // Total de choferes
  const totalChoferes = await Chofer.count();
  
  // Total de viajes programados
  const totalViajes = await Viaje.count();
  
  // Ruta más popular (últimos 30 días)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const ventasRutas = await Boleto.findAll({
    include: [
      {
        model: Detalle_Boleto,
        include: [
          {
            model: Viaje,
            attributes: ["origen", "destino"],
          },
        ],
      },
    ],
    where: {
      fecha: {
        [Op.gte]: thirtyDaysAgo,
      },
    },
  });

  const rutasMap = {};
  ventasRutas.forEach((boleto) => {
    boleto.detalle_boletos.forEach((detalle) => {
      const ruta = `${detalle.viaje.origen} - ${detalle.viaje.destino}`;
      rutasMap[ruta] = (rutasMap[ruta] || 0) + 1;
    });
  });

  const rutaMasPopular = Object.entries(rutasMap).reduce(
    (max, [ruta, count]) => count > max.count ? { ruta, count } : max,
    { ruta: "N/A", count: 0 }
  );

  response.json({
    totalBuses,
    totalChoferes,
    totalViajes,
    rutaMasPopular
  });
});
module.exports = boletoRouter;
