import mongoose, { Schema, Document } from 'mongoose';

export interface Group {
    name: string;
    owner: mongoose.Types.ObjectId;
    manager: mongoose.Types.ObjectId;
}

const GroupSchema = new Schema<Group>({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<Group>('Group', GroupSchema);
