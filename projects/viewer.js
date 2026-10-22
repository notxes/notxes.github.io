/* Shared image viewer and optional image handling for project pages. */
(() => {
  document.querySelectorAll('img[data-optional]').forEach(img => {
    const onError = () => {
      const media = img.closest('[data-media]');
      if (media) {
        media.hidden = true;
        const section = media.closest('.gallery-section');
        if (section && !section.querySelector('figure[data-media]:not([hidden])')) section.hidden = true;
      }
      const preview = img.closest('.preview');
      if (preview) preview.setAttribute('data-missing', '');
    };
    img.addEventListener('error', onError);
    if (img.complete && !img.naturalWidth) onError();
  });

  const viewer = document.querySelector('#imageViewer');
  if (!viewer) return;
  const viewerImg = viewer.querySelector('[data-viewer-img]');
  const stage = viewer.querySelector('[data-viewer-stage]');
  const canvas = viewer.querySelector('[data-viewer-canvas]');
  const label = viewer.querySelector('[data-viewer-zoom]');
  const openLink = viewer.querySelector('[data-viewer-original]');
  const title = viewer.querySelector('[data-viewer-title]');
  const plus = viewer.querySelector('[data-viewer-plus]');
  const minus = viewer.querySelector('[data-viewer-minus]');
  let fitWidth = 0, fitHeight = 0, zoom = 1, previousFocus = null;

  function setZoom(value) {
    if (!fitWidth || !fitHeight) return;
    zoom = Math.max(1, Math.min(5, value));
    const w = Math.round(fitWidth * zoom);
    const h = Math.round(fitHeight * zoom);
    viewerImg.style.width = `${w}px`;
    viewerImg.style.height = `${h}px`;
    canvas.style.width = `${Math.max(w, stage.clientWidth)}px`;
    canvas.style.height = `${Math.max(h, stage.clientHeight)}px`;
    label.textContent = `${Math.round(zoom * 100)}%`;
    plus.disabled = zoom >= 5;
    minus.disabled = zoom <= 1;
    stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
    stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
  }

  function fit() {
    if (!viewerImg.naturalWidth || !viewerImg.naturalHeight) return;
    const scale = Math.min(1, (stage.clientWidth - 10) / viewerImg.naturalWidth, (stage.clientHeight - 10) / viewerImg.naturalHeight);
    fitWidth = Math.round(viewerImg.naturalWidth * scale);
    fitHeight = Math.round(viewerImg.naturalHeight * scale);
    setZoom(1);
  }

  document.querySelectorAll('a[data-zoom]').forEach(link => {
    link.addEventListener('click', event => {
      const img = link.querySelector('img');
      if (!img || !img.naturalWidth) return;
      event.preventDefault();
      previousFocus = document.activeElement;
      fitWidth = fitHeight = 0;
      title.textContent = img.alt || 'Project image';
      openLink.href = link.href;
      viewerImg.alt = img.alt;
      viewerImg.onload = fit;
      viewerImg.src = link.href;
      viewer.showModal();
      document.body.style.overflow = 'hidden';
      if (viewerImg.complete && viewerImg.naturalWidth) fit();
    });
  });

  viewer.querySelector('[data-viewer-close]').addEventListener('click', () => viewer.close());
  plus.addEventListener('click', () => setZoom(zoom + .5));
  minus.addEventListener('click', () => setZoom(zoom - .5));
  viewer.querySelector('[data-viewer-fit]').addEventListener('click', () => setZoom(1));
  viewer.addEventListener('close', () => {
    document.body.style.overflow = '';
    viewerImg.removeAttribute('src');
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  });
  viewer.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(zoom + .5); }
    if (event.key === '-') { event.preventDefault(); setZoom(zoom - .5); }
  });
})();
