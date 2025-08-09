import ProductModel from "./product-model";
import { Filter, Product } from "./product-types";

export class ProductService {
    async create(product: Product) {
        return await ProductModel.create(product);
    }
    async update(productId: string, data: Product) {
        return await ProductModel.findOneAndUpdate(
            { _id: productId },
            {
                $set: data,
            },
            {
                new: true,
            },
        );
    }
    async getProduct(productId: string) {
        return await ProductModel.findOne({ _id: productId });
    }
    async getAll(q: string, filters: Filter) {
        const searchQueryRegExp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            name: searchQueryRegExp,
        };
        const aggregate = ProductModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$category",
            },
        ]);

        const result = await aggregate.exec();
        return result as Product[];
    }
}
