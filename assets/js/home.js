/* ============================================
   Wingman Labs - Home Page Scripts
   Consolidated from home1-9.html
   ============================================ */

// ============================================
// SECTION 2: 3D Product Showcase
// ============================================
(function init3DShowcase() {
  const container = document.getElementById('canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / (window.innerHeight * 0.33), 0.1, 1000);
  camera.position.set(0, -2.75, 6);
  camera.lookAt(0, -2.75, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight * 0.33);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
  mainLight.position.set(3, 4, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);
  
  const fillLight = new THREE.DirectionalLight(0xffd0a0, 0.25);
  fillLight.position.set(-3, -2, -3);
  scene.add(fillLight);
  
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
  rimLight.position.set(-5, 3, -5);
  scene.add(rimLight);

  // Create strip helper
  function createStrip(color, emissiveColor) {
    const geometry = new THREE.BoxGeometry(1.04, 1.04, 0.003, 16, 16, 1);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(emissiveColor),
      emissiveIntensity: 0.15,
      roughness: 0.25,
      metalness: 0.05,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      clearcoat: 0.3,
      clearcoatRoughness: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
  }

  // Create sachet helper
  function createSachet(imageUrl, position, isEnergy) {
    const group = new THREE.Group();
    const geometry = new THREE.PlaneGeometry(3.492, 2.16, 48, 48);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.02,
      side: THREE.FrontSide,
      clearcoat: 0.1
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    group.position.copy(position);
    mesh.castShadow = true;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, function(texture) {
      texture.center.set(0.5, 0.5);
      texture.rotation = isEnergy ? -Math.PI / 2 : Math.PI / 2;
      texture.encoding = THREE.sRGBEncoding;
      material.map = texture;
      material.needsUpdate = true;
    });

    scene.add(group);
    return group;
  }

  // Create strips
  const strips = [];
  const centerOffset = 0.225;

  const strip1 = createStrip(0x992200, 0x661100);
  strip1.position.set(-1.17 + centerOffset, -1.62, 1.2);
  strip1.rotation.set(0, 0, Math.PI / 4);
  scene.add(strip1);
  strips.push({ mesh: strip1, baseRotation: { x: 0, y: 0, z: Math.PI / 4 }});

  const strip2 = createStrip(0x992200, 0x661100);
  strip2.position.set(0.65 + centerOffset, -1.68, 0.2);
  strip2.rotation.set(Math.PI / 8, Math.PI / 6, 0);
  scene.add(strip2);
  strips.push({ mesh: strip2, baseRotation: { x: Math.PI / 8, y: Math.PI / 6, z: 0 }});

  const strip3 = createStrip(0x0D0508, 0x050102);
  strip3.position.set(-1.3 + centerOffset, -2.85, 0.3);
  strip3.rotation.set(-Math.PI / 10, -Math.PI / 8, 0);
  scene.add(strip3);
  strips.push({ mesh: strip3, baseRotation: { x: -Math.PI / 10, y: -Math.PI / 8, z: 0 }});

  const strip4 = createStrip(0x0D0508, 0x050102);
  strip4.position.set(0.455 + centerOffset, -3.05, 0.6);
  strip4.scale.set(0.85, 0.85, 1);
  scene.add(strip4);
  strips.push({ mesh: strip4, baseRotation: { x: 0, y: 0, z: 0 }});

  // Create black strip background
  function getScreenWidthAtZ(z) {
    const distance = camera.position.z - z;
    const vFov = (camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFov / 2) * distance;
    return height * camera.aspect;
  }

  let blackStrip;
  function createBlackStrip() {
    if (blackStrip) {
      scene.remove(blackStrip);
      blackStrip.geometry.dispose();
      blackStrip.material.dispose();
    }
    const blackStripZ = -0.5;
    const w = getScreenWidthAtZ(blackStripZ);
    const h = 5.0;
    const shape = new THREE.Shape();
    const hw = w / 2, hh = h / 2, r = 0.15;
    shape.moveTo(-hw, hh);
    shape.lineTo(hw, hh);
    shape.lineTo(hw, -hh + r);
    shape.quadraticCurveTo(hw, -hh, hw - r, -hh);
    shape.lineTo(-hw + r, -hh);
    shape.quadraticCurveTo(-hw, -hh, -hw, -hh + r);
    shape.lineTo(-hw, hh);
    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    blackStrip = new THREE.Mesh(geo, mat);
    blackStrip.position.set(0, 2.0, blackStripZ);
    scene.add(blackStrip);
  }
  createBlackStrip();

  // Create sachets
  const energySachetUrl = 'https://cdn.shopify.com/s/files/1/0606/2433/9038/files/Energy_Sachet_flat_design.png?v=1760223608';
  const sleepSachetUrl = 'https://cdn.shopify.com/s/files/1/0606/2433/9038/files/Sleep_Sachet_flat_design.png?v=1760223608';

  function getSachetPosition() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    return isMobile ? 4.5 : isTablet ? 4.2 : 5.2;
  }

  const xOffset = getSachetPosition();
  const energySachet = createSachet(energySachetUrl, new THREE.Vector3(-xOffset, -2.5, -1.5), true);
  const sleepSachet = createSachet(sleepSachetUrl, new THREE.Vector3(xOffset, -1.6, -1.5), false);

  // Animation
  const mouse = { x: 0, y: 0 };
  const targetRotation = { x: 0, y: 0 };
  let isDragging = false;
  let time = 0;

  container.addEventListener('mousedown', () => isDragging = true);
  container.addEventListener('mouseup', () => isDragging = false);
  container.addEventListener('mousemove', (e) => {
    if (isDragging) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
  });
  container.addEventListener('touchstart', () => isDragging = true, { passive: true });
  container.addEventListener('touchend', () => { isDragging = false; mouse.x = 0; mouse.y = 0; });
  container.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length > 0) {
      mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }, { passive: true });

  function animate() {
    requestAnimationFrame(animate);
    time += 0.008;
    
    if (isDragging) {
      targetRotation.y += (mouse.x * Math.PI * 0.2 - targetRotation.y) * 0.08;
      targetRotation.x += (mouse.y * Math.PI * 0.2 - targetRotation.x) * 0.08;
    }

    strips.forEach(({ mesh, baseRotation }, index) => {
      const animOffset = [Math.sin(time * 0.5) * 0.25, Math.cos(time * 0.6) * 0.28, Math.sin(time * 0.4) * 0.22, Math.cos(time * 0.45) * 0.18][index];
      mesh.rotation.x = baseRotation.x + targetRotation.x;
      mesh.rotation.y = baseRotation.y + targetRotation.y + animOffset;
      mesh.rotation.z = baseRotation.z;
    });

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  let resizeTimeout, lastWidth = window.innerWidth, lastHeight = window.innerHeight;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const width = window.innerWidth, height = window.innerHeight;
      if (Math.abs(width - lastWidth) > 10 || Math.abs(height - lastHeight) > 100) {
        lastWidth = width;
        lastHeight = height;
        camera.aspect = width / (height * 0.33);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height * 0.33);
        createBlackStrip();
        const newXOffset = getSachetPosition();
        energySachet.position.x = -newXOffset;
        sleepSachet.position.x = newXOffset;
      }
    }, 150);
  });
})();

