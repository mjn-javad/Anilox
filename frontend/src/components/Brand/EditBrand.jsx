import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import apiClientBrand from "../../services/api-client_brand";
import { createBrandSlug } from "../../utils/createBrandSlug";
import InputField from "../Shared/InputField";
import MessageAlert from "../Shared/MessageAlert";

const brandImageUrl = (image) => image?.startsWith("http") ? image : `/api/images/barnds/${image}`;

const EditBrand = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [name, setName] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiClientBrand.get(`/${id}`)
      .then(({ data }) => { if (active) { setName(data?.data?.name || ""); setCurrentImage(data?.data?.image || ""); } })
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Brand not found"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const chooseImage = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/") || selected.size > 10 * 1024 * 1024) {
      setError("Select an image smaller than 10MB");
      event.target.value = "";
      return;
    }
    setError(""); setFile(selected); setPreview(URL.createObjectURL(selected));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return setError("Brand name is required");
    try {
      setUpdating(true); setError(""); setMessage("");
      const body = new FormData(); body.append("name", name.trim()); if (file) body.append("image", file);
      const { data } = await apiClientBrand.put(`/${id}`, body);
      setName(data?.data?.name || name.trim()); setCurrentImage(data?.data?.image || currentImage);
      setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = "";
      setMessage(data?.message || "Brand updated successfully");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update brand");
    } finally { setUpdating(false); }
  };

  if (loading) return <div className="container mx-auto px-4 py-10"><div className="mx-auto h-[520px] max-w-xl animate-pulse bg-gray-100" /></div>;
  return <div className="container mx-auto px-4 py-10">
    <button type="button" onClick={() => navigate("/admin/dashboard/brands")} className="mb-5 flex items-center gap-2 text-sm text-gray-600"><ArrowLeft size={17} />Back to brands</button>
    <form onSubmit={submit} className="mx-auto flex max-w-xl flex-col gap-y-5 bg-white p-6 shadow-lg">
      <div className="text-center"><h1 className="text-2xl font-semibold">Edit Brand</h1><p className="mt-2 text-sm text-gray-500">Changing the name updates the slug and all products automatically.</p></div>
      <InputField name="name" label="Name" value={name} onChange={(event) => setName(event.target.value)} required={true} />
      {name.trim() && <div className="border bg-gray-50 p-3 text-sm text-gray-600">Generated slug: <strong>{createBrandSlug(name)}</strong></div>}
      <div className="flex h-60 items-center justify-center border bg-gray-50 p-4">{preview || currentImage ? <img src={preview || brandImageUrl(currentImage)} alt={name} className="h-full w-full object-contain" /> : <div className="flex flex-col items-center gap-3 text-gray-400"><ImageIcon size={42} /><span>No image</span></div>}</div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseImage} className="w-full cursor-pointer border bg-gray-50 p-3 text-sm" />
      <button type="submit" disabled={updating} className="bg-blue-600 py-3 font-medium text-white disabled:bg-gray-400">{updating ? "Updating Brand..." : "Update Brand"}</button>
      {message && <MessageAlert message={message} type="success" />}{error && <MessageAlert message={error} type="error" />}
    </form>
  </div>;
};

export default EditBrand;
