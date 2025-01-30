import bcrypt from "bcrypt";
import Logging from "../library/logging";
import Category from "../model/categoryModel";
import OrderStatus from "../model/orderStatusModel";
import UserModel from "../model/userModel";

const predefinedCategories = [
  { name: "Electronics" },
  { name: "Clothing" },
  { name: "Books" },
  { name: "Home & Kitchen" },
];

const predefinedOrderStatuses = [
  { name: "UNAPPROVED" },
  { name: "APPROVED" },
  { name: "CANCELLED" },
  { name: "COMPLETED" },
];

const predefinedEmployees = [
  {
    username: "pracownik1",
    password: "haslo123",
    role: "EMPLOYEE",
  },
];

export async function initializeDatabase() {
  try {
    for (const category of predefinedCategories) {
      const existingCategory = await Category.findOne({ name: category.name });
      if (!existingCategory) {
        await new Category(category).save();
      }
    }

    for (const status of predefinedOrderStatuses) {
      const existingStatus = await OrderStatus.findOne({ name: status.name });
      if (!existingStatus) {
        await new OrderStatus(status).save();
      }
    }

    for (const employee of predefinedEmployees) {
      const existingEmployee = await UserModel.findOne({ username: employee.username });
      if (!existingEmployee) {
        const hashedPassword = await bcrypt.hash(employee.password, 10);
        await new UserModel({ ...employee, password: hashedPassword, role: employee.role }).save();
      }
    }

    Logging.info("Database initialized with predefined content.");
  } catch (error) {
    Logging.error("Error initializing database: ");
    Logging.error(error);
  }
}
