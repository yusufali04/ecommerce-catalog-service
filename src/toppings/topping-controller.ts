import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import config from "config";
import { FileStorage } from "../common/types/storage";
import { NextFunction, Request, Response } from "express";
import { ToppingService } from "./topping-service";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { Topping } from "./topping-types";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import { MessageProducerBroker } from "../common/types/broker";

export class ToppingController {
    constructor(
        private storage: FileStorage,
        private toppingService: ToppingService,
        private logger: Logger,
        private broker: MessageProducerBroker,
    ) {}
    create = async (req: Request, res: Response) => {
        // upload image to s3
        const uploadedImage = req.files!.image as UploadedFile;
        const imageName = uuidv4();
        await this.storage.upload({
            fileName: imageName,
            fileData: uploadedImage.data.buffer,
        });
        const {
            name,
            price,
            tenantId,
            isPublished,
            image = imageName,
            categoryId,
        } = req.body as Topping;
        const createdTopping: Topping = await this.toppingService.create({
            name,
            price,
            tenantId,
            isPublished,
            image,
            categoryId,
        });
        await this.broker.sendMessage(
            config.get("kafka.toppingTopic"),
            JSON.stringify({
                id: createdTopping._id,
                price: createdTopping.price,
                tenantId: createdTopping.tenantId,
            }),
        );
        res.json({ id: createdTopping._id }).send();
    };
    update = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;

        const topping = await this.toppingService.getTopping(toppingId);
        const tenant = (req as AuthRequest).auth.tenant;
        if (!topping) {
            return next(createHttpError(404, "Topping not found"));
        }
        if (
            (req as AuthRequest).auth.role !== Roles.ADMIN &&
            topping.tenantId !== String(tenant)
        ) {
            return next(createHttpError(403, "UnAuthorized access"));
        }
        let newImageName: string | undefined;
        let oldImageName: string | undefined;

        if (req.files?.image) {
            oldImageName = topping.image;
            newImageName = uuidv4();
            const newImage = req.files.image as UploadedFile;
            await this.storage.upload({
                fileName: newImageName,
                fileData: newImage.data.buffer,
            });
            await this.storage.delete(oldImageName);
        }
        const {
            name,
            price,
            tenantId,
            isPublished,
            image = newImageName ? newImageName : oldImageName,
            categoryId,
        } = req.body as Topping;
        const updatedTopping = await this.toppingService.update(toppingId, {
            name,
            price,
            tenantId,
            isPublished,
            image,
            categoryId,
        } as Topping);
        await this.broker.sendMessage(
            config.get("kafka.toppingTopic"),
            JSON.stringify({
                id: updatedTopping._id,
                price: updatedTopping.price,
                tenantId: updatedTopping.tenantId,
            }),
        );
        res.json({ id: updatedTopping._id });
    };
    getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;
        const topping = await this.toppingService.getTopping(toppingId);
        if (!topping) {
            return next(createHttpError(404, "Product not found"));
        }
        this.logger.info(`Getting topping`, { id: topping._id });
        res.json(topping);
    };
    getByCategoryAndTenant = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { categoryId, tenantId } = req.query;
        const toppings = await this.toppingService.getByCategoryAndTenant(
            categoryId as string,
            tenantId as string,
        );
        if (!toppings) {
            return next(createHttpError(404, "Toppings not found"));
        }
        const finalToppings = toppings.map((topping: Topping) => {
            return {
                ...topping,
                image: this.storage.getObjectURI(topping.image),
            };
        });
        this.logger.info(`Getting toppings by categoryId`, {
            categoryId: categoryId,
        });
        res.json(finalToppings);
    };
    getAll = async (req: Request, res: Response) => {
        const toppings = await this.toppingService.getAll({
            page: req.query.currentPage ? Number(req.query.currentPage) : 1,
            limit: req.query.perPage ? Number(req.query.perPage) : 10,
        });
        const finalToppings = (toppings.data as Topping[]).map(
            (topping: Topping) => {
                return {
                    ...topping,
                    image: this.storage.getObjectURI(topping.image),
                };
            },
        );
        this.logger.info("All toppings fetched");
        res.json({
            data: finalToppings,
            total: toppings.total,
            perPage: toppings.perPage,
            currentPage: toppings.currentPage,
        });
    };
    delete = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;

        const deletedTopping = await this.toppingService.delete(toppingId);
        if (!deletedTopping) {
            return next(createHttpError(404, "Topping not found"));
        }
        this.logger.info(`Deleted topping`, { id: deletedTopping._id });
        res.json({ id: deletedTopping._id });
    };
}
