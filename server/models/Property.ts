import mongoose, { Schema } from "mongoose";


interface Property {
    name: string;
    address: string;
    description: string;
    owner: mongoose.Schema.Types.ObjectId;
    manager?: mongoose.Schema.Types.ObjectId;
    group?: mongoose.Schema.Types.ObjectId;
    propertyDetails: {
        type: string;
        units: number;
        build: number;
        lastRenovation: number;
        lastInspection: Date;
        propertyManager: mongoose.Schema.Types.ObjectId;
    },
    compliance: {
        currentStatus: string;
        riskLevel: string;
        riskReason: string;
    },
    createdAt: Date;
    updatedAt: Date;
}

const PropertySchema: Schema<Property> = new Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    },
    propertyDetails: {
        type: {
            type: String,
            // required: true,
        },
        units: {
            type: Number,
            // required: true,
        },
        build: {
            type: Number,
            // required: true,
        },
        lastRenovation: {
            type: Number,
            // required: true,
        },
        lastInspection: {
            type: Date,
            default: Date.now,
        },
        propertyManager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    compliance: {
        currentStatus: {
            type: String,
            required: true,
        },
        riskLevel: {
            type: String,
            // required: true,
        },
        riskReason: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    }
}, { timestamps: true });

const PropertyModel = mongoose.model<Property>('Property', PropertySchema);

export default PropertyModel;