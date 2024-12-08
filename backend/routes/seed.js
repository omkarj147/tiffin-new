const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');

// Seed menu items
router.post('/menu', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // First, clear existing menu items
        await Menu.deleteMany({});

        // Sample menu items
        const menuItems = [
            {
                dishName: 'Veg Thali',
                price: 150,
                mealType: 'Lunch',
                foodType: 'Veg',
                portionSize: 'Full',
                isDeleted: false
            },
            {
                dishName: 'Chicken Thali',
                price: 180,
                mealType: 'Lunch',
                foodType: 'Non-veg',
                portionSize: 'Full',
                isDeleted: false
            },
            {
                dishName: 'Mini Veg Thali',
                price: 100,
                mealType: 'Dinner',
                foodType: 'Veg',
                portionSize: 'Half',
                isDeleted: false
            },
            {
                dishName: 'Special Thali',
                price: 200,
                mealType: 'Dinner',
                foodType: 'Veg',
                portionSize: 'Full',
                isDeleted: false
            },
            {
                dishName: 'Paneer Thali',
                price: 170,
                mealType: 'Lunch',
                foodType: 'Veg',
                portionSize: 'Full',
                isDeleted: false
            },
            {
                dishName: 'Fish Thali',
                price: 190,
                mealType: 'Lunch',
                foodType: 'Non-veg',
                portionSize: 'Full',
                isDeleted: false
            },
            {
                dishName: 'Mini Non-Veg Thali',
                price: 130,
                mealType: 'Dinner',
                foodType: 'Non-veg',
                portionSize: 'Half',
                isDeleted: false
            },
            {
                dishName: 'Premium Thali',
                price: 250,
                mealType: 'Dinner',
                foodType: 'Non-veg',
                portionSize: 'Full',
                isDeleted: false
            }
        ];

        // Validate menu items before insertion
        menuItems.forEach(item => {
            if (!item.dishName || !item.price || !item.mealType || !item.foodType || !item.portionSize) {
                throw new Error('Invalid menu item data');
            }
            if (item.foodType !== 'Veg' && item.foodType !== 'Non-veg') {
                throw new Error('Invalid foodType');
            }
            if (item.mealType !== 'Lunch' && item.mealType !== 'Dinner') {
                throw new Error('Invalid mealType');
            }
            if (item.portionSize !== 'Half' && item.portionSize !== 'Full') {
                throw new Error('Invalid portionSize');
            }
            if (typeof item.price !== 'number' || item.price <= 0) {
                throw new Error('Invalid price');
            }
        });

        // Insert menu items
        const result = await Menu.insertMany(menuItems);
        console.log('Seeded menu items:', result);
        
        res.status(201).json({
            message: 'Menu items seeded successfully',
            items: result
        });
    } catch (error) {
        console.error('Error seeding menu items:', error);
        res.status(500).json({
            message: 'Error seeding menu items',
            error: error.message
        });
    }
});

module.exports = router;
