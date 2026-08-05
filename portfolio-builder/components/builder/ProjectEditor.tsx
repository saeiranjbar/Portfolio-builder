'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectMediaBlock, TextBlockContent, PhotoGridContent, VideoContent, EmbedContent, PhotoGridItem, PdfContent } from '@/lib/types';
import { 
  Image as ImageIcon, 
  Type, 
  Grid3X3, 
  Video, 
  Code, 
  Box, 
  Link as LinkIcon,
  X,
  Save,
  Eye,
  Settings,
  CheckCircle,
  Trash2,
  MoveUp,
  MoveDown,
  Plus,
  Upload,
  Palette,
  FileText,
  ExternalLink,
  Download
} from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProjectEditorProps {
  project?: Project;
  onSave: (project: Project, shouldExit?: boolean) => void;
  onCancel: () => void;
  theme: any;
}


export function ProjectEditor({ project, onSave, onCancel, theme }: ProjectEditorProps) {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [fullDescription, setFullDescription] = useState(project?.fullDescription || '');
  const [coverImage, setCoverImage] = useState(project?.imageUrl || '');
  const [client, setClient] = useState(project?.client || '');
  const [tags, setTags] = useState(project?.tags?.join(', ') || '');
  const [category, setCategory] = useState(project?.category || '');
  const [link, setLink] = useState(project?.link || '');
  const [mediaBlocks, setMediaBlocks] = useState<ProjectMediaBlock[]>(project?.mediaBlocks || []);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showMediaToolbar, setShowMediaToolbar] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number>(-1);
  const [showStylesPanel, setShowStylesPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [bgColor, setBgColor] = useState(project?.bgColor || '#ffffff');
  const [textColor, setTextColor] = useState(project?.textColor || '#000000');
  const [accentColor, setAccentColor] = useState(project?.accentColor || '#0057E7');
  const [layoutStyle, setLayoutStyle] = useState(project?.layoutStyle || 'full-width');
  const [contentWidth, setContentWidth] = useState(project?.contentWidth || 'normal');
  const [showProjectTitle, setShowProjectTitle] = useState(project?.showProjectTitle !== false);
  const [showProjectDate, setShowProjectDate] = useState(project?.showProjectDate !== false);
  const [showProjectTags, setShowProjectTags] = useState(project?.showProjectTags !== false);
  const [showProjectCategory, setShowProjectCategory] = useState(project?.showProjectCategory !== false);
  const [showProjectClient, setShowProjectClient] = useState(project?.showProjectClient !== false);
  const [showProjectUrl, setShowProjectUrl] = useState(project?.showProjectUrl !== false);
  const [projectDate, setProjectDate] = useState(project?.date || '');


  const generateId = () => Math.random().toString(36).substr(2, 9);

  // When global text color changes, update all text blocks that don't have a custom color
  const handleTextColorChange = (newColor: string) => {
    setTextColor(newColor);
    // Update all text blocks to use the new global text color
    setMediaBlocks(mediaBlocks.map(block => {
      if (block.type === 'text' && block.textContent) {
        return {
          ...block,
          textContent: { ...block.textContent, color: newColor } as TextBlockContent
        };
      }
      return block;
    }));
  };


  const addMediaBlock = (type: ProjectMediaBlock['type']) => {
    const newBlock: ProjectMediaBlock = {
      id: generateId(),
      type,
      order: mediaBlocks.length,
      caption: '',
    };

    // Set default content based on type
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
      case 'spotify':
      case 'soundcloud':
      case 'giphy':
      case 'adobeXD':
      case 'adobeExpress':
      case 'instagram':
      case 'twitter':
      case 'facebook':
      case 'twitch':
      case 'codepen':
      case 'github':
      case 'dribbble':
      case 'behance':
      case 'artstation':
      case 'marvel':
      case 'invision':
      case 'prezi':
      case 'issuu':
      case 'slideshare':
      case 'googleMaps':
      case 'matterport':
      case 'kuula360':
      case 'tiled':
      case 'bandcamp':
      case 'mixcloud':
      case 'dailymotion':
      case 'imgur':
      case 'jotform':
      case 'wufoo':
      case 'lottie':
      case 'threejs':
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

    const position = insertPosition >= 0 ? insertPosition : mediaBlocks.length;
    const updatedBlocks = [...mediaBlocks];
    updatedBlocks.splice(position, 0, newBlock);
    
    // Update order for all blocks
    updatedBlocks.forEach((block, index) => {
      block.order = index;
    });
    
    setMediaBlocks(updatedBlocks);
    setSelectedBlock(newBlock.id);
    setShowMediaToolbar(false);
    setInsertPosition(-1);
  };

  const removeMediaBlock = (blockId: string) => {
    const updatedBlocks = mediaBlocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));
    setMediaBlocks(updatedBlocks);
    if (selectedBlock === blockId) {
      setSelectedBlock(null);
    }
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = mediaBlocks.findIndex(b => b.id === blockId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === mediaBlocks.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedBlocks = [...mediaBlocks];
    const [removed] = updatedBlocks.splice(index, 1);
    updatedBlocks.splice(newIndex, 0, removed);
    
    // Update order
    updatedBlocks.forEach((block, idx) => {
      block.order = idx;
    });
    
    setMediaBlocks(updatedBlocks);
  };

  const updateMediaBlock = (blockId: string, updates: Partial<ProjectMediaBlock>) => {
    setMediaBlocks(mediaBlocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateMediaBlock(blockId, { imageUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
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
        },
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
        },
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
        },
      });
    }
  };

  const buildProject = (): Project => {
    return {
      id: project?.id || generateId(),
      title,
      description,
      fullDescription,
      imageUrl: coverImage,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      client,
      category,
      link,
      date: projectDate,
      mediaBlocks,
      featured: project?.featured || false,
      // Style options
      bgColor,
      textColor,
      accentColor,
      layoutStyle,
      contentWidth,
      // Visibility settings
      showProjectTitle,
      showProjectDate,
      showProjectTags,
      showProjectCategory,
      showProjectClient,
      showProjectUrl,
    };
  };

  // Done = save but stay in editor (keep adding content)
  const handleDone = () => {
    onSave(buildProject(), false);
  };

  // Save = save and exit back to landing page
  const handleSave = () => {
    onSave(buildProject(), true);
  };

  // Auto-save to store whenever content changes (so isDirty gets set, enabling the main Save button)
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSave(buildProject(), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaBlocks, title, description, fullDescription, coverImage, client, tags, category, link, projectDate, bgColor, textColor, accentColor, layoutStyle, contentWidth, showProjectTitle, showProjectDate, showProjectTags, showProjectCategory, showProjectClient, showProjectUrl]);


  const renderMediaBlockEditor = (block: ProjectMediaBlock) => {
    const isSelected = selectedBlock === block.id;

    return (
      <div
        key={block.id}
        className={`relative mb-4 rounded-lg border-2 transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
        }`}
        onClick={() => setSelectedBlock(block.id)}
      >
        {/* Block Controls */}
        {isSelected && (
          <div className="absolute -top-10 right-0 flex items-center gap-1 bg-gray-900 rounded-lg p-1 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
              className="p-1.5 text-white hover:bg-gray-700 rounded"
              title="Move up"
            >
              <MoveUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
              className="p-1.5 text-white hover:bg-gray-700 rounded"
              title="Move down"
            >
              <MoveDown className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeMediaBlock(block.id); }}
              className="p-1.5 text-red-400 hover:bg-gray-700 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Block Content Editor */}
        <div className="p-4">
          {block.type === 'image' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ImageIcon className="w-4 h-4" />
                <span>Image Block</span>
              </div>
              {block.imageUrl ? (
                <div className="relative">
                  <OptimizedImage
                    src={block.imageUrl}
                    alt="Block image"
                    className="w-full h-auto rounded"
                    width={800}
                    height={600}
                  />
                  <button
                    onClick={() => updateMediaBlock(block.id, { imageUrl: '' })}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(block.id, e.target.files[0])}
                  />
                </label>
              )}
              <Input
                placeholder="Image caption (optional)"
                value={block.imageCaption || ''}
                onChange={(e) => updateMediaBlock(block.id, { imageCaption: e.target.value })}
                className="text-sm"
              />
            </div>
          )}

          {block.type === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Type className="w-4 h-4" />
                <span>Text Block</span>
              </div>
              <Textarea
                placeholder="Enter your text here..."
                value={block.textContent?.text || ''}
                onChange={(e) => updateMediaBlock(block.id, { 
                  textContent: { ...block.textContent, text: e.target.value } as TextBlockContent 
                })}
                className="min-h-[150px]"
                style={{
                  fontFamily: block.textContent?.fontFamily || 'Arial, sans-serif',
                  fontSize: block.textContent?.fontSize === 'small' ? '14px' : block.textContent?.fontSize === 'large' ? '20px' : block.textContent?.fontSize === 'xlarge' ? '24px' : '17px',
                  fontWeight: block.textContent?.fontWeight || 'normal',
                  color: block.textContent?.color || '#000000',
                  textAlign: block.textContent?.textAlign || 'left',
                }}
              />
              {/* Text formatting toolbar */}
              <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                {/* Font Family */}
                <select
                  value={block.textContent?.fontFamily || 'Arial, sans-serif'}
                  onChange={(e) => updateMediaBlock(block.id, { 
                    textContent: { ...block.textContent, fontFamily: e.target.value } as TextBlockContent 
                  })}
                  className="text-sm border rounded px-2 py-1 bg-white"
                  title="Font family"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                  <option value="'Courier New', Courier, monospace">Courier New</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                  <option value="'Palatino Linotype', Palatino, serif">Palatino</option>
                  <option value="Garamond, serif">Garamond</option>
                  <option value="'Comic Sans MS', cursive">Comic Sans</option>
                  <option value="Impact, sans-serif">Impact</option>
                  <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
                </select>

                {/* Font Size */}
                <select
                  value={block.textContent?.fontSize || 'medium'}
                  onChange={(e) => updateMediaBlock(block.id, { 
                    textContent: { ...block.textContent, fontSize: e.target.value as any } as TextBlockContent 
                  })}
                  className="text-sm border rounded px-2 py-1 bg-white"
                  title="Font size"
                >
                  <option value="small">Small (14px)</option>
                  <option value="medium">Medium (17px)</option>
                  <option value="large">Large (20px)</option>
                  <option value="xlarge">Extra Large (24px)</option>
                </select>

                {/* Bold toggle */}
                <button
                  onClick={() => updateMediaBlock(block.id, { 
                    textContent: { ...block.textContent, fontWeight: block.textContent?.fontWeight === 'bold' ? 'normal' : 'bold' } as TextBlockContent 
                  })}
                  className={`px-2 py-1 text-sm border rounded bg-white font-bold ${
                    block.textContent?.fontWeight === 'bold' ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'
                  }`}
                  title="Bold"
                >
                  B
                </button>

                {/* Text alignment */}
                <select
                  value={block.textContent?.textAlign || 'left'}
                  onChange={(e) => updateMediaBlock(block.id, { 
                    textContent: { ...block.textContent, textAlign: e.target.value as any } as TextBlockContent 
                  })}
                  className="text-sm border rounded px-2 py-1 bg-white"
                  title="Text alignment"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>

                {/* Color picker */}
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500">Color:</label>
                  <input
                    type="color"
                    value={block.textContent?.color || '#000000'}
                    onChange={(e) => updateMediaBlock(block.id, { 
                      textContent: { ...block.textContent, color: e.target.value } as TextBlockContent 
                    })}
                    className="w-8 h-8 border rounded cursor-pointer"
                    title="Text color"
                  />
                </div>
              </div>
            </div>
          )}

          {block.type === 'photoGrid' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Grid3X3 className="w-4 h-4" />
                <span>Photo Grid</span>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={block.photoGridContent?.layout || 'grid'}
                  onChange={(e) => updateMediaBlock(block.id, { 
                    photoGridContent: { ...block.photoGridContent, layout: e.target.value as any } as PhotoGridContent 
                  })}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="grid">Grid</option>
                  <option value="carousel">Carousel</option>

                </select>
                <select
                  value={block.photoGridContent?.columns?.toString() || '3'}
                  onChange={(e) => updateMediaBlock(block.id, { 
                    photoGridContent: { ...block.photoGridContent, columns: parseInt(e.target.value) } as PhotoGridContent 
                  })}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="2">2 Columns</option>
                  <option value="3">3 Columns</option>
                  <option value="4">4 Columns</option>
                </select>
              </div>
              {(() => {
                const cols = block.photoGridContent?.columns || 3;
                const items = block.photoGridContent?.items || [];
                const filledCount = items.filter(i => i.url).length;
                const needsMorePlaceholders = filledCount === items.length && items.length > 0;
                const placeholderCount = needsMorePlaceholders ? cols : (cols - (items.length % cols || cols));
                
                // Ensure there are always placeholder slots available
                let displayItems = [...items];
                if (needsMorePlaceholders) {
                  for (let i = 0; i < cols; i++) {
                    displayItems.push({ id: `placeholder-${Date.now()}-${i}`, url: '', caption: '' });
                  }
                } else {
                  const remainder = items.length % cols;
                  if (remainder > 0) {
                    for (let i = 0; i < cols - remainder; i++) {
                      displayItems.push({ id: `placeholder-${Date.now()}-${i}`, url: '', caption: '' });
                    }
                  } else if (items.length === 0) {
                    for (let i = 0; i < cols; i++) {
                      displayItems.push({ id: `placeholder-${Date.now()}-${i}`, url: '', caption: '' });
                    }
                  }
                }

                return (
                  <>
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                      {displayItems.map((item) => (
                        <div key={item.id} className="relative group">
                          {item.url ? (
                            <OptimizedImage
                              src={item.url}
                              alt={item.caption || 'Grid item'}
                              className="w-full h-32 object-cover rounded"
                              width={200}
                              height={128}
                            />
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 bg-gray-50">
                              <Plus className="w-6 h-6 text-gray-400" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      // If this is a placeholder, add a real item; otherwise update existing
                                      if (item.id.startsWith('placeholder-')) {
                                        const newItem: PhotoGridItem = {
                                          id: generateId(),
                                          url: ev.target?.result as string,
                                          caption: '',
                                        };
                                        const currentItems = block.photoGridContent?.items || [];
                                        updateMediaBlock(block.id, {
                                          photoGridContent: {
                                            ...block.photoGridContent,
                                            items: [...currentItems, newItem],
                                          } as PhotoGridContent
                                        });
                                      } else {
                                        updatePhotoGridItem(block.id, item.id, { url: ev.target?.result as string });
                                      }
                                    };
                                    reader.readAsDataURL(e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          )}
                          {item.url && (
                            <button
                              onClick={() => removePhotoGridItem(block.id, item.id)}
                              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Show "Add Row" button only when all placeholders in the current row are filled */}
                    {filledCount > 0 && filledCount % cols === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          for (let i = 0; i < cols; i++) {
                            addPhotoGridItem(block.id);
                          }
                        }}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Row
                      </Button>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {(block.type === 'video' || block.type === 'youtube' || block.type === 'vimeo') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Video className="w-4 h-4" />
                <span>Video Block</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste YouTube, Vimeo, or video URL..."
                  value={block.videoContent?.url || ''}
                  onChange={(e) => updateMediaBlock(block.id, { 
                    videoContent: { ...block.videoContent, url: e.target.value, type: e.target.value.includes('youtube.com') || e.target.value.includes('youtu.be') ? 'youtube' : e.target.value.includes('vimeo.com') ? 'vimeo' : 'mp4' } as VideoContent 
                  })}
                  className="flex-1"
                />
                <label className="flex items-center gap-1 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50 text-sm whitespace-nowrap">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          updateMediaBlock(block.id, { 
                            videoContent: { 
                              ...block.videoContent, 
                              url: ev.target?.result as string, 
                              type: 'mp4',
                              controls: true 
                            } as VideoContent 
                          });
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              {block.videoContent?.url && (
                <div className="aspect-video bg-black rounded overflow-hidden">
                  {block.videoContent.url.includes('youtube.com') || block.videoContent.url.includes('youtu.be') ? (
                    (() => {
                      // Extract YouTube video ID from various URL formats
                      let videoId = '';
                      const url = block.videoContent.url;
                      const patterns = [
                        /youtube\.com\/watch\?v=([^&\s]+)/,
                        /youtu\.be\/([^?&\s]+)/,
                        /youtube\.com\/embed\/([^?&\s]+)/,
                        /youtube\.com\/v\/([^?&\s]+)/,
                        /youtube\.com\/shorts\/([^?&\s]+)/
                      ];
                      for (const pattern of patterns) {
                        const match = url.match(pattern);
                        if (match) { videoId = match[1]; break; }
                      }
                      return videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          title="YouTube video preview"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm">
                          Could not parse YouTube URL. Please check the link.
                        </div>
                      );
                    })()
                  ) : block.videoContent.url.includes('vimeo.com') ? (
                    (() => {
                      const vimeoMatch = block.videoContent.url.match(/vimeo\.com\/(\d+)/);
                      const vimeoId = vimeoMatch ? vimeoMatch[1] : '';
                      return vimeoId ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${vimeoId}`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title="Vimeo video preview"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm">
                          Could not parse Vimeo URL. Please check the link.
                        </div>
                      );
                    })()
                  ) : (
                    <video src={block.videoContent.url} controls className="w-full h-full" />
                  )}
                </div>
              )}
              <Input
                placeholder="Video caption (optional)"
                value={block.videoContent?.caption || ''}
                onChange={(e) => updateMediaBlock(block.id, { 
                  videoContent: { ...block.videoContent, caption: e.target.value } as VideoContent 
                })}
              />
            </div>
          )}

          {(block.type === 'embed' || 
            block.type === 'figma' || block.type === 'sketchfab' || block.type === 'spotify' || 
            block.type === 'soundcloud' || block.type === 'giphy' || block.type === 'adobeXD' ||
            block.type === 'adobeExpress' || block.type === 'instagram' || block.type === 'twitter' ||
            block.type === 'facebook' || block.type === 'twitch' || block.type === 'codepen' ||
            block.type === 'github' || block.type === 'dribbble' || block.type === 'behance' ||
            block.type === 'artstation' || block.type === 'marvel' || block.type === 'invision' ||
            block.type === 'prezi' || block.type === 'issuu' || block.type === 'slideshare' ||
            block.type === 'googleMaps' || block.type === 'matterport' || block.type === 'kuula360' ||
            block.type === 'tiled' || block.type === 'bandcamp' || block.type === 'mixcloud' ||
            block.type === 'dailymotion' || block.type === 'imgur' || block.type === 'jotform' ||
            block.type === 'wufoo' || block.type === 'lottie' || block.type === 'threejs'
          ) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Code className="w-4 h-4" />
                <span>Embed Block - {block.type.charAt(0).toUpperCase() + block.type.slice(1)}</span>
              </div>
              <Textarea
                placeholder="Paste embed code (iframe) or URL..."
                value={block.embedContent?.embedCode || block.embedContent?.url || ''}
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
                className="min-h-[100px] font-mono text-sm"
              />
              <Input
                placeholder="Caption (optional)"
                value={block.embedContent?.caption || ''}
                onChange={(e) => updateMediaBlock(block.id, { 
                  embedContent: { ...block.embedContent, caption: e.target.value } as EmbedContent 
                })}
              />
              {block.embedContent?.url && !block.embedContent?.embedCode && (
                <div className="text-xs text-gray-500">
                  Preview will be shown on the published page
                </div>
              )}
            </div>
          )}

          {block.type === 'pdf' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <span>PDF Block</span>
              </div>
              {block.pdfContent?.url ? (
                <div className="space-y-3">
                  <div className="relative border rounded-lg overflow-hidden bg-gray-100">
                    <iframe
                      src={block.pdfContent.url}
                      className="w-full"
                      style={{ height: `${block.pdfContent.viewerHeight || 600}px` }}
                      title="PDF preview"
                    />
                    <button
                      onClick={() => updateMediaBlock(block.id, { pdfContent: { ...block.pdfContent, url: '' } as PdfContent })}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded hover:bg-black/70 z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate flex-1">{block.pdfContent.fileName || 'PDF document'}</span>
                    <a
                      href={block.pdfContent.url}
                      download={block.pdfContent.fileName || 'document.pdf'}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload PDF</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf,.pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            updateMediaBlock(block.id, {
                              pdfContent: {
                                url: ev.target?.result as string,
                                fileName: file.name,
                                caption: '',
                                viewerWidth: 'full',
                                viewerHeight: 600,
                              } as PdfContent
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-xs text-gray-400">or paste a PDF URL</span>
                    </div>
                  </div>
                  <Input
                    placeholder="https://example.com/document.pdf"
                    value={block.pdfContent?.url || ''}
                    onChange={(e) => updateMediaBlock(block.id, {
                      pdfContent: { ...block.pdfContent, url: e.target.value } as PdfContent
                    })}
                    className="text-sm"
                  />
                </div>
              )}
              {/* Viewer height control */}
              {block.pdfContent?.url && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 whitespace-nowrap">Viewer height:</label>
                  <select
                    value={block.pdfContent?.viewerHeight?.toString() || '600'}
                    onChange={(e) => updateMediaBlock(block.id, {
                      pdfContent: { ...block.pdfContent, viewerHeight: parseInt(e.target.value) } as PdfContent
                    })}
                    className="text-sm border rounded px-2 py-1 bg-white"
                  >
                    <option value="400">Short (400px)</option>
                    <option value="600">Medium (600px)</option>
                    <option value="800">Tall (800px)</option>
                    <option value="1200">Extra Tall (1200px)</option>
                  </select>
                </div>
              )}
              <Input
                placeholder="PDF caption (optional)"
                value={block.pdfContent?.caption || ''}
                onChange={(e) => updateMediaBlock(block.id, {
                  pdfContent: { ...block.pdfContent, caption: e.target.value } as PdfContent
                })}
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Top Toolbar */}
      <div className="flex-shrink-0 border-b shadow-sm z-50" style={{ backgroundColor: bgColor }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleSave} className="p-2 hover:bg-gray-100 rounded" title="Save and exit">
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Edit Project</h1>
          </div>
          <div></div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main Content Area - scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-8 pb-32">
        {/* Main Content Area */}
        <div className="min-w-0 max-w-6xl mx-auto">
          {/* Project Title */}
          <div className="mb-8">
            <Input
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold border-none px-0 h-auto py-2 focus-visible:ring-0"
              style={{ fontFamily: 'Arial, sans-serif' }}
            />
          </div>

          {/* Cover Image */}
          <div className="mb-8">
            {coverImage ? (
              <div className="relative">
                <OptimizedImage
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-64 object-cover rounded-lg"
                  width={800}
                  height={400}
                />
                <button
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload cover image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setCoverImage(ev.target?.result as string);
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Media Blocks Area */}
          <div className="mb-8">
            {/* Media Blocks */}
            {mediaBlocks.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
                <p>Click an icon above to add media to your project</p>
              </div>
            ) : (
              mediaBlocks.map((block) => renderMediaBlockEditor(block))
            )}
          </div>
        </div>
        </div>

        {/* Right Sidebar - sticky, floats when scrolling */}
        <div className="w-72 flex-shrink-0">
          <div className="sticky top-0 h-full overflow-y-auto border-l bg-gray-50 p-4 pb-48 space-y-4">
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
                  onClick={() => addMediaBlock('embed')}
                  className="flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50"
                >
                  <LinkIcon className="w-5 h-5" />
                  <span className="text-xs">Prototype</span>
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

            {/* Edit Project Panel */}
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Edit Project</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => { setShowStylesPanel(!showStylesPanel); setShowSettingsPanel(false); }}
                  className={`flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50 ${showStylesPanel ? 'bg-blue-50 border-blue-400' : ''}`}
                >
                  <Palette className="w-5 h-5" />
                  <span className="text-xs">Styles</span>
                </button>
                <button
                  onClick={() => { setShowSettingsPanel(!showSettingsPanel); setShowStylesPanel(false); }}
                  className={`flex flex-col items-center gap-1 p-3 border rounded hover:bg-gray-50 ${showSettingsPanel ? 'bg-blue-50 border-blue-400' : ''}`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-xs">Settings</span>
                </button>
              </div>

              {/* Styles Panel */}
              {showStylesPanel && (
                <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Project Styles</h4>
                  {/* Background Color */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">Background</label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                  </div>
                  {/* Text Color */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">Text Color</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => handleTextColorChange(e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                  </div>
                  {/* Accent Color */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">Accent Color</label>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                  </div>
                  {/* Layout Style */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Layout Style</label>
                    <select
                      value={layoutStyle}
                      onChange={(e) => setLayoutStyle(e.target.value)}
                      className="w-full text-sm border rounded px-2 py-1 bg-white"
                    >
                      <option value="full-width">Full Width</option>
                      <option value="boxed">Boxed</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                  {/* Content Width */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Content Width</label>
                    <select
                      value={contentWidth}
                      onChange={(e) => setContentWidth(e.target.value)}
                      className="w-full text-sm border rounded px-2 py-1 bg-white"
                    >
                      <option value="narrow">Narrow</option>
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setBgColor('#ffffff');
                      setTextColor('#000000');
                      setAccentColor('#0057E7');
                      setLayoutStyle('full-width');
                      setContentWidth('normal');
                      // Reset all text block colors to default
                      setMediaBlocks(mediaBlocks.map(block => {
                        if (block.type === 'text' && block.textContent) {
                          return {
                            ...block,
                            textContent: { ...block.textContent, color: '#000000' } as TextBlockContent
                          };
                        }
                        return block;
                      }));
                    }}
                    className="w-full text-xs text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-100 transition-colors"
                    title="Reset to default style"
                  >
                    Back to default style
                  </button>
                </div>
              )}

              {/* Settings Panel */}
              {showSettingsPanel && (
                <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase">Project Details</h4>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Client Name</label>
                    <Input
                      placeholder="Client name"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Category</label>
                    <Input
                      placeholder="Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Tags (comma separated)</label>
                    <Input
                      placeholder="Tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Project URL</label>
                    <Input
                      placeholder="https://..."
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Project Date</label>
                    <Input
                      type="date"
                      value={projectDate}
                      onChange={(e) => setProjectDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Visibility Settings</h4>
                    {[
                      { label: 'Show Title', value: showProjectTitle, setter: setShowProjectTitle },
                      { label: 'Show Date', value: showProjectDate, setter: setShowProjectDate },
                      { label: 'Show Tags', value: showProjectTags, setter: setShowProjectTags },
                      { label: 'Show Category', value: showProjectCategory, setter: setShowProjectCategory },
                      { label: 'Show Client', value: showProjectClient, setter: setShowProjectClient },
                      { label: 'Show URL', value: showProjectUrl, setter: setShowProjectUrl },
                    ].map((item) => (
                      <label key={item.label} className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs text-gray-600">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={item.value}
                          onChange={(e) => item.setter(e.target.checked)}
                          className="w-4 h-4"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
