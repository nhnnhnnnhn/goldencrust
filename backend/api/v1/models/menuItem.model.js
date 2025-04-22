const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const menuItemSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    discountPercentage: Number,
    categoryId: String,
    thumbnail: String,
    images: [String],
    status: String,
    slug: {
        type: String,
        slug: 'title',
        unique: true
    },
    tags: [String],
    deleted: { 
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

const menuItem = mongoose.model('menuItem', menuItemSchema, 'menuItem');
module.exports = menuItem;