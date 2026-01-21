const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        familyName: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false, // by default password result me nahi aayega
        },
        role: {
            type: String,
            enum: ["user", "notary", "admin"],
            default: "user",
        },
        userName: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        address: {
            type: String,
        },
        country: {
            type: String,
            default: "IN",
        },
        userIdImage: {
            pdf: {
                type: String,
            },
            public_id: {
                type: String,
            },
        },
        userIdImageVerify: {
            type: Boolean,
            default: false,
        },
        advocateRegistrationNo: {
            type: String,
        },
        advocateJurisdiction: {
            type: String,
        },
        advocateExpireDate: {
            type: Date,
        },
        resetOtp: {
            type: Number,
        },
        resetOtpExpiry: {
            type: Date,
        },

        // KYC / verification
        kycStatus: {
            type: String,
            enum: ["not_started", "pending", "verified", "rejected"],
            default: "not_started",
        },
        kycMethod: {
            type: String,
            enum: ["aadhaar", "passport", "none"],
            default: "none",
        },

        // Aadhaar ko kabhi plain mat store karna, ya toh last4 ya hash
        aadhaarLast4: String,
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// ✅ password hash before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ✅ instance method for password compare
userSchema.methods.comparePassword = async function (plainPassword) {
    // console.log('Candidate password type:', typeof plainPassword);
    // console.log('Stored password type:', typeof this.password);
    // console.log('Candidate password:', plainPassword ? 'exists' : 'missing');
    // console.log('Stored password:', this.password ? 'exists' : 'missing');
    return await bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
