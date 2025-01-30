import { getModelForClass, prop } from "@typegoose/typegoose";

export class Category {
  @prop({
    required: [true, "Name of category is required."],
    unique: true,
    trim: true,
  })
  name: string;
}

const CategoryModel = getModelForClass(Category);

export default CategoryModel;
