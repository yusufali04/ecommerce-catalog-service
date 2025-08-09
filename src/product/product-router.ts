import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { globalWrapper } from "../common/utils/globalWrapper";
import { ProductController } from "./product-controller";
import createProductValidator from "./create-product-validator";
import { ProductService } from "./product-service";
import fileUpload from "express-fileupload";

const productRouter = express.Router();
const productService = new ProductService();
const productController = new ProductController(productService);

productRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload(),
    createProductValidator,
    globalWrapper(productController.create),
);

export default productRouter;
