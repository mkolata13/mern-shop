import { Category } from "./Category";

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    weight: number;
    category: Category;
}