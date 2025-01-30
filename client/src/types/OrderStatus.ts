import { OrderStatusEnum } from '../enums/OrderStatus.enum';

export interface OrderStatus {
    _id: string,
    name: OrderStatusEnum,
}