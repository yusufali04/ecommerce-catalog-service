import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category } from "./category-types";
import { CategoryService } from "./category-service";
import { Logger } from "winston";

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;
        const createdCategory = (await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        } as Category)) as Category;
        this.logger.info("Created category", { id: createdCategory._id });
        res.status(201).json({ id: createdCategory._id });
    }
}
