import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { globalWrapper } from "../common/utils/globalWrapper";
import { ProductController } from "./product-controller";
import createProductValidator from "./create-product-validator";

const productRouter = express.Router();
const productController = new ProductController();

productRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    createProductValidator,
    globalWrapper(productController.create),
);

export default productRouter;
