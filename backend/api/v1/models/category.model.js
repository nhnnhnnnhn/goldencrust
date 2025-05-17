const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            default: "active"
        },
        slug: {
            type: String,
            slug: "name",
            unique: true
        },
        deleted: {
          type: Boolean,
          default: false
        },
        deletedAt: Date
      },
      {
        timestamps: true
      }
);

const Category = mongoose.model('Category', categorySchema, "categories");

module.exports = Category;