const boletoRouter = require("express").Router();
require("express-async-errors");

const {
  Boleto,
  Viaje,
  Detalle_Boleto,
  AsientoPa,
  AsientoPb,
} = require("../models");

boletoRouter.post("/", async (request, response, next) => {
  try {
    const { nombre, ci, total, Usuarios_idUsuario, detalleBoleto, esReserva } =
      request.body;

    // Validación: no permitir ventas/reservas de viajes pasados o inactivos/cancelados
    if (!Array.isArray(detalleBoleto) || detalleBoleto.length === 0) {
      return response.status(400).json({ error: "detalleBoleto vacío" });
    }
    const viajesIds = [...new Set(detalleBoleto.map((d) => d.Viajes_idViaje))];
    const viajes = await Viaje.findAll({ where: { idViaje: viajesIds } });
    if (viajes.length !== viajesIds.length) {
      return response
        .status(400)
        .json({ error: "Viaje asociado no encontrado" });
    }
    const now = new Date();
    for (const v of viajes) {
      if (new Date(v.fechaViaje) < now) {
        return response.status(400).json({
          error: "No se pueden vender boletos de viajes ya realizados",
        });
      }
      if (v.estado === "inactivo" || v.estado === "cancelado") {
        return response
          .status(400)
          .json({ error: "El viaje no está disponible para la venta" });
      }
    }
    const boletoModel = Boleto.build({
      fecha: new Date(),
      nombre: nombre,
      ci: ci,
      total: total,
      estado: esReserva ? "reserva" : "activo",
      Usuarios_idUsuario: Usuarios_idUsuario,
    });

    const savedBoleto = await boletoModel.save();
    if (savedBoleto) {
      await Promise.all(
        detalleBoleto.map(async (detalle) => {
          // Crear detalle del boleto
          const detalleBoletoModel = Detalle_Boleto.build({
            precio: detalle.precio,
            numAsiento: detalle.numAsiento,
            nombre: detalle.nombre,
            ci: detalle.ci,
            estado: "activo",
            Boletos_idBoleto: savedBoleto.idBoleto,
            Viajes_idViaje: detalle.Viajes_idViaje,
          });
          await detalleBoletoModel.save();

          // Actualizar estado del asiento en las tablas asientos_pa y asientos_pb
          const estadoAsiento = esReserva ? "reservado" : "ocupado";

          // Actualizar en AsientoPa
          await AsientoPa.update(
            {
              estado: estadoAsiento,
              nombre: detalle.nombre,
              ci: detalle.ci,
            },
            {
              where: {
                Viajes_idViaje: detalle.Viajes_idViaje,
                numAsiento: detalle.numAsiento,
              },
              validate: false,
            }
          );

          // Actualizar en AsientoPb
          await AsientoPb.update(
            {
              estado: estadoAsiento,
              nombre: detalle.nombre,
              ci: detalle.ci,
            },
            {
              where: {
                Viajes_idViaje: detalle.Viajes_idViaje,
                numAsiento: detalle.numAsiento,
              },
              validate: false,
            }
          );
        })
      );
    }
    const boletoWithDetails = await Boleto.findByPk(savedBoleto.idBoleto, {
      include: [{ model: Detalle_Boleto }],
    });
    response.status(201).json(boletoWithDetails);
  } catch (error) {
    next(error);
  }
});

