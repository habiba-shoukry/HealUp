const mongoose = require('mongoose');
const { userDB } = require('../config/database');

const avatarItemSchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: [true, 'Item ID is required'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['skin', 'armour', 'hairStyle', 'hairColor', 'animalEars', 'pet'],
        required: [true, 'Category is required']
    },
    label: {
        type: String,
        required: [true, 'Label is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // Option 1: Store image file reference from GridFS
    imageFileId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    color: {
        type: String,
        trim: true,
        default: null
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    coinsRequired: {
        type: Number,
        default: 0,
        min: 0
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    unlockedAt: {
        type: Date,
        default: null
    },
    // Metadata about the stored image
    imageMetadata: {
        filename: String,
        size: Number,           // File size in bytes
        uploadedAt: Date,
        mimeType: String        // e.g., 'image/png'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = userDB.model('AvatarItem', avatarItemSchema);
