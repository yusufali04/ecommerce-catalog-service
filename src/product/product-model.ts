import mongoose from "mongoose";

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
const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
