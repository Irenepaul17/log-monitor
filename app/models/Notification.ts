import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    receiverId: string; // The user ID (e.g., SSE) who receives the notification
    title: string;
    message: string;
    sourceType: 'asset-edit' | 'failure' | 'general';
    sourceId: string; // e.g., requestId or complaintId
    status: 'unread' | 'read';
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    receiverId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    sourceType: { type: String, enum: ['asset-edit', 'failure', 'general'], default: 'general' },
    sourceId: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread', index: true }
}, {
    timestamps: true
});

// Index for fetching unread notifications for a user efficiently
NotificationSchema.index({ receiverId: 1, status: 1 });

const NotificationModel: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default NotificationModel;
