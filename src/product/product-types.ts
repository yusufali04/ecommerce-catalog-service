import mongoose from "mongoose";

export interface Product {
    _id?: mongoose.Types.ObjectId;
    name: string;
    description: string;
    priceConfiguration: string;
    attributes: string;
    tenantId: string;
    categoryId: string;
    image: string;
    isPublished: string;
}

export interface Filter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublished?: boolean;
}

export interface PaginateQuery {
    page: number;
    limit: number;
}
