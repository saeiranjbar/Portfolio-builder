'use client';

import React from 'react';
import { ProjectMediaBlock, TextBlockContent, PhotoGridContent, VideoContent, EmbedContent, MediaType, PdfContent } from '@/lib/types';

import { OptimizedImage } from './OptimizedImage';
import { 
  Youtube, 
  Instagram, 
  Twitter, 
  Facebook, 
  Twitch, 
  Codepen, 
  Github, 
  Dribbble, 
  MapPin,
  Music,
  Image as ImageIcon,
  Type,
  Grid3X3,
  Link as LinkIcon,
  Box,
  Palette,
  Layers,
  FileText,
  Video,
  Presentation,
  Globe,
  X,
  ExternalLink
} from 'lucide-react';

interface MediaBlockProps {
  block: ProjectMediaBlock;
  themeColors: {
    primary: string;
    text: string;
    textSecondary: string;
  };
}

// Helper to extract video ID from URLs
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
    /youtube\.com\/v\/([^?&\s]+)/,
    /youtube\.com\/shorts\/([^?&\s]+)/,
    /youtube\.com\/live\/([^?&\s]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  // Also try URL search params
  try {
    const urlObj = new URL(url);
    const v = urlObj.searchParams.get('v');
    if (v) return v;
  } catch {}
  return null;
};

