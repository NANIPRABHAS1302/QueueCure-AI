import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";

// ==========================
// Register User
// ==========================
export const registerUser = async (data) => {

    // Check if email or phone already exists
    const existing = await User.findOne({
        $or: [
            { email: data.email },
            { phone: data.phone }
        ]
    });

    if (existing) {
        throw new Error("User already exists");
    }

    // Hash Password
    const hash = await bcrypt.hash(data.password, 10);

    // Create User
    const user = await User.create({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: hash,
        role: data.role
    });

    // Remove password before sending response
    const userData = user.toObject();
    delete userData.password;

    return userData;
};

// ==========================
// Login User
// ==========================
export const loginUser = async (email, password) => {

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid Credentials");
    }

    // Compare Password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new Error("Invalid Credentials");
    }

    // Generate JWT Token
    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    // Remove password before sending response
    const userData = user.toObject();
    delete userData.password;

    return {
        success: true,
        message: "Login Successful",
        token,
        user: userData
    };
};