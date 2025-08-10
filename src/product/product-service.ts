import { paginationLabels } from "../config/pagination";
import ProductModel from "./product-model";
import { Filter, PaginateQuery, Product } from "./product-types";

export class ProductService {
    async create(product: Product) {
        return (await ProductModel.create(product)) as Product;
    }
    async update(productId: string, data: Product) {
        return (await ProductModel.findOneAndUpdate(
            { _id: productId },
            {
                $set: data,
            },
            {
                new: true,
            },
        )) as Product;
    }
    async getProduct(productId: string) {
        return (await ProductModel.findOne({ _id: productId })) as Product;
    }
    async getAll(q: string, filters: Filter, paginateQuery: PaginateQuery) {
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
        return await ProductModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }
    async delete(productId: string) {
        return await ProductModel.findByIdAndDelete(productId);
    }
}
