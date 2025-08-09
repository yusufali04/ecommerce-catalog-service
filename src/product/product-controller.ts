import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./product-service";
import { Product } from "./product-types";

export class ProductController {
    constructor(private productService: ProductService) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            image = "image.jpg",
            isPublished,
        } = req.body as Product;
        const createdProduct = await this.productService.create({
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration) as string,
            attributes: JSON.parse(attributes) as string,
            tenantId,
            categoryId,
            image,
            isPublished,
        });
        res.json({ id: createdProduct._id }).send();
    };
}
