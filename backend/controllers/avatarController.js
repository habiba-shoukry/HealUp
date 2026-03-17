const AvatarItem = require('../models/AvatarItem');
const UserAvatarProfile = require('../models/UserAvatarSelection');
const { uploadAvatarImage, getAvatarImage, deleteAvatarImage } = require('../utils/avatarImageStorage');

// ─── Get all available avatar items ────────────────────────────────────────────
exports.getAllAvatarItems = async (req, res) => {
    try {
        const items = await AvatarItem.find();
        res.status(200).json({
            success: true,
            data: items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching avatar items',
            error: error.message
        });
    }
};

// ─── Get items by category ────────────────────────────────────────────────────
exports.getAvatarItemsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const items = await AvatarItem.find({ category });
        res.status(200).json({
            success: true,
            data: items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching avatar items',
            error: error.message
        });
    }
};

// ─── Get user's avatar profile (selections + owned items) ────────────────────
exports.getUserAvatarProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        let profile = await UserAvatarProfile.findOne({ userId });
        
        // Create default profile if doesn't exist
        if (!profile) {
            profile = await UserAvatarProfile.create({
                userId,
                selections: {
                    skin: 's1',
                    armour: 'ar1',
                    hairStyle: 'h1',
                    hairColor: 'hc1',
                    animalEars: 'e1',
                    pet: null,
                },
                ownedItems: []
            });
        }
        
        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching avatar profile',
            error: error.message
        });
    }
};

// ─── Get user's owned avatar items ─────────────────────────────────────────────
exports.getUserOwnedItems = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const profile = await UserAvatarProfile.findOne({ userId });
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'User avatar profile not found'
            });
        }
        
        const itemIds = profile.getOwnedItemIds();
        const items = await AvatarItem.find({ itemId: { $in: itemIds } });
        
        res.status(200).json({
            success: true,
            data: items,
            count: items.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user owned items',
            error: error.message
        });
    }
};

// ─── Update user's avatar selections ───────────────────────────────────────────
exports.updateUserAvatarSelection = async (req, res) => {
    try {
        const { userId } = req.params;
        const { selections } = req.body;
        
        let profile = await UserAvatarProfile.findOne({ userId });
        
        if (!profile) {
            profile = new UserAvatarProfile({
                userId,
                selections: selections || {},
                ownedItems: []
            });
        } else {
            // Validate selections
            const itemIds = Object.values(selections).filter(id => id && id !== null);
            const allOwned = itemIds.every(id => profile.ownsItem(id));
            
            if (!allOwned) {
                return res.status(403).json({
                    success: false,
                    message: 'User does not own all selected items'
                });
            }
            
            profile.selections = { ...profile.selections, ...selections };
        }
        
        await profile.save();
        
        res.status(200).json({
            success: true,
            message: 'Avatar selection updated successfully',
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating avatar selection',
            error: error.message
        });
    }
};

// ─── Grant avatar item to user ────────────────────────────────────────────────
exports.grantItemToUser = async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        const { source = 'reward' } = req.body;
        
        // Check if item exists
        const item = await AvatarItem.findOne({ itemId });
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Avatar item not found'
            });
        }
        
        // Get or create user profile
        let profile = await UserAvatarProfile.findOne({ userId });
        if (!profile) {
            profile = await UserAvatarProfile.create({
                userId,
                selections: {
                    skin: 's1',
                    armour: 'ar1',
                    hairStyle: 'h1',
                    hairColor: 'hc1',
                    animalEars: 'e1',
                    pet: null,
                },
                ownedItems: []
            });
        }
        
        // Check if user already owns this item
        if (profile.ownsItem(itemId)) {
            return res.status(400).json({
                success: false,
                message: 'User already owns this item'
            });
        }
        
        // Grant the item
        profile.grantItem(itemId, source);
        await profile.save();
        
        res.status(201).json({
            success: true,
            message: 'Item granted to user successfully',
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error granting item to user',
            error: error.message
        });
    }
};

// ─── Check if user owns an item ────────────────────────────────────────────────
exports.checkUserOwnsItem = async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        
        const profile = await UserAvatarProfile.findOne({ userId });
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'User avatar profile not found'
            });
        }
        
        const owns = profile.ownsItem(itemId);
        
        res.status(200).json({
            success: true,
            owns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking ownership',
            error: error.message
        });
    }
};

// ─── Create avatar item (admin only) ───────────────────────────────────────────
exports.createAvatarItem = async (req, res) => {
    try {
        const { itemId, category, label, description, imageUrl, color, rarity, isDefault } = req.body;
        
        const item = await AvatarItem.create({
            itemId,
            category,
            label,
            description,
            imageUrl,
            color,
            rarity,
            isDefault
        });
        
        res.status(201).json({
            success: true,
            message: 'Avatar item created successfully',
            data: item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating avatar item',
            error: error.message
        });
    }
};

// ─── Upload avatar image for item ──────────────────────────────────────────────
exports.uploadAvatarItemImage = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Verify item exists
        const item = await AvatarItem.findOne({ itemId });
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Avatar item not found'
            });
        }

        // Upload image to GridFS
        const imageMetadata = await uploadAvatarImage(
            req.file.buffer,
            `${itemId}.png`,
            { itemId, category: item.category }
        );

        // Update item with image file reference
        item.imageFileId = imageMetadata.fileId;
        item.imageMetadata = {
            filename: imageMetadata.filename,
            size: imageMetadata.size,
            uploadedAt: imageMetadata.uploadedAt,
            mimeType: imageMetadata.mimeType
        };
        await item.save();

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                itemId: item.itemId,
                fileId: imageMetadata.fileId,
                filename: imageMetadata.filename,
                size: imageMetadata.size,
                uploadedAt: imageMetadata.uploadedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading avatar image',
            error: error.message
        });
    }
};

// ─── Download avatar image ────────────────────────────────────────────────────
exports.getAvatarItemImage = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        const item = await AvatarItem.findOne({ itemId });
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Avatar item not found'
            });
        }

        if (!item.imageFileId) {
            return res.status(404).json({
                success: false,
                message: 'No image found for this avatar item'
            });
        }

        // Retrieve image from GridFS
        const imageBuffer = await getAvatarImage(item.imageFileId);

        // Set response headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', imageBuffer.length);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

        res.send(imageBuffer);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving avatar image',
            error: error.message
        });
    }
};

// ─── Delete avatar image ──────────────────────────────────────────────────────
exports.deleteAvatarItemImage = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        const item = await AvatarItem.findOne({ itemId });
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Avatar item not found'
            });
        }

        if (!item.imageFileId) {
            return res.status(404).json({
                success: false,
                message: 'No image found for this avatar item'
            });
        }

        // Delete from GridFS
        await deleteAvatarImage(item.imageFileId);

        // Clear reference from item
        item.imageFileId = null;
        item.imageMetadata = null;
        await item.save();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting avatar image',
            error: error.message
        });
    }
};
