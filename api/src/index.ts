import express from "express";
import mongoose from "mongoose";
import { config } from "./config/config";
import Logging from "./library/logging";
import { StatusCodes } from "http-status-codes";
import http from "http";
import { initializeDatabase } from "./config/init_database";
import authRouter from "./routes/authRoute";
import initRouter from "./routes/initRoute";
import productRouter from "./routes/productRoute";
import categoryRouter from "./routes/categoryRoute";
import orderRouter from "./routes/orderRoute";
import orderStatusRouter from "./routes/orderStatusRoute";
import cookieParser from "cookie-parser";

const router = express();

mongoose
  .connect(config.mongo.url)
  .then(() => {
    Logging.info("Connected to MongoDB.");
    StartServer();
  })
  .catch((error) => {
    Logging.error("Unable to connect: ");
    Logging.error(error);
  });

/** Start server only if connected to mongoose */
const StartServer = () => {
  initializeDatabase();
  router.use((req, res, next) => {
    /** Log the Request */
    Logging.info(
      `Incoming -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on("finish", () => {
      /** Log the Response */
      Logging.info(
        `Outgoing -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
      );
    });

    next();
  });

  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());
  router.use(cookieParser());

  /** Rules of API */
  router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", config.frontend.url);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method == "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, POST, PATCH, DELETE, GET"
      );
      return res.status(200).json({});
    }

    next();
  });

  /** Routes with /api prefix */
  const apiRouter = express.Router();

  apiRouter.use("/auth", authRouter);
  apiRouter.use("/products", productRouter);
  apiRouter.use("/categories", categoryRouter);
  apiRouter.use("/orders", orderRouter);
  apiRouter.use("/status", orderStatusRouter);
  apiRouter.use("/init", initRouter);

  /** Healthcheck */
  apiRouter.get("/ping", (req, res) =>
    res.status(StatusCodes.OK).json({ message: "pong" })
  );

  /** Attach /api prefix */
  router.use("/api", apiRouter);

  /** Error handling */
  router.use((req, res) => {
    const error = new Error("Not Found");
    Logging.error(error);
    return res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
  });

  http
    .createServer(router)
    .listen(config.server.port, () =>
      Logging.info(`Server is running on port ${config.server.port}.`)
    );
};
