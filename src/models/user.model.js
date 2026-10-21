import mongoose from "mongoose";
import { hash, compare } from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: [true, "username must be unique"],
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "email must be unique"],
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
    verified: {
        type: Boolean,
        default: false,
    },
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return compare(candidatePassword, this.password);
};

export const userModel = mongoose.model("User", userSchema);
