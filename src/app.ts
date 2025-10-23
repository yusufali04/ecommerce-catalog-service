import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";
import cookieParser from "cookie-parser";
import productRouter from "./product/product-router";
import toppingRouter from "./toppings/topping-router";
import cors from "cors";
import config from "config";

const app = express();
const allowedOrigins: string[] = [
    config.get("frontend.clientUI"),
    config.get("frontend.adminUI"),
];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie", "Cookie"],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello from the catalog service!" });
});

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppingRouter);
app.use(globalErrorHandler);

export default app;
