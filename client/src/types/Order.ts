import { Opinion } from "./Opinion";
import { OrderStatus } from "./OrderStatus";
import { Product } from "./Product";

export interface Order {
    _id: string,
    confirmationDate?: Date,
    status: OrderStatus,
    username: string,
    email: string,
    phoneNumber: string,
    items: [
        {
            amount: number,
            product: Product,
        }
    ],
    opinion?: Opinion,
};
