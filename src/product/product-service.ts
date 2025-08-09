import ProductModel from "./product-model";
import { Product } from "./product-types";

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
}
