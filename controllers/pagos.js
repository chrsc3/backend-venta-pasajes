const pagosRouter = require("express").Router();
require("express-async-errors");

const { Pago, Boleto, Usuarios } = require("../models");

// Crear un pago
pagosRouter.post("/", async (request, response, next) => {
  try {
    const { monto, metodo, Boletos_idBoleto, Usuarios_idUsuario } =
      request.body;

    // Validaciones de existencia de recursos relacionados
    const boleto = await Boleto.findByPk(Boletos_idBoleto);
    if (!boleto) {
      return response.status(404).json({ error: "Boleto no encontrado" });
    }

    if (Usuarios_idUsuario) {
      const usuario = await Usuarios.findByPk(Usuarios_idUsuario);
      if (!usuario) {
        return response.status(404).json({ error: "Usuario no encontrado" });
      }
    }

    // Construir y validar el modelo (Sequelize lanzará errores de validación si hay problemas)
    const pagoModel = Pago.build({
      monto,
      metodo,
      fecha: new Date(),
      estado: "activo",
      Boletos_idBoleto,
      Usuarios_idUsuario,
    });

    try {
      const savedPago = await pagoModel.save();
      const pagoWithRelations = await Pago.findByPk(savedPago.idPago, {
        include: [{ model: Boleto }, { model: Usuarios }],
      });
      return response.status(201).json(pagoWithRelations);
    } catch (validationError) {
      // Forward validation errors
      return next(validationError);
    }
  } catch (error) {
    next(error);
  }
});

// Obtener todos los pagos
pagosRouter.get("/", async (_, response) => {
  const pagos = await Pago.findAll({
    include: [{ model: Boleto }, { model: Usuarios }],
  });
  response.json(pagos);
});

// Obtener pagos por id de boleto
pagosRouter.get("/boleto/:idBoleto", async (request, response) => {
  const { idBoleto } = request.params;
  const pagos = await Pago.findAll({
    where: { Boletos_idBoleto: idBoleto },
    include: [{ model: Usuarios }],
  });
  response.json(pagos);
});

module.exports = pagosRouter;
