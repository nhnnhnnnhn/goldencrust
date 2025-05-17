const Category = require('../models/category.model');
const controllerHandler = require('../../../helpers/controllerHandler');

module.exports.getCategories = controllerHandler(async (req, res) => {
    const categories = await Category.find({ deleted: false });
    res.status(200).json({ categories });
});

module.exports.getCategoryById = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ category });
});

module.exports.createCategory = controllerHandler(async (req, res) => {
    const { name, description, status, position, thumbnail } = req.body;
    const category = await Category.create({ name, description, status, position, thumbnail });
    res.status(201).json({ category });
});

module.exports.updateCategory = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, status, position, thumbnail } = req.body;
    const category = await Category.findByIdAndUpdate(id, { name, description, status, position, thumbnail }, { new: true });
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ category });
});

module.exports.deleteCategory = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, { deleted: true }, { new: true });
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
});

module.exports.updateCategoryStatus = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const category = await Category.findByIdAndUpdate(id, { status }, { new: true });
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ category });
});

module.exports.getCategoryBySlug = controllerHandler(async (req, res) => {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ category });
});

