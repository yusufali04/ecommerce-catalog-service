import { paginationLabels } from "../config/pagination";
import { PaginateQuery } from "../product/product-types";
import ToppingModel from "./topping-model";
import { Topping } from "./topping-types";

export class ToppingService {
    async create(toppingData: Topping) {
        return (await ToppingModel.create(toppingData)) as Topping;
    }
    async getTopping(toppingId: string) {
        return (await ToppingModel.findById(toppingId)) as Topping;
    }
    async getByCategoryAndTenant(
        categoryId: string,
        tenantId: string,
    ): Promise<Topping[]> {
        return await ToppingModel.find({ categoryId, tenantId }).lean<
            Topping[]
        >();
    }
    async update(toppingId: string, toppingData: Topping) {
        return (await ToppingModel.findOneAndUpdate(
            { _id: toppingId },
            { $set: toppingData },
            { new: true },
        )) as Topping;
    }
    async getAll(paginateQuery: PaginateQuery) {
        const aggregate = ToppingModel.aggregate();
        return await ToppingModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }
    async delete(toppingId: string) {
        return (await ToppingModel.findByIdAndDelete(toppingId)) as Topping;
    }
}
