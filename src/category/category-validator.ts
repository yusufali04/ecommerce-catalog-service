import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Category name is required")
        .isString()
        .withMessage("Category name must be a string"),
    body("priceConfiguration")
        .exists()
        .withMessage("Price configuration is required"),
    body("priceConfiguration.*.priceType")
        .exists()
        .withMessage("Price type is required")
        .custom((value: "base" | "additional") => {
            const validKeys = ["base", "additional"];
            if (!validKeys.includes(value)) {
                throw new Error(
                    `${value} is an invalid price type. Allowed values are: ${validKeys.join(
                        ", ",
                    )}`,
                );
            }
            return true;
        }),
    body("attributes").exists().withMessage("Attributes are required"),
];
