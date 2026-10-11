import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import apiClientBrand from "../../services/api-client_brand";
import { createBrandSlug } from "../../utils/createBrandSlug";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";

const BrandUploader = () => {
  const inputRef = useRef(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const chooseImage = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/") || selected.size > 10 * 1024 * 1024) {
      setError("Select an image smaller than 10MB"); event.target.value = ""; return;
    }
    setError(""); setFile(selected); setPreview(URL.createObjectURL(selected));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return setError("Brand name is required");
    try {
      setLoading(true); setError(""); setMessage("");
      const body = new FormData(); body.append("name", name.trim()); if (file) body.append("image", file);
      const { data } = await apiClientBrand.post("/", body);
      setMessage(data?.message || "Brand created successfully");
      setName(""); setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = "";
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Error creating brand");
    } finally { setLoading(false); }
  };

  return <div className="container mx-auto my-8 px-4">
    <form onSubmit={submit} className="mx-auto flex max-w-xl flex-col gap-y-5 bg-white p-6 shadow-lg">
      <div className="text-center"><h1 className="text-2xl font-semibold">Create Brand</h1><p className="mt-2 text-sm text-gray-500">The slug is generated automatically from the brand name.</p></div>
      <InputField name="name" label="Name" value={name} onChange={(event) => setName(event.target.value)} required={true} placeholder="Example: Louis Vuitton" />
      {name.trim() && <div className="border bg-gray-50 p-3 text-sm text-gray-600">Generated slug: <strong>{createBrandSlug(name)}</strong></div>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseImage} className="w-full cursor-pointer border bg-gray-50 p-3 text-sm" />
      {preview && <img src={preview} alt="Preview" className="mx-auto h-40 w-40 object-contain" />}
      <button type="submit" disabled={loading} className="bg-blue-600 py-3 font-medium text-white disabled:bg-gray-400">{loading ? "Creating Brand..." : "Create Brand"}</button>
      <Link to="/admin/dashboard/brands" className="text-center text-sm text-gray-600 underline">Manage existing brands</Link>
      {message && <MessageAlert message={message} type="success" />}{error && <MessageAlert message={error} type="error" />}
    </form>
  </div>;
};

export default BrandUploader;
