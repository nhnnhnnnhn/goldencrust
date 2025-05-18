const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const menuItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [2, 'Title must be at least 2 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Discount percentage cannot be negative'],
        max: [100, 'Discount percentage cannot exceed 100']
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: [true, 'Category is required']
    },
    thumbnail: {
        type: String,
        required: [true, 'Thumbnail image is required']
    },
    images: {
        type: [String],
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= 5;
            },
            message: 'Cannot have more than 5 additional images'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'out_of_stock'],
            message: 'Status must be either active, inactive, or out_of_stock'
        },
        default: 'active'
    },
    slug: {
        type: String,
        slug: 'title',
        unique: true,
        slugPaddingSize: 2
    },
    tags: {
        type: [String],
        default: []
    },
    deleted: { 
        type: Boolean,
        default: false,
        select: false // Hide this field by default in queries
    },
    deletedAt: {
        type: Date,
        select: false // Hide this field by default in queries
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual field for final price after discount
menuItemSchema.virtual('finalPrice').get(function() {
    if (!this.discountPercentage) return this.price;
    const discount = (this.price * this.discountPercentage) / 100;
    return this.price - discount;
});

// Ensure deleted items don't show up in queries by default
menuItemSchema.pre('find', function() {
    if (!this._conditions.deleted) {
        this._conditions.deleted = false;
    }
});

menuItemSchema.pre('findOne', function() {
    if (!this._conditions.deleted) {
        this._conditions.deleted = false;
    }
});

const MenuItem = mongoose.model('menuItem', menuItemSchema, 'menuItem');
module.exports = MenuItem;