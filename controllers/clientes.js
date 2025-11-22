const clientesRouter = require("express").Router();
require("express-async-errors");

const { Cliente } = require("../models");

// Crear cliente
clientesRouter.post("/", async (request, response, next) => {
  try {
    const { nombre, apellido, ci, telefono, direccion, email, estado } =
      request.body;
    const clienteModel = Cliente.build({
      nombre,
      apellido,
      ci,
      telefono,
      direccion,
      email,
      estado: estado || "activo",
    });
    const saved = await clienteModel.save();
    response.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

// Listar clientes
clientesRouter.get("/", async (_, response) => {
  const clientes = await Cliente.findAll({ order: [["idCliente", "DESC"]] });
  response.json(clientes);
});

// Obtener uno
clientesRouter.get("/:id", async (request, response, next) => {
  try {
    const cliente = await Cliente.findByPk(request.params.id);
    if (!cliente) {
      return response.status(404).json({ error: "Cliente not found" });
    }
    response.json(cliente);
  } catch (error) {
    next(error);
  }
});

// Actualizar
clientesRouter.put("/:id", async (request, response, next) => {
  try {
    const { nombre, apellido, ci, telefono, direccion, email, estado } =
      request.body;
    const cliente = await Cliente.findByPk(request.params.id);
    if (!cliente) {
      return response.status(404).json({ error: "Cliente not found" });
    }
    await cliente.update({
      nombre,
      apellido,
      ci,
      telefono,
      direccion,
      email,
      estado,
    });
    response.json(cliente);
  } catch (error) {
    next(error);
  }
});

// Eliminar
clientesRouter.delete("/:id", async (request, response, next) => {
  try {
    const cliente = await Cliente.findByPk(request.params.id);
    if (!cliente) {
      return response.status(404).json({ error: "Cliente not found" });
    }
    await cliente.destroy();
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = clientesRouter;
