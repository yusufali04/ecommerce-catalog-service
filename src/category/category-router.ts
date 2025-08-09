import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import { CategoryService } from "./category-service";
import logger from "../config/logger";
import { globalWrapper } from "../common/utils/globalWrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import categoryUpdateValidator from "./category-update-validator";

const categoryRouter = express.Router();
const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

categoryRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    globalWrapper(categoryController.create),
);

categoryRouter.get("/", globalWrapper(categoryController.index));
categoryRouter.get("/:categoryId", globalWrapper(categoryController.getOne));
categoryRouter.put(
    "/:categoryId",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryUpdateValidator,
    globalWrapper(categoryController.update),
);
categoryRouter.delete(
    "/:categoryId",
    authenticate,
    canAccess([Roles.ADMIN]),
    globalWrapper(categoryController.delete),
);

export default categoryRouter;
