import mongoose, { AggregatePaginateModel } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Product } from "./product-types";

const priceConfigurationSchema = new mongoose.Schema({
    priceType: {
        type: String,
        enum: ["base", "additional"],
    },
    availableOptions: {
        type: Map,
        of: Number,
    },
});

const attributeValueSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
    },
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        priceConfiguration: {
            type: Map,
            of: priceConfigurationSchema,
        },
        attributes: [attributeValueSchema],
        tenantId: {
            type: String,
            required: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        isPublished: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    { timestamps: true },
);
productSchema.plugin(aggregatePaginate);
const ProductModel = mongoose.model<Product, AggregatePaginateModel<Product>>(
    "Product",
    productSchema,
);

export default ProductModel;
