const express = require('express');
const router = express.Router();
const multer = require('multer');
const avatarController = require('../controllers/avatarController');

// Configure multer for image uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only accept PNG files
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG files are accepted'), false);
    }
  }
});

// ─── Avatar Items (Master Catalog) ─────────────────────────────────────────────
// GET all avatar items
router.get('/items', avatarController.getAllAvatarItems);

// GET avatar items by category
router.get('/items/category/:category', avatarController.getAvatarItemsByCategory);

// POST create new avatar item (admin only)
router.post('/items', avatarController.createAvatarItem);

// ─── Avatar Item Images ───────────────────────────────────────────────────────
// POST upload image for avatar item
router.post('/items/:itemId/image', upload.single('image'), avatarController.uploadAvatarItemImage);

// GET download image for avatar item
router.get('/items/:itemId/image', avatarController.getAvatarItemImage);

// DELETE image for avatar item
router.delete('/items/:itemId/image', avatarController.deleteAvatarItemImage);

// ─── User Avatar Profile (selections + owned items) ────────────────────────────
// GET user's avatar profile (includes selections and owned items)
router.get('/profile/:userId', avatarController.getUserAvatarProfile);

// PUT update user's avatar selections
router.put('/profile/:userId', avatarController.updateUserAvatarSelection);

// ─── User Avatar Ownership ────────────────────────────────────────────────────
// GET user's owned items (convenience endpoint)
router.get('/owned/:userId', avatarController.getUserOwnedItems);

// GET check if user owns specific item
router.get('/owns/:userId/:itemId', avatarController.checkUserOwnsItem);

// POST grant item to user (for quests, rewards, achievements)
router.post('/grant', avatarController.grantItemToUser);

module.exports = router;
