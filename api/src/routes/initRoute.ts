import express, { Router } from "express";
import multer from "multer";
import controller from "../controller/initController";
import auth from "../middleware/verifyJWT";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  auth.verifyJwt(["EMPLOYEE"]),
  upload.single("file"),
  controller.initProductDb
);

export default router;
