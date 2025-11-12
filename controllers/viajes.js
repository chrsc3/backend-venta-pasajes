const viajesRouter = require("express").Router();
require("express-async-errors");

const { Op } = require("sequelize");
const {
  Viaje,
  Viaje_Chofer,
  Bus,
  AsientoPa,
  AsientoPb,
  Detalle_Boleto,
} = require("../models");
const { parseAsientos, stringifyAsientos } = require("../utils/ParserAsientos");

viajesRouter.post("/", async (request, response, next) => {
  try {
    const {
      origen,
      destino,
      fechaViaje,
      Buses_idBus,
      Oficinas_idOficina,
      idChofer1,
      idChofer2,
    } = request.body;

    const viajeModel = Viaje.build({
      origen: origen,
      destino: destino,
      fechaViaje: fechaViaje,
      estado: "activo",
      Buses_idBus: Buses_idBus,
      Oficinas_idOficina: Oficinas_idOficina,
    });

    const savedViaje = await viajeModel.save();
    const bus = await Bus.findByPk(Buses_idBus);

    if (savedViaje.idViaje) {
      const viajeChofer1 = Viaje_Chofer.build({
        Viajes_idViaje: savedViaje.idViaje,
        Choferes_idChofer: idChofer1,
      });

      await viajeChofer1.save();

      const viajeChofer2 = Viaje_Chofer.build({
        Viajes_idViaje: savedViaje.idViaje,
        Choferes_idChofer: idChofer2,
      });

      await viajeChofer2.save();
    }
    if (bus && savedViaje) {
      const plantaAlta = parseAsientos(bus.plantaAlta);
      const plantaBaja = parseAsientos(bus.plantaBaja);
      await Promise.all(
        plantaAlta.map(async (asiento) => {
          const asientoAlta = AsientoPa.build({
            idAsientoPa: asiento.id,
            Viajes_idViaje: savedViaje.idViaje,
            numAsiento: asiento.numAsiento,
            estado: "libre",
            nombre: "",
            ci: "0",
          });
          await asientoAlta.save();
        })
      );
      await Promise.all(
        plantaBaja.map(async (asiento) => {
          const asientoBaja = AsientoPb.build({
            idAsientoPb: asiento.id,
            Viajes_idViaje: savedViaje.idViaje,
            numAsiento: asiento.numAsiento,
            estado: "libre",
            nombre: "",
            ci: "0",
          });
          await asientoBaja.save();
        })
      );
    }

    response.status(201).json(savedViaje);
  } catch (error) {
    next(error);
  }
});

// Devuelve sólo viajes cuya fecha aún no pasó y estado distinto de inactivo/cancelado
viajesRouter.get("/", async (_, response) => {
  const now = new Date();
  const viajes = await Viaje.findAll({
    where: {
      fechaViaje: { [Op.gte]: now },
      estado: { [Op.notIn]: ["inactivo", "cancelado"] },
    },
    include: [Viaje_Chofer],
    order: [["fechaViaje", "ASC"]],
  });
  response.json(viajes);
});

// Ruta auxiliar para obtener todos los viajes (incluye pasados) para reportes
viajesRouter.get("/all", async (_, response) => {
  const viajes = await Viaje.findAll({
    include: [Viaje_Chofer],
    order: [["fechaViaje", "DESC"]],
  });
  response.json(viajes);
});
viajesRouter.get(
  "/filter/:startDate/:endDate",
  async (request, response, next) => {
    try {
      const { startDate, endDate } = request.params;

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const viajes = await Viaje.findAll({
        where: {
          fechaViaje: {
            [Op.between]: [start, end],
          },
        },
        include: [Viaje_Chofer],
      });
      response.json(viajes);
    } catch (error) {
      next(error);
    }
  }
);
viajesRouter.get("/:id", async (request, response, next) => {
  try {
    const viaje = await Viaje.findByPk(request.params.id, {
      include: [Viaje_Chofer],
    });
    if (viaje) {
      const isPast = new Date(viaje.fechaViaje) < new Date();
      const viajeJSON = viaje.toJSON();
      viajeJSON.isPast = isPast;
      response.json(viajeJSON);
    } else {
      response.status(404).json({ error: "Viaje not found" });
    }
  } catch (error) {
    next(error);
  }
});

viajesRouter.put("/:id", async (request, response, next) => {
  try {
    const {
      idViaje,
      origen,
      destino,
      fechaViaje,
      horaSalida,
      estado,
      Buses_idBus,
      Oficinas_idOficina,
    } = request.body;

    const viajeModel = {
      idViaje: idViaje,
      origen: origen,
      destino: destino,
      fechaViaje: fechaViaje,
      horaSalida: horaSalida,
      estado: estado,
      Buses_idBus: Buses_idBus,
      Oficinas_idOficina: Oficinas_idOficina,
    };

    const updatedViaje = await Viaje.update(viajeModel, {
      where: { idViaje: request.params.id },
    });
    if (!updatedViaje[0]) {
      return response.status(404).json({ error: "Viaje not found" });
    }
    response.json(viajeModel);
  } catch (error) {
    next(error);
  }
});

viajesRouter.delete("/:id", async (request, response, next) => {
  try {
    const delViajeChofer = await Viaje_Chofer.destroy({
      where: { Viajes_idViaje: request.params.id },
    });
    const delAsientosPa = await AsientoPa.destroy({
      where: { Viajes_idViaje: request.params.id },
    });
    const delAsientosPb = await AsientoPb.destroy({
      where: { Viajes_idViaje: request.params.id },
    });
    const delDetalleBoleto = await Detalle_Boleto.destroy({
      where: { Viajes_idViaje: request.params.id },
    });
    if (delViajeChofer && delAsientosPa && delAsientosPb) {
      await Viaje.destroy({
        where: { idViaje: request.params.id },
      });
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = viajesRouter;
