// AddressPage.jsx - قسمت‌های تغییر کرده
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClientAuth from "../../services/api-client_auth";
import apiClientOrder from "../../services/api-client_order";
import MessageAlert from "../Shared/MessageAlert";
import SuccessAlert from "../Shared/SuccessAlert";
import InputField from "../Shared/InputField";
import LoadingSpinner from "../Shared/LoadingSpinner";

const AddressPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // State برای SuccessAlert
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Form state for new address
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postal_code: "",
  });

  // Fetch addresses list
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiClientAuth.get("/addresses");

      if (response.data.success) {
        setAddresses(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  // Add new address
  const handleAddAddress = async (e) => {
    e.preventDefault();

    if (
      !formData.full_name ||
      !formData.phone ||
      !formData.province ||
      !formData.city ||
      !formData.address ||
      !formData.postal_code
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await apiClientAuth.post("/addAddress", formData);

      if (response.data.success) {
        setSuccessMessage("Address added successfully!");
        setShowSuccess(true);

        setShowAddForm(false);
        setFormData({
          full_name: "",
          phone: "",
          province: "",
          city: "",
          address: "",
          postal_code: "",
        });
        await fetchAddresses();
      }
    } catch (err) {
      console.error("Error adding address:", err);
      setError(err.response?.data?.message || "Failed to add address");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle order submission
  const handleOrder = async () => {
    if (!selectedAddress) {
      setError("Please select an address before placing your order");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiClientOrder.post("/orders", {
        address_id: selectedAddress,
        payment_method: "onDelivery",
      });

      if (response.status === 201) {
        setSuccessMessage("Your order has been successfully placed!");
        setShowSuccess(true);
        setPendingNavigation("/");
      }
    } catch (error) {
      console.error("Order failed:", error);
      setError(
        error.response?.data?.message || "Order failed. Please try again.",
      );
      setLoading(false);
    }
  };

  // وقتی کاربر روی OK کلیک می‌کند
  const handleSuccessClose = () => {
    setShowSuccess(false);

    // اگر navigation در انتظار است، هدایت انجام شود
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  if (loading && addresses.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto my-8 p-4 max-w-4xl">
      {/* نمایش SuccessAlert به صورت مودال */}
      {showSuccess && (
        <SuccessAlert message={successMessage} onClose={handleSuccessClose} />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Addresses</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>+</span>
          <span>New Address</span>
        </button>
      </div>

      {error && <MessageAlert message={error} type="error" />}

      {/* Add New Address Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border">
          <h2 className="text-xl font-bold mb-4">Add New Address</h2>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="full_name"
                label="Full Name"
                value={formData.full_name}
                onChange={handleInputChange}
                required={true}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <InputField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                required={true}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <InputField
                name="province"
                label="Province"
                value={formData.province}
                onChange={handleInputChange}
                required={true}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <InputField
                name="city"
                label="City"
                value={formData.city}
                onChange={handleInputChange}
                required={true}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <InputField
                name="address"
                label="Full Address"
                value={formData.address}
                onChange={handleInputChange}
                required={true}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <InputField
                name="postal_code"
                label="Postal Code"
                value={formData.postal_code}
                onChange={handleInputChange}
                required={true}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 && !showAddForm ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-gray-600 mb-4">
            You haven't saved any addresses yet
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {addresses.map((address) => (
            <div
              key={address.id || address._id}
              className={`border rounded-lg p-4 cursor-pointer transition-all
                ${
                  selectedAddress === (address.id || address._id)
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              onClick={() => {
                setSelectedAddress(address.id || address._id);
                setError("");
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {address.full_name}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {address.phone}
                    </p>
                    <p>
                      <span className="font-semibold">Province:</span>{" "}
                      {address.province}
                    </p>
                    <p>
                      <span className="font-semibold">City:</span>{" "}
                      {address.city}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-semibold">Address:</span>{" "}
                      {address.address}
                    </p>
                    <p>
                      <span className="font-semibold">Postal Code:</span>{" "}
                      {address.postal_code}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Continue Button */}
      {addresses.length > 0 && (
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            onClick={() => navigate("/basket")}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            Back to Cart
          </button>
          <button
            onClick={handleOrder}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressPage;
