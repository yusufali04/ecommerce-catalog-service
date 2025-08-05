import CategoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(categoryData: Category) {
        const category = new CategoryModel(categoryData);
        return category.save();
    }
}
