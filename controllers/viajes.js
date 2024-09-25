const viajesRouter = require("express").Router();
require("express-async-errors");

const { Viaje, Viaje_Chofer } = require("../models");

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

    response.status(201).json(savedViaje);
  } catch (error) {
    next(error);
  }
});

viajesRouter.get("/", async (_, response) => {
  const viajes = await Viaje.findAll({ include: [Viaje_Chofer] });
  response.json(viajes);
});
viajesRouter.get(
  "/filter/:startDate/:endDate",
  async (request, response, next) => {
    try {
      const { startDate, endDate } = request.params;
      const viajes = await Viaje.findAll({
        where: {
          fechaViaje: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
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
    const viaje = await Viaje.findByPk(request.params.id);
    if (viaje) {
      response.json(viaje);
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
    if (delViajeChofer) {
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