const getVimeoId = (url: string): string | null => {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getSpotifyId = (url: string): string | null => {
  const patterns = [
    /open\.spotify\.com\/(?:track|album|playlist|artist)\/([a-zA-Z0-9]+)/,
    /spotify\.com\/(?:track|album|playlist|artist)\/([a-zA-Z0-9]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getSoundCloudUrl = (url: string): string | null => {
  if (url.includes('soundcloud.com')) {
    return url;
  }
  return null;
};

const getGiphyId = (url: string): string | null => {
  const patterns = [
    /giphy\.com\/gifs\/[^-]+-([a-zA-Z0-9]+)/,
    /giphy\.com\/embed\/([a-zA-Z0-9]+)/,
    /media\.giphy\.com\/media\/([a-zA-Z0-9]+)\/giphy\.gif/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getFigmaUrl = (url: string): string | null => {
  if (url.includes('figma.com') && (url.includes('file') || url.includes('proto'))) {
    return url;
  }
  return null;
};

const getSketchfabId = (url: string): string | null => {
  const patterns = [
    /sketchfab\.com\/3d-models\/[^/]+\/([a-f0-9]+)/,
    /sketchfab\.com\/models\/([a-f0-9]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getArtStationUrl = (url: string): string | null => {
  if (url.includes('artstation.com')) {
    return url;
  }
  return null;
};

const getGoogleMapsEmbed = (url: string): string | null => {
  if (url.includes('google.com/maps') || url.includes('google.maps')) {
    return url.replace('/maps', '/maps/embed').replace('/place', '/place/embed');
  }
  return null;
};

const getTwitchChannel = (url: string): string | null => {
  const patterns = [
    /twitch\.tv\/([a-zA-Z0-9_]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getDribbbleUrl = (url: string): string | null => {
  if (url.includes('dribbble.com')) {
    return url;
  }
  return null;
};

const getBehanceUrl = (url: string): string | null => {
  if (url.includes('behance.net')) {
    return url;
  }
  return null;
};

const getInstagramEmbed = (url: string): string | null => {
  if (url.includes('instagram.com')) {
    return url;
  }
  return null;
};

const getTwitterEmbed = (url: string): string | null => {
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return url;
  }
  return null;
};

const getFacebookEmbed = (url: string): string | null => {
  if (url.includes('facebook.com')) {
    return url;
  }
  return null;
};

const getCodepenUrl = (url: string): string | null => {
  if (url.includes('codepen.io')) {
    return url;
  }
  return null;
};

const getGithubUrl = (url: string): string | null => {
  if (url.includes('github.com')) {
    return url;
  }
  return null;
};

const getMarvelUrl = (url: string): string | null => {
  if (url.includes('marvelapp.com')) {
    return url;
  }
  return null;
};

const getInvisionUrl = (url: string): string | null => {
  if (url.includes('invisionapp.com') || url.includes('invsn.co')) {
    return url;
  }
  return null;
};

const getPreziUrl = (url: string): string | null => {
  if (url.includes('prezi.com')) {
    return url;
  }
  return null;
};

const getIssuuUrl = (url: string): string | null => {
  if (url.includes('issuu.com')) {
    return url;
  }
  return null;
};

const getSlideShareUrl = (url: string): string | null => {
  if (url.includes('slideshare.net')) {
    return url;
  }
  return null;
};

const getMatterportUrl = (url: string): string | null => {
  if (url.includes('matterport.com')) {
    return url;
  }
  return null;
};

const getKuulaUrl = (url: string): string | null => {
  if (url.includes('kuula.co')) {
    return url;
  }
  return null;
};

const getTiledUrl = (url: string): string | null => {
  if (url.includes('tiled.co')) {
    return url;
  }
  return null;
};

const getBandcampUrl = (url: string): string | null => {
  if (url.includes('bandcamp.com')) {
    return url;
  }
  return null;
};

const getMixcloudUrl = (url: string): string | null => {
  if (url.includes('mixcloud.com')) {
    return url;
  }
  return null;
};

const getDailyMotionUrl = (url: string): string | null => {
  if (url.includes('dailymotion.com')) {
    return url;
  }
  return null;
};

const getImgurUrl = (url: string): string | null => {
  if (url.includes('imgur.com')) {
    return url;
  }
  return null;
};

const getJotFormUrl = (url: string): string | null => {
  if (url.includes('jotform.com') || url.includes('jotform.me')) {
    return url;
  }
  return null;
};

const getWufooUrl = (url: string): string | null => {
  if (url.includes('wufoo.com')) {
    return url;
  }
  return null;
};

const getAdobeXDUrl = (url: string): string | null => {
  if (url.includes('adobe.com') && (url.includes('xd') || url.includes('share'))) {
    return url;
  }
  return null;
};

const getAdobeExpressUrl = (url: string): string | null => {
  if (url.includes('express.adobe.com') || url.includes('spark.adobe.com')) {
    return url;
  }
  return null;
};

const getAutodeskUrl = (url: string): string | null => {
  if (url.includes('autodesk.com') || url.includes('view.autodesk.com')) {
    return url;
  }
  return null;
};

const getSubstanceUrl = (url: string): string | null => {
  if (url.includes('substance3d.adobe.com')) {
    return url;
  }
  return null;
};

const getLottieUrl = (url: string): string | null => {
  if (url.includes('lottiefiles.com') || url.endsWith('.json')) {
    return url;
  }
  return null;
};

const getThreeJSUrl = (url: string): string | null => {
  if (url.includes('threejs.org') || url.endsWith('.gltf') || url.endsWith('.glb')) {
    return url;
  }
  return null;
};

// Lightbox component for full-screen image viewing
const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors z-10"
        title="Close"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[95vw] max-h-[95vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// Image Block Component
const ImageBlock: React.FC<{ block: ProjectMediaBlock; themeColors: any }> = ({ block, themeColors }) => {
  const [showLightbox, setShowLightbox] = React.useState(false);
  if (!block.imageUrl) return null;
  
  return (
    <div className="my-[40px]">
      <OptimizedImage
        src={block.imageUrl}
        alt={block.imageCaption || block.caption || 'Project image'}
        className="w-full h-auto rounded-sm cursor-zoom-in block mx-auto"
        width={1200}
        height={800}
        style={{ maxWidth: '100%', display: 'block' }}
        onClick={() => setShowLightbox(true)}
      />
      {(block.imageCaption || block.caption) && (
        <p className="text-center mt-4" style={{ color: themeColors.text, fontFamily: 'Neue Haas Grotesk Display Pro, Inter, sans-serif', lineHeight: '1.6', fontSize: '18px' }}>
          {block.imageCaption || block.caption}
        </p>

      )}
      {showLightbox && (
        <Lightbox 
          src={block.imageUrl} 
          alt={block.imageCaption || block.caption || 'Project image'} 
          onClose={() => setShowLightbox(false)} 
        />
      )}
    </div>
  );
};


// Text Block Component with Rich Text Editing Support
const TextBlock: React.FC<{ block: ProjectMediaBlock; themeColors: any }> = ({ block, themeColors }) => {
  const content = block.textContent;
  if (!content?.text) return null;

  const fontSizeMap: Record<string, string> = {
    small: '14px',
    medium: '17px',
    large: '20px',
    xlarge: '24px'
  };

  return (
    <div 
      className="my-[40px] max-w-4xl mx-auto px-4"
      style={{ 
        textAlign: 'center',
        fontFamily: content.fontFamily || 'Arial, sans-serif'
      }}
    >
      <div
        style={{ 
          fontSize: fontSizeMap[content.fontSize || 'medium'] || '17px',
          fontWeight: content.fontWeight || 'normal',
          color: content.color || '#696969',
          lineHeight: '1.8',
          textAlign: content.textAlign || 'left',
          fontFamily: content.fontFamily || 'Arial, sans-serif',
          whiteSpace: 'pre-wrap'
        }}
        dangerouslySetInnerHTML={{ __html: content.text }}
      />
    </div>
  );
};

// Photo Grid Block Component
const PhotoGridBlock: React.FC<{ block: ProjectMediaBlock; themeColors: any }> = ({ block, themeColors }) => {
  const gridContent = block.photoGridContent;
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = React.useState('');
  if (!gridContent?.items || gridContent.items.length === 0) return null;

  const gapMap = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  };

  const columns = Math.min(gridContent.columns || 3, gridContent.items.length);

  const openLightbox = (url: string, alt: string) => {
    setLightboxSrc(url);
    setLightboxAlt(alt);
  };

  if (gridContent.layout === 'carousel') {
    return (
      <div className={`my-[40px] ${gapMap[gridContent.gap || 'medium']}`}>
        <div className="flex overflow-x-auto snap-x snap-mandatory" style={{ scrollBehavior: 'smooth' }}>
          {gridContent.items.filter(item => item.url).map((item) => (
            <div key={item.id} className="snap-center flex-shrink-0 w-full md:w-2/3 lg:w-1/2">
              <div className="relative w-full overflow-hidden rounded-sm cursor-zoom-in" style={{ height: '300px' }} onClick={() => openLightbox(item.url, item.caption || 'Gallery image')}>
                <OptimizedImage
                  src={item.url}
                  alt={item.caption || 'Gallery image'}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              {gridContent.showCaptions && item.caption && (
                <p className="text-center mt-2 text-sm" style={{ color: themeColors.textSecondary }}>
                  {item.caption}
                </p>
              )}
            </div>
          ))}
        </div>
        {lightboxSrc && (
          <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
        )}
      </div>
    );
  }




  // Grid layout - uniform aspect ratio with cropping
  return (
    <div
      className="my-[40px] w-full max-w-5xl mx-auto px-4"
      style={{
        boxSizing: 'border-box',
      }}
    >
      <div className={`grid ${gapMap[gridContent.gap || 'medium']}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {gridContent.items.filter(item => item.url).map((item) => (
          <div key={item.id} className={item.span ? `col-span-${item.span}` : ''}>
            <div className="relative w-full overflow-hidden rounded-sm cursor-zoom-in" style={{ height: '300px' }} onClick={() => openLightbox(item.url, item.caption || 'Gallery image')}>
              <OptimizedImage
                src={item.url}
                alt={item.caption || 'Gallery image'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>

            {gridContent.showCaptions && item.caption && (
              <p className="text-center mt-2 text-sm" style={{ color: themeColors.textSecondary }}>
                {item.caption}
              </p>
            )}
          </div>
        ))}
      </div>
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );

};

// Video Block Component
const VideoBlock: React.FC<{ block: ProjectMediaBlock; themeColors: any }> = ({ block, themeColors }) => {
  const video = block.videoContent;
  if (!video?.url) return null;

  // Detect type from URL regardless of stored type field
  const url = video.url;
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');
  const isLoom = url.includes('loom.com');
  const isMp4 = url.includes('.mp4') || url.startsWith('data:video');
  const isWebm = url.includes('.webm');

  const videoId = isYouTube ? getYouTubeId(url) : 
                  isVimeo ? getVimeoId(url) : null;

  if (isYouTube && videoId) {
    return (
      <div className="my-[40px] flex flex-col items-center">
        <div className="aspect-video w-full max-w-4xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video"
          />
        </div>
        {video.caption && (
          <p className="text-center mt-4 text-sm w-full" style={{ color: themeColors.text }}>
            {video.caption}
          </p>
        )}
      </div>
    );
  }

  if (isVimeo && videoId) {
    return (
      <div className="my-[40px] flex flex-col items-center">
        <div className="aspect-video w-full max-w-4xl">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo video"
          />
        </div>
        {video.caption && (
          <p className="text-center mt-4 text-sm w-full" style={{ color: themeColors.text }}>
            {video.caption}
          </p>
        )}
      </div>
    );
  }

  if (video.type === 'loom') {
    return (
      <div className="my-[40px] flex flex-col items-center">
        <div className="aspect-video w-full max-w-4xl">
          <iframe
            src={video.url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Loom video"
          />
        </div>
        {video.caption && (
          <p className="text-center mt-4 text-sm w-full" style={{ color: themeColors.text }}>
            {video.caption}
          </p>
        )}
      </div>
    );
  }

  // For mp4/webm videos
  if (video.type === 'mp4' || video.type === 'webm') {
    return (
      <div className="my-[40px] flex flex-col items-center">
        <video
          src={video.url}
          className="w-full max-w-4xl rounded-sm"
          autoPlay={video.autoplay}
          loop={video.loop}
          muted={video.muted}
          controls={video.controls !== false}
        >
          Your browser does not support the video tag.
        </video>
        {video.caption && (
          <p className="text-center mt-4 text-sm w-full" style={{ color: themeColors.text }}>
            {video.caption}
          </p>
        )}
      </div>
    );
  }

  return null;
};

// Embed Block Component - Supports 40+ platforms
const EmbedBlock: React.FC<{ block: ProjectMediaBlock; themeColors: any }> = ({ block, themeColors }) => {
  const embed = block.embedContent;
  if (!embed) return null;

  // If raw embed code is provided, use it directly
  if (embed.embedCode) {
    const aspectRatio = embed.aspectRatio || '16:9';
    const paddingBottom = aspectRatio === '16:9' ? '56.25%' : 
                          aspectRatio === '4:3' ? '75%' : 
                          aspectRatio === '1:1' ? '100%' : '56.25%';

    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto" style={{ position: 'relative', paddingBottom }}>
          <div 
            className="absolute inset-0"
            dangerouslySetInnerHTML={{ __html: embed.embedCode }}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Platform-specific embeds based on URL
  const url = embed.url || '';

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = getYouTubeId(url);
    if (videoId) {
      return (
        <div className="my-6 w-full flex justify-center">
          <div className="aspect-video w-full max-w-4xl">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded-sm"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {embed.caption && (
            <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
              {embed.caption}
            </p>
          )}
        </div>
      );
    }
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    const videoId = getVimeoId(url);
    if (videoId) {
      return (
        <div className="my-6 flex justify-center">
          <div className="aspect-video w-full max-w-4xl">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              className="w-full h-full rounded-sm"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          {embed.caption && (
            <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
              {embed.caption}
            </p>
          )}
        </div>
      );
    }
  }

  // Spotify
  if (url.includes('spotify.com') || url.includes('open.spotify.com')) {
    const trackId = getSpotifyId(url);
    if (trackId) {
      return (
        <div className="my-6">
          <div className="w-full max-w-4xl mx-auto" style={{ height: url.includes('playlist') ? '380px' : '152px' }}>
            <iframe
              src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
              className="w-full h-full rounded-sm"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          {embed.caption && (
            <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
              {embed.caption}
            </p>
          )}
        </div>
      );
    }
  }

  // SoundCloud
  if (url.includes('soundcloud.com')) {
    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto">
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="0"
            allow="autoplay"
            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
            className="rounded-sm"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // GIPHY
  if (url.includes('giphy.com')) {
    const gifId = getGiphyId(url);
    if (gifId) {
      return (
        <div className="my-6">
          <div className="w-full max-w-2xl mx-auto">
            <img
              src={`https://media.giphy.com/media/${gifId}/giphy.gif`}
              alt="GIF"
              className="w-full h-auto rounded-sm"
            />
          </div>
          {embed.caption && (
            <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
              {embed.caption}
            </p>
          )}
        </div>
      );
    }
  }

  // Figma
  if (url.includes('figma.com')) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Sketchfab (3D models)
  if (url.includes('sketchfab.com')) {
    const modelId = getSketchfabId(url);
    if (modelId) {
      return (
        <div className="my-6">
          <div className="w-full max-w-4xl mx-auto" style={{ height: '480px' }}>
            <iframe
              src={`https://sketchfab.com/models/${modelId}/embed`}
              className="w-full h-full rounded-sm"
              frameBorder="0"
              allow="autoplay; fullscreen; vr"
              allowFullScreen
            />
          </div>
          {embed.caption && (
            <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
              {embed.caption}
            </p>
          )}
        </div>
      );
    }
  }

  // Adobe XD / Adobe Express
  if (getAdobeXDUrl(url) || getAdobeExpressUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Instagram
  if (getInstagramEmbed(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-md mx-auto">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{ background: '#FFF', border: 0, borderRadius: '3px', boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px', maxWidth: '540px', minWidth: '326px', padding: 0, width: '100%' }}
          >
          </blockquote>
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Twitter / X
  if (getTwitterEmbed(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-md mx-auto">
          <blockquote className="twitter-tweet">
            <a href={url}></a>
          </blockquote>
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Facebook
  if (getFacebookEmbed(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-md mx-auto">
          <iframe
            src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`}
            className="w-full rounded-sm"
            style={{ height: '600px', border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Twitch
  const twitchChannel = getTwitchChannel(url);
  if (twitchChannel) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}&autoplay=false`}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // CodePen
  if (getCodepenUrl(url)) {
    const parts = url.split('/');
    const user = parts[3];
    const pen = parts[5];
    if (user && pen) {
      return (
        <div className="my-6">
          <div className="w-full max-w-4xl mx-auto" style={{ height: '500px' }}>
            <iframe
              height="500"
              src={`https://codepen.io/${user}/embed/${pen}?default-tab=result`}
              className="w-full rounded-sm"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {embed.caption && (
            <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
              {embed.caption}
            </p>
          )}
        </div>
      );
    }
  }

  // GitHub Gist
  if (getGithubUrl(url) && url.includes('/gist/')) {
    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full rounded-sm"
            style={{ height: '400px', border: 'none' }}
            loading="lazy"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Dribbble
  if (getDribbbleUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-2xl mx-auto">
          <iframe
            src={url}
            className="w-full rounded-sm"
            style={{ height: '600px', border: 'none' }}
            loading="lazy"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Behance
  if (getBehanceUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full rounded-sm"
            style={{ height: '800px', border: 'none' }}
            loading="lazy"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // ArtStation
  if (getArtStationUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full rounded-sm"
            style={{ height: '600px', border: 'none' }}
            loading="lazy"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Marvel
  if (getMarvelUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // InVision
  if (getInvisionUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Prezi
  if (getPreziUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Issuu
  if (getIssuuUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto" style={{ height: '500px' }}>
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // SlideShare
  if (getSlideShareUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto" style={{ height: '500px' }}>
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Google Maps
  if (url.includes('google.com/maps') || url.includes('google.maps')) {
    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto" style={{ height: '450px' }}>
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
            loading="lazy"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Matterport (3D tours)
  if (getMatterportUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allow="xr-spatial-tracking"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Kuula 360
  if (getKuulaUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Tiled
  if (getTiledUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto" style={{ height: '600px' }}>
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Bandcamp
  if (getBandcampUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-2xl mx-auto">
          <iframe
            src={url}
            className="w-full rounded-sm"
            style={{ height: '400px', border: 'none' }}
            loading="lazy"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Mixcloud
  if (getMixcloudUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-2xl mx-auto">
          <iframe
            src={url}
            className="w-full rounded-sm"
            style={{ height: '120px', border: 'none' }}
            loading="lazy"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // DailyMotion
  if (getDailyMotionUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Imgur
  if (getImgurUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-4xl mx-auto">
          <img
            src={url}
            alt="Imgur image"
            className="w-full h-auto rounded-sm"
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // JotForm
  if (getJotFormUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-2xl mx-auto" style={{ height: '600px' }}>
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Wufoo
  if (getWufooUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-2xl mx-auto" style={{ height: '600px' }}>
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Autodesk
  if (getAutodeskUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Substance 3D
  if (getSubstanceUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-square w-full max-w-2xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // LottieFiles
  if (getLottieUrl(url)) {
    return (
      <div className="my-6">
        <div className="w-full max-w-2xl mx-auto">
          <dotlottie-player
            src={url}
            background="transparent"
            speed="1"
            style={{ width: '100%', height: 'auto' }}
            autoplay
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Three.js / 3D models
  if (getThreeJSUrl(url)) {
    return (
      <div className="my-6">
        <div className="aspect-square w-full max-w-2xl mx-auto">
          <model-viewer
            src={url}
            alt="3D Model"
            auto-rotate
            camera-controls
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption}
          </p>
        )}
      </div>
    );
  }

  // Default: Try to render as iframe if it's a valid URL
  if (url.startsWith('http')) {
    return (
      <div className="my-6">
        <div className="aspect-video w-full max-w-4xl mx-auto">
          <iframe
            src={url}
            className="w-full h-full rounded-sm"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        {embed.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.textSecondary }}>
            {embed.caption} - Source: {embed.source || 'Embedded content'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="my-6 p-8 text-center bg-gray-100 rounded-sm">
      <p style={{ color: themeColors.textSecondary }}>
        Embed not supported for this URL. Please provide a valid embed code.
      </p>
      {embed.source && (
        <p className="mt-2 text-xs" style={{ color: themeColors.textSecondary }}>
          Source: {embed.source}
        </p>
      )}
    </div>
  );
};

// PDF Block Component
const PdfBlock: React.FC<{ block: ProjectMediaBlock; themeColors: any }> = ({ block, themeColors }) => {
  const pdf = block.pdfContent;
  if (!pdf?.url) return null;

  const height = pdf.viewerHeight || 600;

  return (
    <div className="my-[40px]">
      <div className="w-full mx-auto" style={{ maxWidth: '1232px' }}>
        <div className="relative border rounded-lg overflow-hidden bg-gray-100" style={{ height: `${height}px` }}>
          <iframe
            src={pdf.url}
            className="w-full h-full"
            style={{ border: 'none' }}
            title={pdf.fileName || 'PDF document'}
          />
        </div>
        {/* File info bar with download link */}
        <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-gray-50 rounded-lg">
          <FileText className="w-4 h-4 flex-shrink-0" style={{ color: themeColors.textSecondary }} />
          <span className="text-sm truncate flex-1" style={{ color: themeColors.textSecondary }}>
            {pdf.fileName || 'PDF document'}
          </span>
          <a
            href={pdf.url}
            download={pdf.fileName || 'document.pdf'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
            style={{ color: themeColors.primary || '#0057E7' }}
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </a>
        </div>
        {pdf.caption && (
          <p className="text-center mt-4 text-sm" style={{ color: themeColors.text }}>
            {pdf.caption}
          </p>
        )}
      </div>
    </div>
  );
};


// Check if a media block has actual content
const isBlockEmpty = (block: ProjectMediaBlock): boolean => {
  switch (block.type) {
    case 'image':
      return !block.imageUrl;
    case 'text':
      return !block.textContent?.text || block.textContent.text.trim() === '';
    case 'photoGrid':
      return !block.photoGridContent?.items || block.photoGridContent.items.length === 0 || 
             block.photoGridContent.items.every(item => !item.url);
    case 'pdf':
      return !block.pdfContent?.url;
    case 'video':
    case 'youtube':
    case 'vimeo':
      return !block.videoContent?.url;
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
    case 'autodesk':
    case 'substance':
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
    case 'custom':
      return !block.embedContent?.embedCode && !block.embedContent?.url;
    default:
      return true;
  }
};

// Main Media Block Renderer
export const MediaBlockRenderer: React.FC<MediaBlockProps> = ({ block, themeColors }) => {
  // Don't render empty blocks in preview
  if (isBlockEmpty(block)) return null;

  switch (block.type) {
    case 'image':
      return <ImageBlock block={block} themeColors={themeColors} />;
    case 'text':
      return <TextBlock block={block} themeColors={themeColors} />;
    case 'photoGrid':
      return <PhotoGridBlock block={block} themeColors={themeColors} />;
    case 'pdf':
      return <PdfBlock block={block} themeColors={themeColors} />;
    case 'video':
    case 'youtube':
    case 'vimeo':
      return <VideoBlock block={block} themeColors={themeColors} />;
    case 'embed':
    case 'spotify':
    case 'soundcloud':
    case 'giphy':
    case 'figma':
    case 'sketchfab':
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
    case 'autodesk':
    case 'substance':
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
    case 'custom':
      return <EmbedBlock block={block} themeColors={themeColors} />;
    default:
      return null;
  }
};

// Media type icon helper
export const getMediaTypeIcon = (type: MediaType) => {
  switch (type) {
    case 'image':
      return ImageIcon;
    case 'text':
      return Type;
    case 'photoGrid':
      return Grid3X3;
    case 'video':
    case 'youtube':
    case 'vimeo':
      return Video;
    case 'spotify':
    case 'soundcloud':
    case 'bandcamp':
    case 'mixcloud':
      return Music;
    case 'embed':
      return LinkIcon;
    case 'figma':
      return Palette;
    case 'sketchfab':
    case 'autodesk':
    case 'substance':
      return Box;
    case 'instagram':
      return Instagram;
    case 'twitter':
      return Twitter;
    case 'facebook':
      return Facebook;
    case 'twitch':
      return Twitch;
    case 'codepen':
      return Codepen;
    case 'github':
      return Github;
    case 'dribbble':
      return Dribbble;
    case 'googleMaps':
      return MapPin;
    case 'prezi':
    case 'issuu':
    case 'slideshare':
      return Presentation;
    case 'pdf':
      return FileText;
    case 'text':
      return FileText;
    case 'photoGrid':
      return Layers;
    default:
      return Globe;
  }
};
