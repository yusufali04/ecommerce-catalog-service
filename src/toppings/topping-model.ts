import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const toppingSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    tenantId: String,
    isPublished: Boolean,
});
toppingSchema.plugin(aggregatePaginate);
const ToppingModel = mongoose.model("topping", toppingSchema);

export default ToppingModel;
