import mongoose from "mongoose";

export interface Topping {
    _id?: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    tenantId: string;
    isPublished: boolean;
    categoryId: mongoose.Types.ObjectId;
}
