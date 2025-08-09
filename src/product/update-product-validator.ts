import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product name must be a string"),
    body("description").exists().withMessage("description is required"),
    body("priceConfiguration")
        .exists()
        .withMessage("price configuration is required"),
    body("attributes").exists().withMessage("attributes is required"),
    body("tenantId").exists().withMessage("tenantId is required"),
    body("categoryId").exists().withMessage("categoryId is required"),
];
