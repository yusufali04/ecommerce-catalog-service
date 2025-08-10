import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { globalWrapper } from "../common/utils/globalWrapper";
import { ProductController } from "./product-controller";
import createProductValidator from "./create-product-validator";
import { ProductService } from "./product-service";
import fileUpload from "express-fileupload";
import { S3Storage } from "../common/services/S3Storage";
import createHttpError from "http-errors";
import updateProductValidator from "./update-product-validator";
import logger from "../config/logger";

const productRouter = express.Router();
const productService = new ProductService();
const s3Storage = new S3Storage();
const productController = new ProductController(
    productService,
    s3Storage,
    logger,
);

productRouter.post(
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
    createProductValidator,
    globalWrapper(productController.create),
);

productRouter.put(
    "/:productId",
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
    updateProductValidator,
    globalWrapper(productController.update),
);
productRouter.get("/", globalWrapper(productController.getAll));
export default productRouter;
