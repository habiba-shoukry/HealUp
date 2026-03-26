/**
 * Avatar Utilities
 * Helper functions for avatar system operations
 */

const UserAvatarProfile = require('../models/UserAvatarSelection');

// Default owned items for new users
const DEFAULT_OWNED_ITEMS = [
  's1', 's2',           // Skins: Peach, Brown
  'h1', 'h2', 'h3', 'h4',  // Hair Styles: Default, Spiky, Long, Wavy
  'hc1', 'hc2', 'hc3',  // Hair Colors: Black, Brown, Blonde
  'e1', 'e2', 'e3', 'e4',  // Animal Ears: None, Cat, Bunny, Fox
  'ar1', 'ar2', 'ar3', 'ar4', 'ar5', 'ar6',  // Armour: Cloth, Iron, Purple, Gold, Shadow, Red
  'p1', 'p2', 'p4'      // Pets: Fire Dragon, Ice Dragon, Golden Wyvern
];

/**
 * Initialize avatar profile for a new user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Created user avatar profile
 */
exports.initializeUserAvatar = async (userId) => {
  try {
    // Create avatar profile with default selections and owned items
    const profile = await UserAvatarProfile.create({
      userId,
      selections: {
        skin: 's1',
        armour: 'ar1',
        hairStyle: 'h1',
        hairColor: 'hc1',
        animalEars: 'e1',
        pet: null,
      },
      ownedItems: DEFAULT_OWNED_ITEMS.map(itemId => ({
        itemId,
        source: 'default',
        ownedAt: new Date(),
      })),
    });

    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.error('Error initializing user avatar:', error);
    throw error;
  }
};

/**
 * Get user's complete avatar profile (selections + owned items)
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - User's avatar profile
 */
exports.getUserAvatarProfile = async (userId) => {
  try {
    let profile = await UserAvatarProfile.findOne({ userId });
    
    // Return default profile structure if not found
    if (!profile) {
      return {
        userId,
        selections: {
          skin: 's1',
          armour: 'ar1',
          hairStyle: 'h1',
          hairColor: 'hc1',
          animalEars: 'e1',
          pet: null,
        },
        ownedItems: [],
        ownedCount: 0,
      };
    }

    return {
      ...profile.toObject(),
      ownedCount: profile.ownedItems.length,
    };
  } catch (error) {
    console.error('Error getting user avatar profile:', error);
    throw error;
  }
};

/**
 * Check if user owns multiple items
 * @param {string} userId - The user ID
 * @param {Array<string>} itemIds - Array of item IDs to check
 * @returns {Promise<Object>} - Object mapping itemId to ownership status
 */
exports.checkItemsOwnership = async (userId, itemIds) => {
  try {
    const profile = await UserAvatarProfile.findOne({ userId });
    
    if (!profile) {
      const result = {};
      itemIds.forEach(itemId => {
        result[itemId] = false;
      });
      return result;
    }

    const ownedSet = new Set(profile.getOwnedItemIds());
    const result = {};

    itemIds.forEach(itemId => {
      result[itemId] = ownedSet.has(itemId);
    });

    return result;
  } catch (error) {
    console.error('Error checking item ownership:', error);
    throw error;
  }
};

/**
 * Validate avatar selections against owned items
 * @param {string} userId - The user ID
 * @param {Object} selections - The selections to validate
 * @returns {Promise<Object>} - Validation result with validity and reasons
 */
exports.validateAvatarSelections = async (userId, selections) => {
  try {
    const itemIds = Object.values(selections).filter(id => id && id !== null);
    const ownership = await exports.checkItemsOwnership(userId, itemIds);

    const valid = Object.values(ownership).every(owns => owns);
    const reasons = [];

    for (const [category, itemId] of Object.entries(selections)) {
      if (itemId && !ownership[itemId]) {
        reasons.push(`User doesn't own ${category}: ${itemId}`);
      }
    }

    return {
      valid,
      reasons,
    };
  } catch (error) {
    console.error('Error validating selections:', error);
    throw error;
  }
};

/**
 * Grant item to user
 * @param {string} userId - The user ID
 * @param {string} itemId - The item ID to grant
 * @param {string} source - Source of the item (default, quest, reward, etc.)
 * @returns {Promise<Object>} - Updated profile
 */
exports.grantItemToUser = async (userId, itemId, source = 'reward') => {
  try {
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
        ownedItems: [],
      });
    }

    if (!profile.ownsItem(itemId)) {
      profile.grantItem(itemId, source);
      await profile.save();
    }

    return profile;
  } catch (error) {
    console.error('Error granting item to user:', error);
    throw error;
  }
};
