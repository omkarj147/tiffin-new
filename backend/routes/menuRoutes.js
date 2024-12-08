const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Menu = require('../models/Menu');

// Get all menu items - Public route
router.get('/', async (req, res) => {
  try {
    console.log('Fetching menu items');
    
    const menuItems = await Menu.find({ isDeleted: false })
      .sort({ createdAt: -1 });
    
    console.log('Found menu items:', menuItems ? menuItems.length : 0);
    
    if (!menuItems || menuItems.length === 0) {
      console.log('No menu items found');
      return res.status(404).json({ message: 'No menu items found' });
    }
    
    // Validate menu items before sending
    const validMenuItems = menuItems.filter(item => {
      const isValid = 
        item.dishName && 
        item.price && 
        item.mealType && 
        item.foodType && 
        item.portionSize;
      
      if (!isValid) {
        console.warn('Invalid menu item found:', item);
      }
      
      return isValid;
    });
    
    console.log('Sending valid menu items:', validMenuItems.length);
    res.json(validMenuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
});

// Add new menu item (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Adding new menu item for user:', req.user._id);
    
    if (req.user.userType !== 'admin') {
      console.log('Access denied. Admin only.');
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const menuItem = new Menu({
      dishName: req.body.dishName,
      mealType: req.body.mealType,
      foodType: req.body.foodType,
      portionSize: req.body.portionSize,
      price: req.body.price
    });

    // Validate menu item before saving
    const isValid = 
      menuItem.dishName && 
      menuItem.price && 
      menuItem.mealType && 
      menuItem.foodType && 
      menuItem.portionSize;
    
    if (!isValid) {
      console.error('Invalid menu item:', menuItem);
      return res.status(400).json({ message: 'Invalid menu item' });
    }

    const savedMenuItem = await menuItem.save();
    console.log('Menu item added successfully:', savedMenuItem);
    res.status(201).json(savedMenuItem);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(400).json({ message: 'Error adding menu item', error: error.message });
  }
});

// Update menu item (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating menu item for user:', req.user._id);
    
    if (req.user.userType !== 'admin') {
      console.log('Access denied. Admin only.');
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const updatedMenuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dishName: req.body.dishName,
          mealType: req.body.mealType,
          foodType: req.body.foodType,
          portionSize: req.body.portionSize,
          price: req.body.price,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );

    if (!updatedMenuItem) {
      console.log('Menu item not found');
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Validate updated menu item
    const isValid = 
      updatedMenuItem.dishName && 
      updatedMenuItem.price && 
      updatedMenuItem.mealType && 
      updatedMenuItem.foodType && 
      updatedMenuItem.portionSize;
    
    if (!isValid) {
      console.error('Invalid updated menu item:', updatedMenuItem);
      return res.status(400).json({ message: 'Invalid updated menu item' });
    }

    console.log('Menu item updated successfully:', updatedMenuItem);
    res.json(updatedMenuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(400).json({ message: 'Error updating menu item', error: error.message });
  }
});

// Soft delete menu item (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting menu item for user:', req.user._id);
    
    if (req.user.userType !== 'admin') {
      console.log('Access denied. Admin only.');
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isDeleted: true,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );

    if (!menuItem) {
      console.log('Menu item not found');
      return res.status(404).json({ message: 'Menu item not found' });
    }

    console.log('Menu item deleted successfully');
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(400).json({ message: 'Error deleting menu item', error: error.message });
  }
});

module.exports = router;