// Confirmar reserva (convertir a venta)
boletoRouter.patch("/:id/confirmar", async (request, response, next) => {
  try {
    const { id } = request.params;
    const { total } = request.body; // Nuevo monto opcional

    const boleto = await Boleto.findByPk(id, {
      include: [{ model: Detalle_Boleto }],
    });

    if (!boleto) {
      return response.status(404).json({ error: "Boleto no encontrado" });
    }

    if (boleto.estado !== "reserva") {
      return response
        .status(400)
        .json({ error: "El boleto no es una reserva" });
    }

    // Validación: el/los viaje(s) asociados no deben estar en pasado ni inactivos
    const viajesIds = [
      ...new Set((boleto.detalle_boletos || []).map((d) => d.Viajes_idViaje)),
    ];
    if (viajesIds.length === 0) {
      return response
        .status(400)
        .json({ error: "La reserva no tiene viajes asociados" });
    }
    const viajes = await Viaje.findAll({ where: { idViaje: viajesIds } });
    const now = new Date();
    for (const v of viajes) {
      if (new Date(v.fechaViaje) < now) {
        return response.status(400).json({
          error: "No se puede confirmar una reserva de un viaje ya realizado",
        });
      }
      if (v.estado === "inactivo" || v.estado === "cancelado") {
        return response
          .status(400)
          .json({ error: "El viaje no está disponible para confirmación" });
      }
    }

    // Cambiar estado del boleto de 'reserva' a 'activo'
    boleto.estado = "activo";

    // Actualizar el total y los detalles si se proporciona un nuevo monto
    if (
      total !== undefined &&
      total !== null &&
      boleto.detalle_boletos &&
      boleto.detalle_boletos.length > 0
    ) {
      const nuevoTotal = parseFloat(total);
      boleto.total = nuevoTotal;

      // Calcular el nuevo precio por asiento (distribuir el total entre los asientos)
      const cantidadAsientos = boleto.detalle_boletos.length;
      const nuevoPrecioPorAsiento = nuevoTotal / cantidadAsientos;

      // Actualizar el precio en cada detalle_boleto
      for (const detalle of boleto.detalle_boletos) {
        await Detalle_Boleto.update(
          { precio: nuevoPrecioPorAsiento },
          {
            where: {
              idDetalle_Boleto: detalle.idDetalle_Boleto,
            },
          }
        );
      }
    }

    await boleto.save();

    // Actualizar estado de asientos de 'reservado' a 'ocupado'
    if (boleto.detalle_boletos && boleto.detalle_boletos.length > 0) {
      for (const detalle of boleto.detalle_boletos) {
        const idViaje = detalle.Viajes_idViaje;
        const numAsiento = detalle.numAsiento;

        // Actualizar en AsientoPa
        await AsientoPa.update(
          { estado: "ocupado" },
          {
            where: {
              Viajes_idViaje: idViaje,
              numAsiento: numAsiento,
              estado: "reservado",
            },
          }
        );

        // Actualizar en AsientoPb
        await AsientoPb.update(
          { estado: "ocupado" },
          {
            where: {
              Viajes_idViaje: idViaje,
              numAsiento: numAsiento,
              estado: "reservado",
            },
          }
        );
      }
    }

    const boletoWithDetails = await Boleto.findByPk(id, {
      include: [{ model: Detalle_Boleto }],
    });

    response.json(boletoWithDetails);
  } catch (error) {
    next(error);
  }
});

// Anular boleto
boletoRouter.patch("/:id/anular", async (request, response, next) => {
  try {
    const { id } = request.params;
    const boleto = await Boleto.findByPk(id, {
      include: [{ model: Detalle_Boleto }],
    });

    if (!boleto) {
      return response.status(404).json({ error: "Boleto no encontrado" });
    }

    if (boleto.estado === "anulado") {
      return response.status(400).json({ error: "El boleto ya está anulado" });
    }

    // Cambiar estado del boleto a 'anulado'
    boleto.estado = "anulado";
    await boleto.save();

    // Liberar asientos (cambiar estado a 'libre')
    if (boleto.detalle_boletos && boleto.detalle_boletos.length > 0) {
      for (const detalle of boleto.detalle_boletos) {
        const idViaje = detalle.Viajes_idViaje;
        const numAsiento = detalle.numAsiento;

        // Liberar en AsientoPa
        await AsientoPa.update(
          {
            estado: "libre",
            nombre: "",
            ci: "",
          },
          {
            where: {
              Viajes_idViaje: idViaje,
              numAsiento: numAsiento,
            },
            validate: false, // Saltar validaciones
          }
        );

        // Liberar en AsientoPb
        await AsientoPb.update(
          {
            estado: "libre",
            nombre: "",
            ci: "",
          },
          {
            where: {
              Viajes_idViaje: idViaje,
              numAsiento: numAsiento,
            },
            validate: false, // Saltar validaciones
          }
        );
      }
    }

    const boletoWithDetails = await Boleto.findByPk(id, {
      include: [{ model: Detalle_Boleto }],
    });

    response.json(boletoWithDetails);
  } catch (error) {
    next(error);
  }
});

boletoRouter.get("/", async (_, response) => {
  const ventas = await Boleto.findAll({
    include: [{ model: Detalle_Boleto }],
  });
  response.json(ventas);
});
boletoRouter.get("/:idviaje", async (request, response) => {
  const { idviaje } = request.params;
  const Detalle = await Detalle_Boleto.findAll({
    where: { Viajes_idViaje: idviaje },
  });
  const uniqueBoletos = [
    ...new Set(Detalle.map((det) => det.Boletos_idBoleto)),
  ];
  const boletos = await Boleto.findAll({
    where: { idBoleto: uniqueBoletos },
    include: [{ model: Detalle_Boleto }],
  });
  response.json(boletos);
});

module.exports = boletoRouter;
