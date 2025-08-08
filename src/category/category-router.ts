import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import { CategoryService } from "./category-service";
import logger from "../config/logger";
import { globalWrapper } from "../common/utils/globalWrapper";

const categoryRouter = express.Router();
const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

categoryRouter.post(
    "/",
    categoryValidator,
    globalWrapper(categoryController.create),
);

export default categoryRouter;
