import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { globalWrapper } from "../common/utils/globalWrapper";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { ToppingController } from "./topping-controller";
import { ToppingService } from "./topping-service";
import { S3Storage } from "../common/services/S3Storage";
import logger from "../config/logger";

const toppingRouter = express.Router();
const s3Storage = new S3Storage();
const toppingService = new ToppingService();
const toppingController = new ToppingController(
    s3Storage,
    toppingService,
    logger,
);

toppingRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, //500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeded the limit");
            next(error);
        },
    }),
    globalWrapper(toppingController.create),
);
toppingRouter.put(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, //500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeded the limit");
            next(error);
        },
    }),
    globalWrapper(toppingController.update),
);
toppingRouter.get("/", globalWrapper(toppingController.getAll));
toppingRouter.get("/:toppingId", globalWrapper(toppingController.getOne));
toppingRouter.delete(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    globalWrapper(toppingController.delete),
);

export default toppingRouter;
