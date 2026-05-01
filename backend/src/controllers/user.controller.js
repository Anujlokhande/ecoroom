import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);

    throw new Error("Error generating tokens");
  }
};

export const registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const isExist = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (isExist) {
      return res.status(409).json({
        message: "User with this email or username already exists",
      });
    }

    const user = await User.create({
      email,
      username,
      password,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );
    if (!createdUser) {
      return res
        .status(500)
        .json({ message: "something went wrong while saving the user" });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      createdUser._id,
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(createdUser);
  } catch (error) {
    console.log("Error: ", error.message);
    console.log(error);

    return res.status(500).json("Error in register user");
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate input (either email or username)
    if (!email || !password) {
      return res.status(400).json({
        message: "Email/Username and password are required",
      });
    }

    // find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // compare password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    // remove sensitive data
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: loggedInUser,
        message: "Login successful",
      });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Error while logging in",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // req.user should come from auth middleware
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { refreshToken: 1 },
      },
      { new: true },
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        message: "Logged out successfully",
      });
  } catch (error) {
    return res.status(500).json({
      message: "Error while logging out",
    });
  }
};

export const RefreshToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      return res.status(400).json({
        message: "Unauthorized access not refresh token",
      });
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decoded?._id);

    if (!user) {
      return res.status(400).json({
        message: "refresh token not valid",
      });
    }

    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({
        message: "Refresh token expired or reused",
      });
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error ", error.message);
    return res.status(500).json({
      message: "Something went wrong while generating new tokens",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
      message: "Current user fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while fetching current user",
    });
  }
};
