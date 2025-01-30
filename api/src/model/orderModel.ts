import { prop, pre, getModelForClass, Ref } from "@typegoose/typegoose";
import { OrderStatus } from "./orderStatusModel";
import { Product } from "./productModel";

class OrderOpinion {
  @prop({
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: function (v) {
        return Number.isInteger(v) && v >= 1 && v <= 5;
      },
      message: (props) => `${props.value} must be an integer between 1 and 5!`,
    },
  })
  rating: number;

  @prop()
  content: string;
}

class OrderItem {
  @prop({ ref: () => Product, required: true })
  product: Ref<Product>;

  @prop({
    required: true,
    min: 1,
    validate: {
      validator: function (v) {
        return Number.isInteger(v) && v > 0;
      },
      message: (props) => `${props.value} must be a positive whole number!`,
    },
  })
  amount: number;

  @prop({
    required: [true, "Price is required"],
    min: [0.01, "Price must be greater than 0"],
  })
  price: number;
}

@pre<Order>("save", async function () {
  const defaultStatus = await getModelForClass(OrderStatus)
    .findOne({ name: "UNAPPROVED" })
    .exec();
  if (defaultStatus) {
    this.status = defaultStatus;
  }
})
export class Order {
  @prop({
    required: [true, "Username is required"],
    minlength: [1, "Username must not be empty"],
  })
  username: string;

  @prop({
    required: [true, "Email is required"],
    minlength: [1, "Email must not be empty"],
    match: [/.+@.+\..+/, "Not a proper email."],
  })
  email: string;

  @prop({
    required: [true, "phoneNumber is required"],
    validate: {
      validator: function (v) {
        return /\d{9}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  })
  phoneNumber: string;

  @prop({ default: null })
  confirmationDate: Date;

  @prop({ ref: () => OrderStatus, default: null })
  status: Ref<OrderStatus>;

  @prop({ type: () => [OrderItem], required: true })
  items: OrderItem[];

  @prop({ type: () => OrderOpinion })
  opinion: OrderOpinion;
}

const OrderModel = getModelForClass(Order);

export default OrderModel;
