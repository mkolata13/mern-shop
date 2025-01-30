import { Category } from "./Category";

export interface CartItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    weight: number;
    category: Category;
    amount: number;
}
