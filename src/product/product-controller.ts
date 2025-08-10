import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./product-service";
import { Filter, Product } from "./product-types";
import { FileStorage } from "../common/types/storage";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import mongoose from "mongoose";
import { Logger } from "winston";

export class ProductController {
    constructor(
        private productService: ProductService,
        private storage: FileStorage,
        private logger: Logger,
    ) {}
    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        // upload image to S3
        const uploadedImage = req.files!.image as UploadedFile;
        const imageName = uuidv4();
        await this.storage.upload({
            fileName: imageName,
            fileData: uploadedImage.data.buffer,
        });
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            image = imageName,
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
    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { productId } = req.params;
        // check if tenant has access to the product
        const product = await this.productService.getProduct(productId);
        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }
        const tenant = (req as AuthRequest).auth.tenant;
        if (
            (req as AuthRequest).auth.role !== Roles.ADMIN &&
            product.tenantId !== String(tenant)
        ) {
            return next(createHttpError(403, "UnAuthorized access"));
        }

        let newImageName: string | undefined;
        let oldImageName: string | undefined;

        if (req.files?.image) {
            oldImageName = product.image;
            const newImage = req.files.image as UploadedFile;
            newImageName = uuidv4();
            await this.storage.upload({
                fileName: newImageName,
                fileData: newImage.data.buffer,
            });
            await this.storage.delete(oldImageName);
        }
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublished,
        } = req.body as Product;
        const productData = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration) as string,
            attributes: JSON.parse(attributes) as string,
            tenantId,
            categoryId,
            image: newImageName ? newImageName : (oldImageName as string),
            isPublished,
        };
        await this.productService.update(productId, productData);
        res.json({ id: productId });
    };
    getAll = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublished } = req.query;
        const filters: Filter = {};

        if (isPublished === "true") {
            filters.isPublished = true;
        }
        if (tenantId) filters.tenantId = tenantId as string;
        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }
        const products = await this.productService.getAll(
            q as string,
            filters,
            {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
            },
        );

        const finalProducts = (products.data as Product[]).map(
            (product: Product) => {
                return {
                    ...product,
                    image: this.storage.getObjectURI(product.image),
                };
            },
        );
        this.logger.info("All products fetched");
        res.json({
            data: finalProducts,
            total: products.total,
            perPage: products.perPage,
            currentPage: products.currentPage,
        });
    };
}
