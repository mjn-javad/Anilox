import axios from "axios";
import apiClientShoes from "../../services/api-client_shoes";
import apiClientBrand from "../../services/api-client_brand";

import React, { FormEvent, useEffect, useState } from "react";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";
import Button from "../Shared/Button";

const ShoeUploader = () => {
  const [form, setForm] = useState({
    type: "",
    brand: "",
    model: "",
    category: "",
    gender: "",
    price: "",
    discount_price: "",
    description: "",
    colors: "",
  });

  const [brands, setBrand] = useState([]);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    apiClientBrand
      .get("")
      .then((res) => setBrand(res.data.data))
      .catch((err) => setError(err));
  }, []);

  const handleChange = (nameKey, value) => {
    setForm({
      ...form,
      [nameKey]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError("");
      setMessage("");

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const res = await apiClientShoes.post("/", formData);

      setMessage(res.data.message);

      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container text-center my-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 max-w-md mx-auto"
      >
        <div>
          <label>Type</label>
          <select
            name="type"
            value={form.type}
            onChange={(event) =>
              handleChange(event.target.name, event.target.value)
            }
            className="bg-gray-200 mx-2 rounded-sm text-sm"
            required
          >
            <option value="">Select Type</option>
            <option value="shoe">Shoe</option>
            <option value="belt">Belt</option>
            <option value="bag">Bag</option>
            <option value="luggage">Luggage</option>
            <option value="glasses">Glasses</option>
            <option value="watch">Watch</option>
          </select>
        </div>

        <div>
          <label>Brand</label>
          <select
            name="brand"
            value={form.brand}
            onChange={(event) =>
              handleChange(event.target.name, event.target.value)
            }
            className="bg-gray-200 mx-2 rounded-sm text-sm"
            required
          >
            <option value="">Select Brand</option>
            {brands.map((brand, index) => (
              <option key={index} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {form.type === "shoe" && (
          <div>
            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={(event) =>
                handleChange(event.target.name, event.target.value)
              }
              className="bg-gray-200 mx-2 rounded-sm text-sm"
              required
            >
              <option value="">Select Category</option>
              <option value="sneaker">Sneaker</option>
              <option value="loafer">Loafer</option>
              <option value="formal">Formal</option>
              <option value="boot">Boot</option>
              <option value="sandal">Sandal</option>
              <option value="sport">Sport</option>
              <option value="classic">Classic</option>
              <option value="heels">Heels</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        <div>
          <label>Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={(event) =>
              handleChange(event.target.name, event.target.value)
            }
            className="bg-gray-200 mx-2 rounded-sm"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="genderless">Genderless</option>
          </select>
        </div>

        <InputField
          name="model"
          label="Model"
          value={form.model}
          onChange={(e) => handleChange(e.target.name, e.target.value)}
          required={true}
          placeholder="e.g., Air Max 97, Superstar, etc."
        />

        <InputField
          name="price"
          label="Price"
          type="number"
          value={form.price}
          onChange={(e) => handleChange(e.target.name, e.target.value)}
          required={true}
        />

        <InputField
          name="discount_price"
          label="Discount Price"
          type="number"
          value={form.discount_price}
          onChange={(e) => handleChange(e.target.name, e.target.value)}
        />

        <InputField
          name="colors"
          label="Colors (comma separated)"
          value={form.colors}
          onChange={(e) => handleChange(e.target.name, e.target.value)}
          placeholder="e.g., red, blue, black"
        />

        <InputField
          name="description"
          label="Description"
          value={form.description}
          onChange={(e) => handleChange(e.target.name, e.target.value)}
        />

        <div>
          <label className="block mb-2">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(event) => {
              if (event.target.files) {
                setFiles(Array.from(event.target.files));
              }
            }}
            className="px-5 py-2 rounded-2xl bg-gray-500 hover:bg-gray-400 duration-200"
          />
          {files.length > 0 && (
            <p className="text-sm mt-2">{files.length} file(s) selected</p>
          )}
        </div>

        <button
          type="submit"
          className={`px-4 py-2 ${isLoading ? "bg-gray-400" : "bg-blue-500"} text-white rounded`}
          disabled={isLoading}
        >
          {isLoading ? "Creating" : "Create Product"}
        </button>
        {message && <MessageAlert message={message} type="success" />}
        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default ShoeUploader;
