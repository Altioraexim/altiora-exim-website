document.addEventListener('DOMContentLoaded', () => {
  // ===== EmailJS contact form (Get In Touch) =====
  // Loaded here to avoid changing index.html markup.
  (function loadEmailJSSDK(){
    const existing = document.querySelector('script[data-emailjs="true"]');
    if (existing) return;
    const s = document.createElement('script');
    // EmailJS Browser SDK v4 is distributed under the `@emailjs/browser` package.
    // If your environment still pulls legacy `cdn.emailjs.com/dist/email.min.js`, clear cache and ensure CSP allows this CDN.
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.async = true;
    s.defer = true;
    s.dataset.emailjs = 'true';
    s.onload = () => {
      console.log('EmailJS SDK script loaded. window.emailjs =', window.emailjs);
      console.log('window.emailjs =', window.emailjs);
      console.log('window.EmailJS =', window.EmailJS);
      console.log('window.emailjsBrowser =', window.emailjsBrowser);
      console.log('all matching globals =', Object.keys(window).filter(k => k.toLowerCase().includes('email')));
    };
    s.onerror = (e) => {
      console.error('EmailJS SDK script failed to load:', e);
    };
    document.head.appendChild(s);
  })();

  const EMAILJS_SERVICE_ID = 'service_5y42kwn';
  const EMAILJS_TEMPLATE_ID = 'template_4vt33bv';
  const EMAILJS_PUBLIC_KEY = 'QWoo2-iQjO510R7UL';

  const CONTACT_IDS = {
    name: 'contact-name',
    email: 'contact-email',
    phone: 'contact-phone',
    message: 'contact-message'
  };

  function ensureInlineMessageNodes(){
    const card = document.querySelector('.contact-premium-form-card');
    if (!card) return null;

    let ok = document.getElementById('contact-emailjs-success');
    if (!ok) {
      ok = document.createElement('div');
      ok.id = 'contact-emailjs-success';
      ok.setAttribute('role','status');
      ok.style.display = 'none';
      ok.style.marginTop = '12px';
      ok.style.color = '#16a34a';
      ok.style.fontSize = '0.95rem';
      card.appendChild(ok);
    }

    let err = document.getElementById('contact-emailjs-error');
    if (!err) {
      err = document.createElement('div');
      err.id = 'contact-emailjs-error';
      err.setAttribute('role','alert');
      err.style.display = 'none';
      err.style.marginTop = '12px';
      err.style.color = '#dc2626';
      err.style.fontSize = '0.95rem';
      card.appendChild(err);
    }

    return { ok, err };
  }

  function showOk(text){
    const nodes = ensureInlineMessageNodes();
    if (!nodes) return;
    nodes.err.style.display = 'none';
    nodes.ok.textContent = text;
    nodes.ok.style.display = 'block';
  }

  function showErr(text){
    const nodes = ensureInlineMessageNodes();
    if (!nodes) return;
    nodes.ok.style.display = 'none';
    nodes.err.textContent = text;
    nodes.err.style.display = 'block';
  }

  function clearMessages(){
    const nodes = ensureInlineMessageNodes();
    if (!nodes) return;
    nodes.ok.style.display = 'none';
    nodes.err.style.display = 'none';
    nodes.ok.textContent = '';
    nodes.err.textContent = '';
  }

  function bindContactSend(){
    const btn = document.querySelector('.contact-send-btn');
    const nameEl = document.getElementById(CONTACT_IDS.name);
    const emailEl = document.getElementById(CONTACT_IDS.email);
    const phoneEl = document.getElementById(CONTACT_IDS.phone);
    const messageEl = document.getElementById(CONTACT_IDS.message);

    if (!btn || !nameEl || !emailEl || !phoneEl || !messageEl) return;

    clearMessages();

    btn.addEventListener('click', async () => {
      clearMessages();

      const templateParams = {
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        phone: phoneEl.value.trim(),
        message: messageEl.value.trim()
      };

      // Minimal client-side checks to improve UX (no layout changes)
      if (!templateParams.name || !templateParams.email || !templateParams.phone || !templateParams.message) {
        showErr('Please fill in all fields.');
        return;
      }

      try {
        btn.disabled = true;
        btn.style.opacity = '0.7';

      // Wait for EmailJS SDK (if still loading due to async script tag)
      if (!window.emailjs || typeof window.emailjs.init !== 'function') {
        const start = Date.now();
        const timeoutMs = 15000;
        while ((!window.emailjs || typeof window.emailjs.init !== 'function') && (Date.now() - start) < timeoutMs) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 200));
        }
      }

      // Hard fail with exact diagnostics so we can see the real cause in Console
      if (!window.emailjs || typeof window.emailjs.init !== 'function') {
        const sdkStatus = {
          hasEmailjs: !!window.emailjs,
          initType: window.emailjs ? typeof window.emailjs.init : null,
          readyState: document.readyState
        };
        console.error('EmailJS SDK not ready:', sdkStatus);
        throw new Error('EmailJS SDK did not finish loading. Check Console for details.');
      }


        const sdkCandidates = {
          window_emailjs: window.emailjs,
          window_emailjs_default: window.emailjs?.default,
          window_EmailJS: window.EmailJS,
          window_emailjsBrowser: window.emailjsBrowser
        };

        console.log('EmailJS SDK candidates:', {
          window_emailjs: sdkCandidates.window_emailjs,
          window_emailjs_default: sdkCandidates.window_emailjs_default,
          window_EmailJS: sdkCandidates.window_EmailJS,
          window_emailjsBrowser: sdkCandidates.window_emailjsBrowser
        });

        const sdkObject =
          sdkCandidates.window_emailjs ||
          sdkCandidates.window_emailjs_default ||
          sdkCandidates.window_EmailJS ||
          sdkCandidates.window_emailjsBrowser;

        console.log('EmailJS SDK selected object =', sdkObject);

        if (!sdkObject || typeof sdkObject.init !== 'function' || typeof sdkObject.send !== 'function') {
          throw new Error('EmailJS SDK object detected, but init/send functions are not available.');
        }

        sdkObject.init(EMAILJS_PUBLIC_KEY);
        // Ensure destination email is always altioraexim@gmail.com (client-side override)
        // Your EmailJS template should map `to_email` to the recipient.
        const finalParams = {
          ...templateParams,
          to_email: 'altioraexim@gmail.com'
        };
        const resp = await sdkObject.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, finalParams);
        console.log('EmailJS send response:', resp);




        showOk('Message sent successfully! We will get back to you soon.');

        // Clear form after success
        nameEl.value = '';
        emailEl.value = '';
        phoneEl.value = '';
        messageEl.value = '';
      } catch (e) {
        console.error('EmailJS send failed:', e);
        console.error('Full error object:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
        console.error('Error code:', e.code);
        console.error('Error message:', e.message);
        console.error('Error status:', e.status);
        console.error('Error text:', e.text);
        showErr('Failed to send message. Please try again.');
      } finally {
        btn.disabled = false;
        btn.style.opacity = '';
      }
    });
  }

  // Wait briefly for EmailJS SDK to load, then bind.
  const bindAttempt = () => {
    bindContactSend();
    if (!document.querySelector('.contact-send-btn')) return;
  };
  // bind immediately (even before sdk finishes) so click shows loader/error correctly
  bindAttempt();

  // also retry once after sdk load
  window.addEventListener('load', () => {
    setTimeout(bindAttempt, 500);
  });

  // ===== End EmailJS contact form =====
  
  // (existing code continues below)

  // ===== Google Translate: keep compact navbar layout after widget injects/updates =====
  const applyTranslateStyling = () => {
    const wrapper = document.querySelector('#google_translate_element');
    if (!wrapper) return;

    // Ensure wrapper itself is constrained (in case Google resets inline styles)
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'flex-end';

    // Constrain any immediate injected container(s)
    const directDiv = wrapper.querySelector(':scope > div');
    if (directDiv) {
      directDiv.style.width = '100%';
      directDiv.style.height = '100%';
      directDiv.style.background = 'transparent';
      directDiv.style.margin = '0';
      directDiv.style.padding = '0';
      directDiv.style.border = '0';
      directDiv.style.display = 'inline-flex';
      directDiv.style.alignItems = 'center';
      directDiv.style.justifyContent = 'flex-end';
    }

    // Style select to be compact navbar-like
    const select = wrapper.querySelector('select');
    if (select) {
      select.style.width = '100%';
      select.style.height = '34px';
      select.style.maxWidth = '100%';
      select.style.margin = '0';
      select.style.padding = '0 10px';
      select.style.borderRadius = '10px';
      select.style.boxSizing = 'border-box';
      select.style.whiteSpace = 'nowrap';
    }

    // Hide only non-interactive branding nodes if present.
    wrapper.querySelectorAll('.goog-logo-link, .goog-te-banner-frame').forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.width = '0';
      el.style.height = '0';
      el.style.margin = '0';
      el.style.padding = '0';
    });

    // Ensure the hidden Google Translate control is clickable as an overlay.
    const hiddenWidget = wrapper.querySelector('.goog-te-gadget-simple');
    if (hiddenWidget) {
      hiddenWidget.style.position = 'absolute';
      hiddenWidget.style.inset = '0';
      hiddenWidget.style.width = '100%';
      hiddenWidget.style.height = '100%';
      hiddenWidget.style.margin = '0';
      hiddenWidget.style.padding = '0';
      hiddenWidget.style.background = 'transparent';
      hiddenWidget.style.opacity = '0';
      hiddenWidget.style.pointerEvents = 'auto';
      hiddenWidget.style.zIndex = '3';
    }

    const hiddenAnchor = wrapper.querySelector('a[aria-haspopup="true"]');
    if (hiddenAnchor) {
      hiddenAnchor.style.display = 'block';
      hiddenAnchor.style.visibility = 'visible';
      hiddenAnchor.style.position = 'absolute';
      hiddenAnchor.style.inset = '0';
      hiddenAnchor.style.width = '100%';
      hiddenAnchor.style.height = '100%';
      hiddenAnchor.style.margin = '0';
      hiddenAnchor.style.padding = '0';
      hiddenAnchor.style.background = 'transparent';
      hiddenAnchor.style.opacity = '0';
      hiddenAnchor.style.pointerEvents = 'auto';
      hiddenAnchor.style.zIndex = '4';
      hiddenAnchor.style.textIndent = '-9999px';
    }
  };

  let isTriggeringTranslate = false;

  const triggerTranslateDropdown = () => {
    if (isTriggeringTranslate) return false;
    const wrapper = document.querySelector('#google_translate_element');
    if (!wrapper) return false;

    const select = wrapper.querySelector('select');
    if (select) {
      isTriggeringTranslate = true;
      select.focus({ preventScroll: true });
      const evtDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
      const evtUp = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
      const evtClick = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      select.dispatchEvent(evtDown);
      select.dispatchEvent(evtUp);
      select.dispatchEvent(evtClick);
      isTriggeringTranslate = false;
      return true;
    }

    const toggleAnchor = wrapper.querySelector('a[aria-haspopup="true"]');
    if (toggleAnchor) {
      isTriggeringTranslate = true;
      toggleAnchor.focus({ preventScroll: true });
      ['mousedown', 'mouseup', 'click'].forEach(type => {
        toggleAnchor.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      });
      isTriggeringTranslate = false;
      return true;
    }

    return false;
  };

  const startTranslateObserver = () => {
    // Re-apply immediately and whenever google injects/updates DOM.
    applyTranslateStyling();

    const root = document.body;
    const obs = new MutationObserver(() => {
      // Keep light: only when widget might be present
      if (document.getElementById('google_translate_element')) {
        applyTranslateStyling();
      }
    });

    obs.observe(root, { childList: true, subtree: true });

    // Safety: stop after some time to reduce overhead
    setTimeout(() => obs.disconnect(), 15000);
  };

  // Hook the visible language selector to open the native Google language dropdown.
  // The visible control in index.html/gallery.html is the .translate-wrapper element.
  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('.translate-wrapper') : null;
    if (!btn) return;

    if (e.target.closest('#google_translate_element')) return;
    if (!e.isTrusted) return;

    e.preventDefault();
    e.stopPropagation();
    triggerTranslateDropdown();
  }, true);





  startTranslateObserver();

  // Hide preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 1500);
  }

  // Set year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ===== IMAGE SLIDER =====
  const sliderContainer = document.getElementById('sliderContainer');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  let currentSlide = 0;
  let autoplayInterval;

  if (sliderContainer) {
    const slides = sliderContainer.querySelectorAll('.slide');
    const totalSlides = slides.length;

    function showSlide(n) {
      slides.forEach(slide => slide.classList.remove('active'));
      currentSlide = (n + totalSlides) % totalSlides;
      slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
      resetAutoplay();
    }

    function prevSlide() {
      showSlide(currentSlide - 1);
      resetAutoplay();
    }

    function autoplay() {
      autoplayInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 5000);
    }

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      autoplay();
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    autoplay();
  }

  // ===== PRODUCTS MODAL GALLERY (2-level) =====
  const CATEGORY_MODAL_ID = 'categoryProductsModal';
  const LIGHTBOX_MODAL_ID = 'productLightboxModal';

  let activeItems = [];
  let activeIndex = 0;

  function ensureModalMarkup() {
    if (!document.getElementById(CATEGORY_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = CATEGORY_MODAL_ID;
      modal.className = 'bb-modal bb-modal-category';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="bb-modal-overlay" data-close-overlay="true"></div>
        <div class="bb-modal-dialog" role="document">
          <button class="bb-modal-close" type="button" aria-label="Close">&times;</button>
          <div class="bb-modal-header">
            <h2 class="bb-modal-title" id="bbCategoryTitle">Category</h2>
          </div>
          <div class="bb-modal-body">
            <div class="bb-products-grid" id="bbCategoryGrid"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    if (!document.getElementById(LIGHTBOX_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = LIGHTBOX_MODAL_ID;
      modal.className = 'bb-modal bb-modal-lightbox';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="bb-modal-overlay" data-close-overlay="true"></div>
        <div class="bb-modal-dialog bb-modal-dialog-lightbox" role="document">
          <button class="bb-modal-close bb-lightbox-close" type="button" aria-label="Close">&times;</button>
          <div class="bb-lightbox-content">
            <button class="bb-nav bb-nav-prev" type="button" aria-label="Previous">‹</button>
            <div class="bb-lightbox-media">
              <img id="bbLightboxImage" alt="Product" />
            </div>
            <button class="bb-nav bb-nav-next" type="button" aria-label="Next">›</button>
          </div>
          <div class="bb-lightbox-caption">
            <h3 id="bbLightboxName">Product</h3>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  }

  function lockScroll() {
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.body.style.overflow = '';
  }

  function showModal(modalEl) {
    modalEl.setAttribute('aria-hidden', 'false');
    modalEl.classList.add('bb-modal-show');
    lockScroll();
  }

  function hideModal(modalEl) {
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.classList.remove('bb-modal-show');
    const anyVisible = !!document.querySelector('.bb-modal.bb-modal-show');
    if (!anyVisible) unlockScroll();
  }

  function getItemsForCategory(categoryKey) {
    if (!window.galleryData) return [];

    // Site card mapping:
    // - existing 3rd card uses data-gallery-category="rugs"
    // - your requirements want carpet images for that card
    if (categoryKey === 'rugs') categoryKey = 'carpet';

    const items = window.galleryData[categoryKey];
    return Array.isArray(items) ? items : [];
  }


  function buildCategoryGrid(items) {
    const grid = document.getElementById('bbCategoryGrid');
    if (!grid) return;

    grid.innerHTML = '';

    items.forEach((item, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'bb-product-card';
      card.setAttribute('aria-label', 'Open ' + item.name);
      card.innerHTML = `
        <div class="bb-product-card-media">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="bb-product-card-name">${item.name}</div>
      `;

      card.addEventListener('click', () => {
        openLightbox(index);
      });

      grid.appendChild(card);
    });
  }

  function openCategoryModal(categoryKey, categoryTitle) {
    ensureModalMarkup();

    const modal = document.getElementById(CATEGORY_MODAL_ID);
    const titleEl = document.getElementById('bbCategoryTitle');

    activeItems = getItemsForCategory(categoryKey);
    activeIndex = 0;

    // Adjust modal layout based on item count (for centering 3-card categories like Pottery)
    const count = activeItems ? activeItems.length : 0;
    modal.classList.remove('bb-has-1','bb-has-2','bb-has-3');
    if (count === 3) modal.classList.add('bb-has-3');
    else if (count === 2) modal.classList.add('bb-has-2');
    else if (count === 1) modal.classList.add('bb-has-1');

    if (titleEl) titleEl.textContent = categoryTitle || 'Collection';
    buildCategoryGrid(activeItems);

    // Close handlers
    const closeBtn = modal.querySelector('.bb-modal-close');
    if (closeBtn) closeBtn.onclick = () => hideModal(modal);
    modal.querySelectorAll('[data-close-overlay="true"]').forEach(overlay => {
      overlay.onclick = () => hideModal(modal);
    });

    showModal(modal);
  }

  function openLightbox(index) {
    ensureModalMarkup();
    if (!activeItems || activeItems.length === 0) return;

    const modal = document.getElementById(LIGHTBOX_MODAL_ID);
    const img = document.getElementById('bbLightboxImage');
    const name = document.getElementById('bbLightboxName');

    activeIndex = index;

    function render() {
      activeIndex = (activeIndex + activeItems.length) % activeItems.length;
      img.src = activeItems[activeIndex].image;
      img.alt = activeItems[activeIndex].name;
      name.textContent = activeItems[activeIndex].name;
    }

    render();

    const closeBtn = modal.querySelector('.bb-lightbox-close');
    if (closeBtn) closeBtn.onclick = () => hideModal(modal);

    modal.querySelectorAll('[data-close-overlay="true"]').forEach(overlay => {
      overlay.onclick = () => hideModal(modal);
    });

    const prev = modal.querySelector('.bb-nav-prev');
    const next = modal.querySelector('.bb-nav-next');

    if (prev) prev.onclick = () => {
      activeIndex -= 1;
      render();
    };

    if (next) next.onclick = () => {
      activeIndex += 1;
      render();
    };

    showModal(modal);
  }

  function bindCategoryClicks() {
    const cards = document.querySelectorAll('.product-card.product-category[data-gallery-category]');
    cards.forEach(card => {
      const catKey = card.getAttribute('data-gallery-category');
      const catTitle = card.getAttribute('data-gallery-title') || 'Collection';

      const handler = () => openCategoryModal(catKey, catTitle);

      card.addEventListener('click', handler);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });
    });
  }

  function bindGlobalClose() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const visible = document.querySelector('.bb-modal.bb-modal-show');
      if (!visible) return;
      hideModal(visible);
    });
  }

  ensureModalMarkup();
  bindCategoryClicks();
  bindGlobalClose();
});

const mobileBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.querySelector(".main-nav");

if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
  });
}