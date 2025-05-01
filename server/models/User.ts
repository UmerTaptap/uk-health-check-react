import mongoose, { Schema } from "mongoose";

export enum UserRole {
    Admin = "SUPER_ADMIN",
    Owner = "OWNER",
    Manager = "MANAGER",
}


interface User {
    // userId: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<User> = new Schema({

    // userId: {
    //     type: Number,
    //     required: true,
    // },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: UserRole,
        required: true,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const UserModel = mongoose.model<User>('User', UserSchema);

export default UserModel;

