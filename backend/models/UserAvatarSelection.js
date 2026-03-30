const mongoose = require('mongoose');
const { userDB } = require('../config/database');

const userAvatarProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        trim: true,
        unique: true,
        index: true
    },
    // Current avatar selections
    selections: {
        skin: {
            type: String,
            default: 's1'
        },
        armour: {
            type: String,
            default: 'ar1'
        },
        hairStyle: {
            type: String,
            default: 'h1'
        },
        hairColor: {
            type: String,
            default: 'hc1'
        },
        animalEars: {
            type: String,
            default: 'e1'
        },
        pet: {
            type: String,
            default: null
        }
    },
    // Owned items with metadata
    ownedItems: [
        {
            itemId: {
                type: String,
                required: true
            },
            ownedAt: {
                type: Date,
                default: Date.now
            },
            source: {
                type: String,
                enum: ['default', 'quest', 'reward', 'purchase', 'achievement'],
                default: 'default'
            },
            metadata: {
                type: mongoose.Schema.Types.Mixed,
                default: null
            }
        }
    ],
    lastUpdated: {
        type: Date,
        default: Date.now
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

// Update lastUpdated timestamp before saving
userAvatarProfileSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

// Helper method to check if user owns an item
userAvatarProfileSchema.methods.ownsItem = function(itemId) {
    return this.ownedItems.some(item => item.itemId === itemId);
};

// Helper method to grant item to user
userAvatarProfileSchema.methods.grantItem = function(itemId, source = 'reward', metadata = null) {
    if (!this.ownsItem(itemId)) {
        this.ownedItems.push({
            itemId,
            ownedAt: new Date(),
            source,
            metadata
        });
    }
    return this;
};

// Helper method to get all owned item IDs
userAvatarProfileSchema.methods.getOwnedItemIds = function() {
    return this.ownedItems.map(item => item.itemId);
};

// Helper method to update selections (with validation of owned items)
userAvatarProfileSchema.methods.updateSelections = function(newSelections) {
    const itemIds = Object.values(newSelections).filter(id => id && id !== null);
    const allOwned = itemIds.every(id => this.ownsItem(id));
    
    if (!allOwned) {
        throw new Error('User does not own all selected items');
    }
    
    this.selections = { ...this.selections, ...newSelections };
    return this;
};

module.exports = userDB.model('UserAvatarProfile', userAvatarProfileSchema);
