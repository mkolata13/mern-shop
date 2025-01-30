import { getModelForClass, prop } from "@typegoose/typegoose";

export class OrderStatus {
  @prop({
    enum: ["UNAPPROVED", "APPROVED", "COMPLETED", "CANCELLED"],
    required: true,
    unique: true,
  })
  name: "UNAPPROVED" | "APPROVED" | "COMPLETED" | "CANCELLED";
}

const OrderStatusModel = getModelForClass(OrderStatus);

export default OrderStatusModel;
