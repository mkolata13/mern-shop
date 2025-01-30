import express, { Router } from "express";
import controller from "../controller/authController";

const router = Router();

router.get("/", controller.getUsers);
router.post("/register", controller.handleNewUser);
router.post("/login", controller.handleLogin);
router.get("/refresh", controller.handleRefreshToken);
router.get("/logout", controller.handleLogout);

export default router;
