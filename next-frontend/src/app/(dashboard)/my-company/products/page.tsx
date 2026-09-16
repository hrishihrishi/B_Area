/**
 * Grid containing all products
 * /components/modules/company/products
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Package, IndianRupee } from "lucide-react";

// Sample B2B Product Data
const sampleProducts = [
  {
    id: "PROD-001",
    name: "Industrial Steel Coils",
    category: "Raw Materials",
    price: 85000,
    moq: "5 Tons",
    status: "Verified",
  },
  {
    id: "PROD-002",
    name: "Enterprise Cloud CRM License",
    category: "Software & SaaS",
    price: 120000,
    moq: "10 Users",
    status: "Pending",
  },
  {
    id: "PROD-003",
    name: "Heavy Duty Forklift (Electric)",
    category: "Machinery",
    price: 1500000,
    moq: "1 Unit",
    status: "Verified",
  },
  {
    id: "PROD-004",
    name: "Bulk Organic Cotton Yarn",
    category: "Textiles",
    price: 450,
    moq: "500 kg",
    status: "Verified",
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for demonstration
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    moq: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Product Data:", formData);
    setIsModalOpen(false);
    // In a real app, you would submit to your backend here
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Product Catalog
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your B2B offerings and listings
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sampleProducts.map((product) => (
            <div key={product.id} className="b2b-card p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Package className="w-6 h-6" />
                </div>
                <span
                  className={
                    product.status === "Verified"
                      ? "badge-verified"
                      : "badge-pending"
                  }
                >
                  {product.status}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {product.category}
              </p>

              <div className="mt-auto space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium flex items-center">
                    <IndianRupee className="w-3 h-3 mr-1" />
                    {product.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MOQ:</span>
                  <span className="font-medium">{product.moq}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-lg flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Add New Product
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form
                onSubmit={handleSubmit}
                className="p-6 overflow-y-auto space-y-5"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    Product/Service Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., High-Grade Cement"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="text-sm font-medium text-foreground"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Machinery">Machinery & Equipment</option>
                    <option value="Software">Software & SaaS</option>
                    <option value="Textiles">Textiles & Apparel</option>
                    <option value="Services">Professional Services</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="price"
                      className="text-sm font-medium text-foreground"
                    >
                      Base Price (₹)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="moq"
                      className="text-sm font-medium text-foreground"
                    >
                      Min. Order Qty (MOQ)
                    </label>
                    <input
                      type="text"
                      id="moq"
                      name="moq"
                      required
                      value={formData.moq}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g., 100 Units"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}