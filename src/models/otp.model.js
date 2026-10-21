import mongoose from "mongoose";
import { hash, compare } from "bcryptjs";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "email is required"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "user is required"],
        },
        otp: {
            type: String,
            required: [true, "otp is required"],
        },
    },
    { timestamps: true },
);

otpSchema.pre("save", async function () {
    if (!this.isModified("otp")) return;
    this.otp = await hash(this.otp, 10);
});

otpSchema.methods.compareOtp = function (candidateOtp) {
    return compare(candidateOtp, this.otp);
};

// Auto-expire otp documents 10 minutes after creation
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export const otpModel = mongoose.model("Otp", otpSchema);
