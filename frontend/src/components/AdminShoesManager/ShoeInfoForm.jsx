// components/Admin/ShoeManagement/ShoeInfoForm.jsx

import React from "react";
import InputField from "../Shared/InputField";

const ShoeInfoForm = ({ shoeInfo, onChange, onUpdate, updating }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Product Information
      </h2>

      <div className="space-y-4">
        <InputField
          name="name"
          label="Product Name"
          value={shoeInfo.name}
          onChange={onChange}
          required={true}
        />

        <InputField
          name="slug"
          label="Slug"
          value={shoeInfo.slug}
          onChange={onChange}
          required={true}
        />

        <InputField
          name="brand"
          label="Brand"
          value={shoeInfo.brand}
          onChange={onChange}
          required={true}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-400 bg-gray-100 cursor-not-allowed"
        />

        <InputField
          name="model"
          label="Model"
          value={shoeInfo.model}
          onChange={onChange}
          required={true}
        />

        {shoeInfo.type === "shoe" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>

            <select
              name="category"
              value={shoeInfo.category}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={null}></option>
              <option value="sneaker">Sneaker</option>
              <option value="loafer">Loafer</option>
              <option value="formal">Formal</option>
              <option value="boot">Boot</option>
              <option value="sandal">Sandal</option>
              <option value="sport">Sport</option>
              <option value="classic">Classic</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>

          <select
            name="gender"
            value={shoeInfo.gender}
            onChange={onChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="genderless">Genderless</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>

          <select
            name="type"
            value={shoeInfo.type}
            onChange={onChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="shoe">Shoe</option>
            <option value="belt">Belt</option>
            <option value="bag">Bag</option>
            <option value="luggage">Luggage</option>
            <option value="glasses">Glasses</option>
            <option value="watch">Watch</option>
          </select>
        </div>

        <InputField
          name="colors"
          label="Colors"
          value={shoeInfo.colors}
          onChange={onChange}
          placeholder="مثلاً مشکی، سفید، قهوه‌ای"
        />

        <InputField
          name="price"
          label="Price"
          value={shoeInfo.price}
          onChange={onChange}
          required={true}
        />

        <InputField
          name="discountPrice"
          label="Discount Price"
          value={shoeInfo.discountPrice}
          onChange={onChange}
          required={false}
        />

        <InputField
          name="description"
          label="Description"
          value={shoeInfo.description}
          onChange={onChange}
        />

        <button
          type="button"
          onClick={onUpdate}
          disabled={updating}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
        >
          {updating ? "Updating..." : "Update Information"}
        </button>
      </div>
    </div>
  );
};

export default ShoeInfoForm;
