import { prop, Ref, buildSchema } from "@typegoose/typegoose";
import { mongoose } from "@typegoose/typegoose";
import { Category } from "./categoryModel";

export class Product {
  @prop({
    required: [true, "Name is required"],
    trim: true,
    minlength: [1, "Name must not be empty"],
  })
  name: string;

  @prop({
    required: [true, "Description is required"],
    trim: true,
    minlength: [1, "Description must not be empty"],
  })
  description: string;

  @prop({
    required: [true, "Price is required"],
    min: [0.01, "Price must be greater than 0"],
  })
  price: number;

  @prop({
    required: [true, "Weight is required"],
    min: [0.01, "Weight must be greater than 0"],
  })
  weight: number;

  @prop({ ref: () => Category, required: [true, "Category is required"] })
  category: Ref<Category>;
}

const ProductSchema = buildSchema(Product);
const ProductModel = mongoose.model("Product", ProductSchema);

export default ProductModel;