// ============================================
// SECTION 5: Product Carousel
// ============================================
(function initCarousel() {
  const scope = document.querySelector('.wm-clinical-carousel-v1');
  if (!scope) return;

  const container = scope.querySelector('.wm-clinical-track-container');
  const track = scope.querySelector('.wm-clinical-track');
  const cards = scope.querySelectorAll('.wm-clinical-card');
  const scrollIndicator = scope.querySelector('.scroll-indicator');
  const scrollDots = scope.querySelectorAll('.scroll-dot');

  let isMobile = window.innerWidth < 768;
  let scrollTimeout;

  function updateScrollIndicator() {
    if (!isMobile || !cards.length) return;
    const scrollLeft = container.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 20;
    const currentIndex = Math.round(scrollLeft / cardWidth);
    
    scrollDots.forEach((dot, index) => dot.classList.toggle('active', index === currentIndex));
    cards.forEach((card, index) => card.classList.toggle('active', index === currentIndex));
  }

  function scrollToCard(index) {
    if (!isMobile || !cards.length) return;
    const cardWidth = cards[0].offsetWidth + 20;
    container.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
  }

  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', (e) => {
      const dot = e.target.closest('.scroll-dot');
      if (dot && dot.dataset.index !== undefined) {
        scrollToCard(parseInt(dot.dataset.index, 10));
      }
    });
  }

  if (container) {
    container.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateScrollIndicator, 16);
    }, { passive: true });
  }

  if (track) {
    track.addEventListener('mouseenter', (e) => {
      if (isMobile) return;
      const card = e.target.closest('.wm-clinical-card');
      if (card) {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }
    }, true);
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const wasMobile = isMobile;
      isMobile = window.innerWidth < 768;
      if (wasMobile !== isMobile) {
        if (!isMobile) {
          container.scrollTo({ left: 0 });
          cards.forEach(c => c.classList.remove('active'));
          if (cards[0]) cards[0].classList.add('active');
        } else {
          updateScrollIndicator();
        }
      }
    }, 100);
  });

  if (isMobile) {
    updateScrollIndicator();
  } else if (cards[0]) {
    cards[0].classList.add('active');
  }
})();

// ============================================
// SECTION 6: Quiz Toggle
// ============================================
(function initQuiz() {
  const toggleBtn = document.getElementById('quizToggleBtn');
  const dropdown = document.getElementById('quizDropdown');
  if (!toggleBtn || !dropdown) return;

  toggleBtn.addEventListener('click', () => {
    dropdown.classList.toggle('open');
    if (dropdown.classList.contains('open')) {
      toggleBtn.textContent = "Close Quiz";
      toggleBtn.classList.add('active-state');
    } else {
      toggleBtn.textContent = "Start Quiz";
      toggleBtn.classList.remove('active-state');
    }
  });
})();

// ============================================
// SECTION 8: Bioavailability Counter Animation
// ============================================
(function initBioCounter() {
  function animateCounter(element, start, end, duration) {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      element.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = end;
      }
    };
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const percentText = entry.target.querySelector('.percent-number');
      if (!percentText) return;
      if (entry.isIntersecting) {
        percentText.textContent = '100';
        setTimeout(() => animateCounter(percentText, 100, 900, 1500), 150);
      } else {
        percentText.textContent = '100';
      }
    });
  }, { threshold: 0.25 });

  const section = document.querySelector('.strips-section');
  if (section) observer.observe(section);
})();

// ============================================
// SECTION 9: Home FAQ Accordion
// ============================================
(function initHomeFAQ() {
  const faqItems = document.querySelectorAll('.home-faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.home-faq-question');
    if (question) {
      question.addEventListener('click', () => {
        faqItems.forEach(otherItem => {
          if (otherItem !== item) otherItem.classList.remove('active');
        });
        item.classList.toggle('active');
      });
    }
  });
})();
