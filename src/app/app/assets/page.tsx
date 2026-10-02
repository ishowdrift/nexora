'use client';

// ==============================================================================
// NEXORA DIGITAL ASSET MANAGEMENT (/app/assets)
// Partitioned file storage with type filters, quota telemetry, and RBAC enforcement
// ==============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileBox,
  Upload,
  Search,
  Filter,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  Palette,
  FileCode,
  HardDrive,
  File,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { formatBytes, getPlanLimits } from '@/lib/entitlements';
import { Asset, AssetType } from '@/types/database';

export default function AssetsPage() {
  const {
    currentOrg,
    assets,
    subscription,
    usageStats,
    uploadAsset,
    deleteAsset,
    canPerform,
  } = useNexora();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [assetForm, setAssetForm] = useState({
    name: '',
    description: '',
    type: 'DOCUMENT' as AssetType,
    simulatedSizeMB: '5.5',
    mime_type: 'application/pdf',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canUpload = canPerform('upload_assets');
  const canDelete = canPerform('delete_assets');

  const planLimits = getPlanLimits(subscription?.plan || 'FREE');
  const storagePercentage = (usageStats.storage_used / planLimits.maxStorageBytes) * 100;

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [assets, searchQuery, typeFilter]);

  const handleOpenUpload = () => {
    setAssetForm({
      name: '',
      description: '',
      type: 'DOCUMENT',
      simulatedSizeMB: '4.2',
      mime_type: 'application/pdf',
    });
    setUploadError(null);
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name.trim()) {
      setUploadError('Asset file name is required');
      return;
    }
    const bytes = Math.round(parseFloat(assetForm.simulatedSizeMB || '1') * 1024 * 1024);
    setIsSubmitting(true);
    setUploadError(null);
    try {
      await uploadAsset({
        name: assetForm.name.trim(),
        description: assetForm.description.trim(),
        type: assetForm.type,
        file_size: bytes,
        mime_type: assetForm.mime_type,
      });
      setIsUploadModalOpen(false);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Delete '${asset.name}'? File will be removed from tenant storage.`)) return;
    try {
      await deleteAsset(asset.id);
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-sky-400" />;
      case 'BRAND':
        return <Palette className="w-5 h-5 text-purple-400" />;
      case 'CODE':
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      default:
        return <File className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2333]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <FileBox className="w-5 h-5 text-indigo-400" />
            Digital Asset Management
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Tenant-partitioned asset store for <strong className="text-gray-300">{currentOrg?.name}</strong>.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Upload className="w-3.5 h-3.5" />}
          onClick={handleOpenUpload}
          disabled={!canUpload.allowed}
          title={canUpload.reason}
        >
          Upload Asset
        </Button>
      </div>

      {/* Storage Quota Telemetry Banner */}
      <div className="p-4 rounded-xl bg-[#11131C] border border-[#232638] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-gray-300">Storage Used:</span>
              <span className="text-white font-bold">{formatBytes(usageStats.storage_used)}</span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400">{formatBytes(planLimits.maxStorageBytes)}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Enforced by Supabase Storage Bucket security policies: path prefix <code>/{currentOrg?.slug}/*</code>
            </p>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-gray-400">
            <span>Utilization</span>
            <span>{Math.round(storagePercentage)}%</span>
          </div>
          <div className="w-full h-2 bg-[#1B1E2B] rounded-full overflow-hidden">
            <div
              className={`h-full ${storagePercentage > 85 ? 'bg-rose-500' : 'bg-indigo-500'} transition-all`}
              style={{ width: `${Math.min(100, Math.max(0, storagePercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#12141F] border border-[#232638] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-[#12141F] text-gray-300 border border-[#232638] rounded-lg px-2.5 py-1.5 focus:outline-none"
            aria-label="Filter assets by category"
          >
            <option value="ALL">All Categories</option>
            <option value="DOCUMENT">Documents</option>
            <option value="PDF">PDFs</option>
            <option value="IMAGE">Images</option>
            <option value="BRAND">Brand Assets</option>
            <option value="CODE">Code & Archives</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <EmptyState
          icon={<FileBox className="w-6 h-6" />}
          title={searchQuery ? 'No matching assets' : 'No assets uploaded yet'}
          description={
            searchQuery
              ? 'Try modifying your search or filter criteria.'
              : 'Store team brand books, marketing guidelines, decks, and contracts in tenant-isolated cloud storage.'
          }
          actionLabel={searchQuery ? undefined : 'Upload Asset'}
          onAction={handleOpenUpload}
          actionDisabled={!canUpload.allowed}
          disabledReason={canUpload.reason}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-4 rounded-xl bg-[#11131C] border border-[#232638] hover:border-[#2F344D] flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2 rounded-lg bg-[#181B28] border border-[#262A3E]">
                    {getAssetIcon(asset.type)}
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-[#181A26] text-gray-400 border border-[#25283B]">
                    {asset.type}
                  </span>
                </div>

                <h3 className="mt-3 text-xs font-semibold text-white tracking-tight break-all line-clamp-1 group-hover:text-indigo-300 transition-colors">
                  {asset.name}
                </h3>

                <p className="mt-1 text-[11px] text-gray-400 line-clamp-2">
                  {asset.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1C1F2E] flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span>{formatBytes(asset.file_size)}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => alert(`Simulating secure presigned download for: ${asset.storage_path}`)}
                    className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                    title="Download Asset"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {canDelete.allowed && (
                    <button
                      onClick={() => handleDelete(asset)}
                      className="p-1 rounded text-gray-500 hover:text-rose-400 transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Asset Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Digital Asset"
        description={`File will be uploaded to tenant path '${currentOrg?.slug}/*' with RLS access rules.`}
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              File Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Corporate_Strategy_2026.pdf"
              value={assetForm.name}
              onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Summary of document contents..."
              value={assetForm.description}
              onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Asset Type
              </label>
              <select
                value={assetForm.type}
                onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value as AssetType })}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="DOCUMENT">DOCUMENT</option>
                <option value="PDF">PDF</option>
                <option value="IMAGE">IMAGE</option>
                <option value="BRAND">BRAND</option>
                <option value="CODE">CODE</option>
                <option value="ARCHIVE">ARCHIVE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Simulated File Size (MB)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="500"
                value={assetForm.simulatedSizeMB}
                onChange={(e) => setAssetForm({ ...assetForm, simulatedSizeMB: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Upload to Tenant Bucket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
