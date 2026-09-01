(function() {
  var store = window.__PORTFOLIO_STORE__;
  if (!store) { console.error('Store not found! Make sure you are on the portfolio builder page.'); return; }
  var state = store.getState();
  var hero = state.portfolio.sections.find(function(s) { return s.type === 'hero'; });
  if (!hero) { console.error('No Hero section found!'); return; }
  var heroId = hero.id;
  var imgs = [
    { id: 'gi-1', url: 'https://picsum.photos/seed/test1/800/600', caption: 'Test Image 1' },
    { id: 'gi-2', url: 'https://picsum.photos/seed/test2/800/600', caption: 'Test Image 2' },
    { id: 'gi-3', url: 'https://picsum.photos/seed/test3/800/600', caption: 'Test Image 3' },
    { id: 'gi-4', url: 'https://picsum.photos/seed/test4/800/600', caption: 'Test Image 4' },
    { id: 'gi-5', url: 'https://picsum.photos/seed/test5/800/600', caption: 'Test Image 5' },
    { id: 'gi-6', url: 'https://picsum.photos/seed/test6/800/600', caption: 'Test Image 6' }
  ];
  var vids = [
    { id: 'gv-1', type: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'YouTube Test' },
    { id: 'gv-2', type: 'vimeo', url: 'https://player.vimeo.com/video/76979871', caption: 'Vimeo Test' }
  ];
  store.getState().updateSection(heroId, {
    name: 'Jane Doe',
    title: 'Senior Product Designer',
    subtitle: 'Creating delightful digital experiences',
    bio: 'Passionate designer with 8+ years of experience crafting user-centered digital products.',
    avatar: 'https://picsum.photos/seed/avatar/300/300',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatarShape: 'circle',
    avatarWidth: 120,
    avatarHeight: 120,
    showName: true, showTitle: true, showSubtitle: true, showBio: true, showAvatar: true, showScrollIndicator: true,
    avatarPosition: { x: 50, y: 8 },
    namePosition: { x: 50, y: 18 },
    titlePosition: { x: 50, y: 28 },
    subtitlePosition: { x: 50, y: 38 },
    bioPosition: { x: 50, y: 50 },
    ctaButtonsPosition: { x: 50, y: 75 },
    ctaButtons: [
      { id: 'cta-1', label: 'View My Work', link: '#projects', variant: 'primary' },
      { id: 'cta-2', label: 'Contact Me', link: '#contact', variant: 'outline' },
      { id: 'cta-3', label: 'Download CV', link: 'https://example.com/cv.pdf', variant: 'secondary' }
    ],
    freeFormEnabled: true, snapEnabled: true,
    galleryImages: imgs, galleryVideos: vids,
    galleryGridCols: 3, galleryVideoGridCols: 2,
    typingWords: ['Designer', 'Developer', 'Creator'],
    parallaxEnabled: false
  });
  console.log('Hero section populated! Hero ID: ' + heroId);
  console.log('Test column changes:');
  console.log('  store.getState().updateSection("' + heroId + '", { galleryGridCols: 1 })');
  console.log('  store.getState().updateSection("' + heroId + '", { galleryGridCols: 4 })');
  console.log('Toggle free-form:');
  console.log('  store.getState().updateSection("' + heroId + '", { freeFormEnabled: false })');
  console.log('  store.getState().updateSection("' + heroId + '", { freeFormEnabled: true })');
})();
