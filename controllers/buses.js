const busesRouter = require("express").Router();
require("express-async-errors");
const e = require("express");
const { Bus } = require("../models");
const { parseAsientos, stringifyAsientos } = require("../utils/ParserAsientos");

busesRouter.post("/", async (request, response, next) => {
  try {
    const { marca, placa, tipo, plantaAlta, plantaBaja } = request.body;

    const busModel = Bus.build({
      marca: marca,
      placa: placa,
      tipo: tipo,
      estado: "activo",
      plantaAlta: stringifyAsientos(plantaAlta),
      plantaBaja: stringifyAsientos(plantaBaja),
    });

    const savedBus = await busModel.save();
    savedBus.plantaAlta = parseAsientos(savedBus.plantaAlta);
    savedBus.plantaBaja = parseAsientos(savedBus.plantaBaja);

    response.status(201).json(savedBus);
  } catch (error) {
    next(error);
  }
});

busesRouter.get("/", async (_, response) => {
  const buses = await Bus.findAll();
  const parseBuses = buses.map((bus) => {
    bus.plantaAlta = parseAsientos(bus.plantaAlta);
    bus.plantaBaja = parseAsientos(bus.plantaBaja);
    return bus;
  });
  response.json(parseBuses);
});

busesRouter.get("/:id", async (request, response, next) => {
  try {
    const bus = await Bus.findByPk(request.params.id);
    if (bus) {
      bus.plantaAlta = parseAsientos(bus.plantaAlta);
      bus.plantaBaja = parseAsientos(bus.plantaBaja);
      response.json(bus);
    } else {
      response.status(404).json({ error: "Bus not found" });
    }
  } catch (error) {
    next(error);
  }
});

busesRouter.put("/:id", async (request, response, next) => {
  try {
    const { idBus, marca, placa, tipo, estado, plantaAlta, plantaBaja } =
      request.body;

    const busModel = {
      idBus: idBus,
      marca: marca,
      placa: placa,
      tipo: tipo,
      estado: estado,
      plantaAlta: stringifyAsientos(plantaAlta),
      plantaBaja: stringifyAsientos(plantaBaja),
    };

    const updatedBus = await Bus.update(busModel, {
      where: { idBus: request.params.id },
    });

    if (!updatedBus[0]) {
      return response.status(404).json({ error: "Bus not found" });
    }
    busModel.plantaAlta = parseAsientos(busModel.plantaAlta);
    busModel.plantaBaja = parseAsientos(busModel.plantaBaja);
    response.json(busModel);
  } catch (error) {
    next(error);
  }
});

busesRouter.delete("/:id", async (request, response, next) => {
  try {
    await Bus.destroy({
      where: { id: request.params.id },
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = busesRouter;
