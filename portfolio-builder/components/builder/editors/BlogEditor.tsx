'use client';

import React from 'react';
import { BlogSection, BlogPost } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '../CollapsibleSection';
import { ImageUploader } from '../ImageUploader';
import { Plus, Trash2, FileText, Settings } from 'lucide-react';

interface BlogEditorProps {
  section: BlogSection;
  onUpdate: (updates: Partial<BlogSection>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function BlogEditor({ section, onUpdate }: BlogEditorProps) {
  const addPost = () => {
    const newPost: BlogPost = {
      id: generateId(),
      title: 'New Post',
      excerpt: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
    };
    onUpdate({ posts: [...section.posts, newPost] });
  };

  const updatePost = (id: string, updates: Partial<BlogPost>) => {
    onUpdate({ posts: section.posts.map(p => p.id === id ? { ...p, ...updates } : p) });
  };

  const removePost = (id: string) => {
    onUpdate({ posts: section.posts.filter(p => p.id !== id) });
  };

  return (
    <div className="space-y-4">

      <CollapsibleSection title="Section Title" icon={Settings} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <div>
          <Label>Section Title</Label>
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Blog"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Subtitle" icon={Settings}
        showToggle
        toggleChecked={section.showSubtitle !== false}
        onToggleChange={(checked) => onUpdate({ showSubtitle: checked })}
      >
        <div>
          <Label>Subtitle</Label>
          <Input
            value={section.subtitle || ''}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="Thoughts and articles"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Layout & Settings" icon={Settings}>
        <div>
          <Label>Layout</Label>
          <select
            value={section.layout}
            onChange={(e) => onUpdate({ layout: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-xl text-sm"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </div>
      </CollapsibleSection>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Blog Posts ({section.posts.length})</span>
        <Button variant="outline" size="sm" onClick={addPost}>
          <Plus className="w-3 h-3 mr-1" /> Add Post
        </Button>
      </div>

      {section.posts.map((post) => (
        <CollapsibleSection key={post.id} title={post.title || 'Untitled Post'} icon={FileText}>
          <div>
            <Label>Title</Label>
            <Input
              value={post.title}
              onChange={(e) => updatePost(post.id, { title: e.target.value })}
              placeholder="My Blog Post"
            />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea
              value={post.excerpt}
              onChange={(e) => updatePost(post.id, { excerpt: e.target.value })}
              placeholder="Short preview text..."
              rows={2}
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              value={post.content}
              onChange={(e) => updatePost(post.id, { content: e.target.value })}
              placeholder="Full blog post content..."
              rows={6}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={post.date}
                onChange={(e) => updatePost(post.id, { date: e.target.value })}
              />
            </div>
            <div>
              <Label>Read Time</Label>
              <Input
                value={post.readTime || ''}
                onChange={(e) => updatePost(post.id, { readTime: e.target.value })}
                placeholder="5 min read"
              />
            </div>
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input
              value={(post.tags || []).join(', ')}
              onChange={(e) => updatePost(post.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              placeholder="Design, UX, Tutorial"
            />
          </div>
          <div>
            <Label>External Link (optional)</Label>
            <Input
              value={post.link || ''}
              onChange={(e) => updatePost(post.id, { link: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Cover Image</Label>
            <ImageUploader
              value={post.imageUrl || ''}
              onChange={(url) => updatePost(post.id, { imageUrl: url })}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-500"
            onClick={() => removePost(post.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" /> Remove Post
          </Button>
        </CollapsibleSection>
      ))}
    </div>
  );
}
