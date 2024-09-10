const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const usersRouter = require("./controllers/user");
const loginRouter = require("./controllers/login");
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
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);
const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

module.exports = app;
