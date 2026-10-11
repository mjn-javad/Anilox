import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Pencil, Plus, Package } from "lucide-react";
import { Link } from "react-router-dom";
import apiClientBrand from "../../services/api-client_brand";
import MessageAlert from "../Shared/MessageAlert";

const brandImageUrl = (image) => {
  if (!image) return "";
  return image.startsWith("http") ? image : `/api/images/barnds/${image}`;
};

const BrandManager = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiClientBrand.get("/")
      .then(({ data }) => active && setBrands(Array.isArray(data?.data) ? data.data : []))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Could not load brands"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Brand Management</h1><p className="mt-2 text-sm text-gray-500">Change a brand name, slug and image.</p></div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/dashboard/products-manager" className="flex items-center gap-2 border border-gray-300 px-4 py-3 text-sm"><Package size={17} />Products</Link>
          <Link to="/admin/dashboard/brand-upload" className="flex items-center gap-2 bg-gray-900 px-4 py-3 text-sm text-white"><Plus size={17} />New brand</Link>
        </div>
      </div>
      {error && <MessageAlert message={error} type="error" />}
      {loading && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((item) => <div key={item} className="h-80 animate-pulse bg-gray-100" />)}</div>}
      {!loading && !error && brands.length === 0 && <div className="border border-gray-200 py-20 text-center text-gray-500">No brands have been created yet.</div>}
      {!loading && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => <article key={brand.id} className="overflow-hidden border border-gray-200 bg-white">
          <div className="flex h-52 items-center justify-center bg-gray-50 p-5">
            {brand.image ? <img src={brandImageUrl(brand.image)} alt={brand.name} className="h-full w-full object-contain" /> : <div className="flex flex-col items-center gap-3 text-gray-400"><ImageIcon size={42} /><span className="text-sm">No image</span></div>}
          </div>
          <div className="p-5"><h2 className="text-xl">{brand.name}</h2><p className="mt-2 break-all text-xs text-gray-500">{brand.slug}</p>
            <Link to={`/admin/dashboard/editBrand/${brand.id}`} className="mt-5 flex w-full items-center justify-center gap-2 bg-gray-900 py-3 text-sm text-white"><Pencil size={16} />Edit brand</Link>
          </div>
        </article>)}
      </div>}
    </div>
  );
};

export default BrandManager;
