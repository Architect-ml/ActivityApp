import PhotoSwipeLightbox from 'https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.3.3/photoswipe-lightbox.esm.min.js';

export const lightbox = new PhotoSwipeLightbox({
  showHideAnimationType: 'none',
  pswpModule: () => import('https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.3.3/photoswipe.esm.min.js')
});
