"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  X,
  Check,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import type { AdPlacement, AdType, CMSAd } from "@/services/cms";

// Placement options
const PLACEMENTS: { value: AdPlacement; label: string }[] = [
  { value: "header", label: "Header (728x90)" },
  { value: "sidebar", label: "Sidebar (300x250)" },
  { value: "infeed", label: "In-Feed (728x90)" },
  { value: "article_top", label: "Article Top (728x90)" },
  { value: "article_middle", label: "Article Middle (728x250)" },
  { value: "article_bottom", label: "Article Bottom (728x250)" },
  { value: "footer", label: "Footer (728x250)" },
  { value: "mobile_sticky", label: "Mobile Sticky (320x50)" },
];

// Ad type options
const AD_TYPES: { value: AdType; label: string; description: string }[] = [
  { value: "adsense", label: "Google AdSense", description: "AdSense script code" },
  { value: "image", label: "Sponsored Image", description: "Image advertisement with link" },
  { value: "html", label: "Custom HTML", description: "Custom HTML/banner code" },
];

interface AdFormData {
  title: string;
  type: AdType;
  placement: AdPlacement;
  code: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate: string;
}

const initialFormData: AdFormData = {
  title: "",
  type: "adsense",
  placement: "sidebar",
  code: "",
  imageUrl: "",
  link: "",
  isActive: true,
  priority: 1,
  startDate: "",
  endDate: "",
};

export default function AdManager() {
  const [ads, setAds] = useState<CMSAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlacement, setFilterPlacement] = useState<AdPlacement | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<CMSAd | null>(null);
  const [formData, setFormData] = useState<AdFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewAd, setPreviewAd] = useState<CMSAd | null>(null);

  // Fetch ads
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterPlacement !== "all") {
        params.set("placement", filterPlacement);
      }
      
      const response = await fetch(`/api/ads?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setAds(data.data || []);
      } else {
        setError(data.message || "Failed to fetch ads");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterPlacement]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const method = editingAd ? "PUT" : "POST";
      const url = editingAd ? `/api/ads?id=${editingAd.id}` : "/api/ads";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingAd ? "Ad updated successfully!" : "Ad created successfully!");
        setShowModal(false);
        setEditingAd(null);
        setFormData(initialFormData);
        fetchAds();
      } else {
        setError(data.message || "Failed to save ad");
      }
    } catch (err) {
      setError("Failed to save ad");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const response = await fetch(`/api/ads?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Ad deleted successfully!");
        fetchAds();
      } else {
        setError(data.message || "Failed to delete ad");
      }
    } catch (err) {
      setError("Failed to delete ad");
      console.error(err);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (ad: CMSAd) => {
    try {
      const response = await fetch(`/api/ads?id=${ad.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !ad.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Ad ${ad.isActive ? "deactivated" : "activated"} successfully!`);
        fetchAds();
      } else {
        setError(data.message || "Failed to update ad");
      }
    } catch (err) {
      setError("Failed to update ad");
      console.error(err);
    }
  };

  // Open edit modal
  const handleEdit = (ad: CMSAd) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || "",
      type: ad.type || "adsense",
      placement: ad.placement || "sidebar",
      code: ad.code || "",
      imageUrl: ad.imageUrl || "",
      link: ad.link || "",
      isActive: ad.isActive ?? true,
      priority: ad.priority || 1,
      startDate: ad.startDate ? ad.startDate.split("T")[0] : "",
      endDate: ad.endDate ? ad.endDate.split("T")[0] : "",
    });
    setShowModal(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingAd(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  // Filter ads
  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.placement?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlacement = filterPlacement === "all" || ad.placement === filterPlacement;
    return matchesSearch && matchesPlacement;
  });

  // Get placement label
  const getPlacementLabel = (placement: string) => {
    return PLACEMENTS.find((p) => p.value === placement)?.label || placement;
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    return AD_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Ad Manager</h1>
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm bg-primary-foreground/10 px-3 py-1 rounded hover:bg-primary-foreground/20"
            >
              <ExternalLink size={14} />
              View Site
            </a>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary-foreground text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary-foreground/90 transition-colors"
          >
            <Plus size={20} />
            Create New Ad
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <Check size={20} />
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-muted-foreground" />
            <select
              value={filterPlacement}
              onChange={(e) => setFilterPlacement(e.target.value as AdPlacement | "all")}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Placements</option>
              {PLACEMENTS.map((placement) => (
                <option key={placement.value} value={placement.value}>
                  {placement.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ads Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading ads...
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No ads found. Create your first ad to get started.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Placement</th>
                  <th className="text-left px-4 py-3 font-medium">Priority</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAds.map((ad) => (
                  <tr key={ad.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(ad)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          ad.isActive 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {ad.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        {ad.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium">{ad.title || "Untitled"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-muted rounded text-sm">
                        {getTypeLabel(ad.type || "adsense")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getPlacementLabel(ad.placement || "sidebar")}
                    </td>
                    <td className="px-4 py-3 text-sm">{ad.priority || 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewAd(ad)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingAd ? "Edit Ad" : "Create New Ad"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Ad Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter ad title"
                  required
                />
              </div>

              {/* Type and Placement */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AdType })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {AD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Placement</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as AdPlacement })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {PLACEMENTS.map((placement) => (
                      <option key={placement.value} value={placement.value}>
                        {placement.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type-specific fields */}
              {(formData.type === "adsense" || formData.type === "html") && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {formData.type === "adsense" ? "AdSense Code" : "HTML Code"}
                  </label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    rows={4}
                    placeholder={formData.type === "adsense" 
                      ? '<ins class="adsbygoogle" data-ad-client="..." data-ad-slot="..."></ins>'
                      : '<div class="custom-ad">Your HTML here</div>'
                    }
                    required={formData.type === "adsense"}
                  />
                </div>
              )}

              {formData.type === "image" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://example.com/ad-banner.jpg"
                      required={formData.type === "image"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link URL</label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://advertiser.com"
                      required={formData.type === "image"}
                    />
                  </div>
                </>
              )}

              {/* Priority and Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active (show on site)
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date (optional)</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date (optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingAd ? "Update Ad" : "Create Ad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-lg w-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Ad Preview</h2>
              <button
                onClick={() => setPreviewAd(null)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-muted rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                {previewAd.type === "adsense" && previewAd.code && (
                  <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: previewAd.code }} 
                  />
                )}
                {previewAd.type === "image" && previewAd.imageUrl && (
                  <a
                    href={previewAd.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={previewAd.imageUrl}
                      alt={previewAd.title}
                      className="max-w-full h-auto"
                    />
                  </a>
                )}
                {previewAd.type === "html" && previewAd.code && (
                  <div dangerouslySetInnerHTML={{ __html: previewAd.code }} />
                )}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>Title:</strong> {previewAd.title}</p>
                <p><strong>Type:</strong> {getTypeLabel(previewAd.type || "adsense")}</p>
                <p><strong>Placement:</strong> {getPlacementLabel(previewAd.placement || "sidebar")}</p>
                <p><strong>Status:</strong> {previewAd.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
