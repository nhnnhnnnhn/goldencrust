const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getCategories);
router.get('/active', categoryController.getActiveCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.patch('/:id/status', categoryController.updateCategoryStatus);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

module.exports = router;
