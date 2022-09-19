import Categories from "../models/categories.js";

export const getAllCategories = async () => {
  const categories = await Categories.find();
  return categories;
};

export const addCategory = async (doc) => {
  const categories = await Categories.create({ ...doc });
  return categories;
};

export const deleteCategory = async (name) => {
  const categories = await Categories.deleteOne({ name: name });
  return categories;
};

export const getCategoryInfo = async (identifier) => {
  const categories = await Categories.findOne({ identifier: identifier });
  return categories._doc;
};
