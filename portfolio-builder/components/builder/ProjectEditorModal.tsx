import { Button } from '@/components/ui/button';
import { ImageUploader } from './ImageUploader';
import {
  X, Plus, Trash2, MoveUp, MoveDown,
  Image as ImageIcon, Type, Grid3X3, Video, Code, Box,
  Link as LinkIcon, FileText, Palette
} from 'lucide-react';
import { generateId } from '@/lib/utils';

interface ProjectEditorModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  categoryName: string;
}

export function ProjectEditorModal({ project, isOpen, onClose, onSave, categoryName }: ProjectEditorModalProps) {
  const [formData, setFormData] = React.useState<Partial<Project>>({});
  const [mediaBlocks, setMediaBlocks] = React.useState<ProjectMediaBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (project && isOpen) {
      setFormData({ ...project });
      setMediaBlocks(project.mediaBlocks || []);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;


  const updateField = (field: keyof Project, value: any) => {

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addImage = () => {
    const newImage = {
      id: generateId(),
      url: '',
      caption: '',
    };
    updateField('images', [...(formData.images || []), newImage]);
  };

  const updateImage = (imageId: string, updates: { url?: string; caption?: string }) => {
    updateField('images', (formData.images || []).map(img =>
      img.id === imageId ? { ...img, ...updates } : img
    ));
  };

  const removeImage = (imageId: string) => {
    updateField('images', (formData.images || []).filter(img => img.id !== imageId));
  };

  // ===== Media Block Management =====
  const addMediaBlock = (type: ProjectMediaBlock['type']) => {
    const newBlock: ProjectMediaBlock = {
      id: generateId(),
      type,
      order: mediaBlocks.length,
      caption: '',
    };

    switch (type) {
      case 'image':
        newBlock.imageUrl = '';
        newBlock.imageCaption = '';
        break;
      case 'text':
        newBlock.textContent = {
          text: '',
          textAlign: 'left',
          fontSize: 'medium',
          fontWeight: 'normal',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
        };
        break;
      case 'photoGrid':
        newBlock.photoGridContent = {
          items: [],
          layout: 'grid',
          columns: 3,
          gap: 'medium',
          showCaptions: true,
        };
        break;
      case 'video':
      case 'youtube':
      case 'vimeo':
        newBlock.videoContent = {
          url: '',
          type: type === 'youtube' ? 'youtube' : type === 'vimeo' ? 'vimeo' : 'mp4',
          controls: true,
        };
        break;
      case 'embed':
      case 'figma':
      case 'sketchfab':
        newBlock.embedContent = {
          embedCode: '',
          source: type,
          url: '',
          aspectRatio: '16:9',
        };
        break;
      case 'pdf':
        newBlock.pdfContent = {
          url: '',
          fileName: '',
          caption: '',
          viewerWidth: 'full',
          viewerHeight: 600,
        };
        break;
    }

    const updatedBlocks = [...mediaBlocks, newBlock].map((block, index) => ({ ...block, order: index }));
    setMediaBlocks(updatedBlocks);
    setSelectedBlock(newBlock.id);
  };

  const removeMediaBlock = (blockId: string) => {
    const updatedBlocks = mediaBlocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));
    setMediaBlocks(updatedBlocks);
    if (selectedBlock === blockId) setSelectedBlock(null);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = mediaBlocks.findIndex(b => b.id === blockId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === mediaBlocks.length - 1)
    ) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedBlocks = [...mediaBlocks];
    const [removed] = updatedBlocks.splice(index, 1);
    updatedBlocks.splice(newIndex, 0, removed);
    updatedBlocks.forEach((block, i) => { block.order = i; });
    setMediaBlocks(updatedBlocks);
  };

  const updateMediaBlock = (blockId: string, updates: Partial<ProjectMediaBlock>) => {
    setMediaBlocks(mediaBlocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const handleImageUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateMediaBlock(blockId, { imageUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addPhotoGridItem = (blockId: string) => {
    const block = mediaBlocks.find(b => b.id === blockId);
    if (block?.photoGridContent) {
      const newItem: PhotoGridItem = {
        id: generateId(),
        url: '',
        caption: '',
      };
      updateMediaBlock(blockId, {
        photoGridContent: {
          ...block.photoGridContent,
          items: [...block.photoGridContent.items, newItem],
        } as PhotoGridContent,
      });
    }
  };

  const updatePhotoGridItem = (blockId: string, itemId: string, updates: Partial<PhotoGridItem>) => {
    const block = mediaBlocks.find(b => b.id === blockId);
    if (block?.photoGridContent) {
      updateMediaBlock(blockId, {
        photoGridContent: {
          ...block.photoGridContent,
          items: block.photoGridContent.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        } as PhotoGridContent,
      });
    }
  };

  const removePhotoGridItem = (blockId: string, itemId: string) => {
    const block = mediaBlocks.find(b => b.id === blockId);
    if (block?.photoGridContent) {
      updateMediaBlock(blockId, {
        photoGridContent: {
          ...block.photoGridContent,
          items: block.photoGridContent.items.filter(item => item.id !== itemId),
        } as PhotoGridContent,
      });
    }
  };

  const handlePhotoGridUpload = (blockId: string, itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updatePhotoGridItem(blockId, itemId, { url: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const block = mediaBlocks.find(b => b.id === blockId);
        updateMediaBlock(blockId, {
          videoContent: {
            ...block?.videoContent,
            url: ev.target?.result as string,
            type: 'mp4',
          } as VideoContent,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const block = mediaBlocks.find(b => b.id === blockId);
        updateMediaBlock(blockId, {
          pdfContent: {
            ...block?.pdfContent,
            url: ev.target?.result as string,
            fileName: file.name,
          } as PdfContent,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderMediaBlockEditor = (block: ProjectMediaBlock) => {
    const isSelected = selectedBlock === block.id;

    return (
      <div
        key={block.id}
        className={`border rounded-lg overflow-hidden transition-all ${isSelected ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'}`}
        onClick={() => setSelectedBlock(block.id)}
      >
        {/* Block Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
          <span className="text-xs font-medium text-gray-600 uppercase">{block.type}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
              className="p-1 text-gray-400 hover:bg-gray-200 rounded"
            >
              <MoveUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
              className="p-1 text-gray-400 hover:bg-gray-200 rounded"
            >
              <MoveDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeMediaBlock(block.id); }}
              className="p-1 text-red-400 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Block Content Editor */}
        <div className="p-3 space-y-3">
          {block.type === 'image' && (
            <>
              {block.imageUrl ? (
                <div className="relative">
                  <img src={block.imageUrl} alt="Preview" className="w-full rounded-lg" />
                  <button
                    onClick={() => updateMediaBlock(block.id, { imageUrl: '' })}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Upload Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(block.id, e)} />
                </label>
              )}
              <Input
                value={block.imageCaption || ''}
                onChange={(e) => updateMediaBlock(block.id, { imageCaption: e.target.value })}
                placeholder="Image caption (optional)"
                className="text-sm"
              />
            </>
          )}

          {block.type === 'text' && block.textContent && (
            <>
              <Textarea
                value={block.textContent.text || ''}
                onChange={(e) => updateMediaBlock(block.id, {
                  textContent: { ...block.textContent, text: e.target.value } as TextBlockContent
                })}
                placeholder="Enter text..."
                rows={4}
                className="text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={block.textContent.fontFamily || 'Arial, sans-serif'}
                  onChange={(e) => updateMediaBlock(block.id, {
                    textContent: { ...block.textContent, fontFamily: e.target.value } as TextBlockContent
                  })}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Inter, sans-serif">Inter</option>
                </select>
                <select
                  value={block.textContent.fontSize || 'medium'}
                  onChange={(e) => updateMediaBlock(block.id, {
                    textContent: { ...block.textContent, fontSize: e.target.value as any } as TextBlockContent
                  })}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">X-Large</option>
                </select>
                <button
                  onClick={() => updateMediaBlock(block.id, {
                    textContent: { ...block.textContent, fontWeight: block.textContent?.fontWeight === 'bold' ? 'normal' : 'bold' } as TextBlockContent
                  })}
                  className={`px-2 py-1 text-xs border rounded ${block.textContent.fontWeight === 'bold' ? 'bg-gray-200 font-bold' : ''}`}
                >
                  B
                </button>
                <select
                  value={block.textContent.textAlign || 'left'}
                  onChange={(e) => updateMediaBlock(block.id, {
                    textContent: { ...block.textContent, textAlign: e.target.value as any } as TextBlockContent
                  })}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
                <input
                  type="color"
                  value={block.textContent.color || '#000000'}
                  onChange={(e) => updateMediaBlock(block.id, {
                    textContent: { ...block.textContent, color: e.target.value } as TextBlockContent
                  })}
                  className="w-7 h-7 border rounded cursor-pointer"
                />
              </div>
            </>
          )}

          {block.type === 'photoGrid' && block.photoGridContent && (
            <>
              <div className="flex items-center gap-2">
                <select
                  value={block.photoGridContent.layout || 'grid'}
                  onChange={(e) => updateMediaBlock(block.id, {
                    photoGridContent: { ...block.photoGridContent, layout: e.target.value as any } as PhotoGridContent
                  })}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="grid">Grid</option>
                  <option value="masonry">Masonry</option>
                  <option value="slider">Slider</option>
                </select>
                <select
                  value={block.photoGridContent.columns?.toString() || '3'}
                  onChange={(e) => updateMediaBlock(block.id, {
                    photoGridContent: { ...block.photoGridContent, columns: parseInt(e.target.value) } as PhotoGridContent
                  })}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="2">2 Columns</option>
                  <option value="3">3 Columns</option>
                  <option value="4">4 Columns</option>
                </select>
              </div>
              <div className="space-y-2">
                {block.photoGridContent.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                    {item.url ? (
                      <img src={item.url} alt="" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <label className="flex items-center justify-center w-12 h-12 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoGridUpload(block.id, item.id, e)} />
                      </label>
                    )}
                    <Input
                      value={item.caption || ''}
                      onChange={(e) => updatePhotoGridItem(block.id, item.id, { caption: e.target.value })}
                      placeholder="Caption"
                      className="text-xs flex-1"
                    />
                    <button
                      onClick={() => removePhotoGridItem(block.id, item.id)}
                      className="p-1 text-red-400 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addPhotoGridItem(block.id)} className="w-full">
                  <Plus className="w-3 h-3 mr-1" /> Add Photo
                </Button>
              </div>
            </>
          )}

          {block.type === 'video' && block.videoContent && (
            <>
              <Input
                value={block.videoContent.url || ''}
                onChange={(e) => updateMediaBlock(block.id, {
                  videoContent: { ...block.videoContent, url: e.target.value, type: e.target.value.includes('youtube.com') || e.target.value.includes('youtu.be') ? 'youtube' : e.target.value.includes('vimeo.com') ? 'vimeo' : 'mp4' } as VideoContent
                })}
                placeholder="YouTube/Vimeo URL or upload MP4"
                className="text-sm"
              />
              <label className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <span className="text-xs text-gray-500">Or upload MP4 video</span>
                <input type="file" accept="video/mp4" className="hidden" onChange={(e) => handleVideoUpload(block.id, e)} />
              </label>
              <Input
                value={block.videoContent.caption || ''}
                onChange={(e) => updateMediaBlock(block.id, {
                  videoContent: { ...block.videoContent, caption: e.target.value } as VideoContent
                })}
                placeholder="Video caption (optional)"
                className="text-sm"
              />
            </>
          )}

          {(block.type === 'embed' || block.type === 'figma' || block.type === 'sketchfab') && block.embedContent && (
            <>
              <Textarea
                value={block.embedContent.embedCode || block.embedContent.url || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.startsWith('<')) {
                    updateMediaBlock(block.id, {
                      embedContent: { ...block.embedContent, embedCode: value } as EmbedContent
                    });
                  } else {
                    updateMediaBlock(block.id, {
                      embedContent: { ...block.embedContent, url: value } as EmbedContent
                    });
                  }
                }}
                placeholder="Paste embed code or URL..."
                rows={3}
                className="text-sm"
              />
              <Input
                value={block.embedContent.caption || ''}
                onChange={(e) => updateMediaBlock(block.id, {
                  embedContent: { ...block.embedContent, caption: e.target.value } as EmbedContent
                })}
                placeholder="Caption (optional)"
                className="text-sm"
              />
            </>
          )}

          {block.type === 'pdf' && block.pdfContent && (
            <>
              {block.pdfContent.url ? (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="w-5 h-5 text-red-500" />
                  <span className="text-xs flex-1 truncate">{block.pdfContent.fileName || 'PDF file'}</span>
                  <button
                    onClick={() => updateMediaBlock(block.id, { pdfContent: { ...block.pdfContent, url: '' } as PdfContent })}
                    className="p-1 text-red-400 hover:bg-red-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="text-xs text-gray-500">Upload PDF file</span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handlePdfUpload(block.id, e)} />
                </label>
              )}
              <Input
                value={block.pdfContent.url || ''}
                onChange={(e) => updateMediaBlock(block.id, {
                  pdfContent: { ...block.pdfContent, url: e.target.value } as PdfContent
                })}
                placeholder="Or paste PDF URL"
                className="text-sm"
              />
              <Input
                value={block.pdfContent.caption || ''}
                onChange={(e) => updateMediaBlock(block.id, {
                  pdfContent: { ...block.pdfContent, caption: e.target.value } as PdfContent
                })}
                placeholder="Caption (optional)"
                className="text-sm"
              />
            </>
          )}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    onSave({
      ...project,
      ...formData,
      mediaBlocks,
      category: categoryName,
    } as Project);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-[95vw] max-h-[95vh] overflow-hidden bg-white rounded-3xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
          <h2 className="text-xl font-semibold">Edit Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Project Details */}
          <div className="w-3/5 overflow-y-auto p-6 space-y-5 border-r border-gray-200">
            {/* Project Title */}
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Project Title"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date/Year</Label>
                <Input
                  value={formData.date || ''}
                  onChange={(e) => updateField('date', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
              <div>
                <Label>Client (Optional)</Label>
                <Input
                  value={formData.client || ''}
                  onChange={(e) => updateField('client', e.target.value)}
                  placeholder="Client name"
                />
              </div>
            </div>

            <div>
              <Label>Project Link (Optional)</Label>
              <Input
                value={formData.link || ''}
                onChange={(e) => updateField('link', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Cover Image */}
            <div>
              <Label>Cover Image</Label>
              <ImageUploader
                value={formData.imageUrl || ''}
                onChange={(url: string) => updateField('imageUrl', url)}
              />
            </div>

            {/* Short Description */}
            <div>
              <Label>Short Description</Label>
              <p className="text-xs text-gray-500 mb-2">This appears on the project tile</p>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief description for the project tile..."
                rows={2}
              />
            </div>

            {/* Full Description */}
            <div>
              <Label>Full Description</Label>
              <p className="text-xs text-gray-500 mb-2">This appears on the project detail page</p>
              <Textarea
                value={formData.fullDescription || ''}
                onChange={(e) => updateField('fullDescription', e.target.value)}
                placeholder="Detailed description of the project..."
                rows={4}
              />
            </div>

            {/* Tags */}
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={(formData.tags || []).join(', ')}
                onChange={(e) => updateField('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
                placeholder="Design, Branding, UI/UX"
              />
            </div>

            {/* Additional Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Additional Images</Label>
                  <p className="text-xs text-gray-500">Add more images for the project gallery</p>
                </div>
                <Button onClick={addImage} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </div>

              {formData.images && formData.images.length > 0 && (
                <div className="space-y-3">
                  {formData.images.map((img) => (
                    <div key={img.id} className="p-3 border rounded-xl bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-24">
                          <ImageUploader
                            value={img.url}
                            onChange={(url: string) => updateImage(img.id, { url })}
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">Caption (Optional)</Label>
                          <Input
                            value={img.caption || ''}
                            onChange={(e) => updateImage(img.id, { caption: e.target.value })}
                            placeholder="Image caption"
                            className="mt-1"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(img.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Add Content Panel + Media Blocks */}
          <div className="w-2/5 overflow-y-auto p-4 pb-48 space-y-4 bg-gray-50">
            {/* Add Content Panel */}
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Add Content</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addMediaBlock('image')}
                  className="flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs">Image</span>
                </button>
                <button
                  onClick={() => addMediaBlock('text')}
                  className="flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50"
                >
                  <Type className="w-5 h-5" />
                  <span className="text-xs">Text</span>
                </button>
                <button
                  onClick={() => addMediaBlock('photoGrid')}
                  className="flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50"
                >
                  <Grid3X3 className="w-5 h-5" />
                  <span className="text-xs">Photo Grid</span>
                </button>
                <button
                  onClick={() => addMediaBlock('video')}
                  className="flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50"
                >
                  <Video className="w-5 h-5" />
                  <span className="text-xs">Video</span>
                </button>
                <button
                  onClick={() => addMediaBlock('embed')}
                  className="flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50"
                >
                  <Code className="w-5 h-5" />
                  <span className="text-xs">Embed</span>
                </button>
                <button
                  onClick={() => addMediaBlock('figma')}
                  className="flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50"
                >
                  <Palette className="w-5 h-5" />
                  <span className="text-xs">Figma</span>
                </button>
                <button
                  onClick={() => addMediaBlock('sketchfab')}
                  className="flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50"
                >
                  <Box className="w-5 h-5" />
                  <span className="text-xs">3D</span>
                </button>
                <button
                  onClick={() => addMediaBlock('pdf')}
                  className="flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">PDF</span>
                </button>
              </div>
            </div>

            {/* Media Blocks */}
            {mediaBlocks.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
                <p className="text-sm">No content blocks yet</p>
                <p className="text-xs mt-1">Use the buttons above to add content</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mediaBlocks.map((block) => renderMediaBlockEditor(block))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Project
          </Button>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render at document.body level, escaping any parent containing blocks
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}
