import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/userModel";
import { config } from "../config/config";
import { handleError } from "../utils/errorHandler";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    return res.status(StatusCodes.OK).json({ users });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const handleNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, role } = req.body;
  const duplicate = await User.findOne({ username });
  if (duplicate) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ message: "Username already exists." });
  }
  try {
    const userRole = role || "CLIENT";

    if (!["CLIENT", "EMPLOYEE"].includes(userRole)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid role value." });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPwd,
      role: userRole,
    });

    await newUser.save();
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "User created successfully" });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Username and password are required." });
  }

  try {
    const foundUser = await User.findOne({ username }).exec();
    if (!foundUser) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid username or password." });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid username or password." });
    }
    const accessToken = jwt.sign(
      { username: foundUser.username, role: foundUser.role },
      config.jwt.access_token_key as string,
      { expiresIn: config.jwt.access_token_expiration as string }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username, role: foundUser.role },
      config.jwt.refresh_token_key as string,
      { expiresIn: config.jwt.refresh_token_expiration as string }
    );

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.OK).json({ accessToken: accessToken });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(StatusCodes.NO_CONTENT).json("No access token provided.");
  }

  const refreshToken = cookies.jwt;

  try {
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
      return res.status(StatusCodes.FORBIDDEN);
    }
    jwt.verify(
      refreshToken,
      config.jwt.refresh_token_key as string,
      (err: any, decoded: any) => {
        if (
          err ||
          typeof decoded !== "object" ||
          !decoded.username ||
          foundUser.username !== decoded.username
        ) {
          res.sendStatus(StatusCodes.FORBIDDEN);
          return;
        }

        const accessToken = jwt.sign(
          { username: decoded.username, role: decoded.role },
          config.jwt.access_token_key as string,
          { expiresIn: config.jwt.access_token_expiration }
        );
        return res.status(StatusCodes.OK).json({ accessToken: accessToken });
      }
    );
  } catch (error: any) {
    return handleError(error, res);
  }
};

const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No refresh token provided." });
  }

  const refreshToken = cookies.jwt;

  try {
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
      res.clearCookie("jwt", { httpOnly: true });
      return res
        .status(StatusCodes.OK)
        .json({ message: "User was not logged in but cookie cleared." });
    }

    await User.findOneAndUpdate({ refreshToken }, { refreshToken: "" });

    res.clearCookie("jwt", { httpOnly: true });
    return res
      .status(StatusCodes.OK)
      .json({ message: "Successfully logged out." });
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default {
  getUsers,
  handleNewUser,
  handleLogin,
  handleRefreshToken,
  handleLogout,
};
