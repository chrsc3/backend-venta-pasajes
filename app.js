const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const usersRouter = require("./controllers/user");
const loginRouter = require("./controllers/login");
const rolesRouter = require("./controllers/rol");
const permisosRouter = require("./controllers/permisos");
const choferesRouter = require("./controllers/choferes");
const oficinasRouter = require("./controllers/oficinas");
const busesRouter = require("./controllers/buses");
const viajesRouter = require("./controllers/viajes");
const asientospaRouter = require("./controllers/asientospa");
const asientospbRouter = require("./controllers/asientospb");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const { PORT } = require("./utils/config");
const { connectToDatabase } = require("./utils/db");

logger.info("connecting to DB");

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
app.use("/api/usuarios", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/permisos", permisosRouter);
app.use("/api/choferes", choferesRouter);
app.use("/api/oficinas", oficinasRouter);
app.use("/api/buses", busesRouter);
app.use("/api/viajes", viajesRouter);
app.use("/api/asientospa", asientospaRouter);
app.use("/api/asientospb", asientospbRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);
const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

module.exports = app;
