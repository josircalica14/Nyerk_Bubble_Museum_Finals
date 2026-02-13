/**
 * DetailView Class
 * Manages the 3D wall portfolio detail page with 360° room view
 */
class DetailView {
  constructor() {
    // Get references to elements
    this.detailView = document.getElementById('detail-view');
    this.backBtn = document.getElementById('back-btn');
    this.detailTitle = this.detailView.querySelector('.detail-title');
    this.detailContainer = this.detailView.querySelector('.detail-container');
    this.wallGrid = this.detailView.querySelector('.wall-grid');
    
    // Track state
    this.isOpen = false;
    this.currentData = null;
    
    // Camera/rotation state - start facing the title card with zoomed in view
    this.rotation = { x: 0, y: -308.57 };
    this.targetRotation = { x: 0, y: -308.57 };
    this.zoom = 1.3;
    this.targetZoom = 1.3;
    
    // Camera position for WASD movement
    this.position = { x: 0, y: 0, z: 0 };
    this.targetPosition = { x: 0, y: 0, z: 0 };
    this.moveSpeed = 5;
    this.boundaryRadius = 200; // Walking space - cards are at 650px, so 450px buffer from cards
    
    // Movement state
    this.keys = { w: false, a: false, s: false, d: false };
    
    this.isDragging = false;
    this.lastMousePos = null;
    this.dragSensitivity = 0.5; // Increased for more responsive look
    this.animationFrameId = null;
    
    // Zoom limits
    this.MIN_ZOOM = 0.5;
    this.MAX_ZOOM = 2.0;
    
    // Bind methods
    this.hide = this.hide.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.updateRotation = this.updateRotation.bind(this);
    
    // Set up event listeners
    this.backBtn.addEventListener('click', this.hide);
  }
  
  /**
   * Show the detail view with portfolio data
   * @param {Object} data - Portfolio item data
   */
  show(data) {
    if (!data) return;
    
    this.currentData = data;
    
    // Update title card with portfolio name
    const portfolioTitle = document.getElementById('portfolio-title');
    if (portfolioTitle) {
      portfolioTitle.textContent = `${data.title}'s Portfolio`;
    }
    
    // Apply color theme based on portfolio color
    this.applyColorTheme(data.color, data);
    
    // Load images from portfolio folder
    this.loadPortfolioImages(data);
    
    // Show detail view
    this.detailView.classList.add('active');
    this.detailView.setAttribute('aria-hidden', 'false');
    
    // Set state
    this.isOpen = true;
    
    // Add keyboard listener for ESC and WASD
    document.addEventListener('keydown', this.handleKeyPress);
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    
    // Add drag controls
    this.detailView.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    
    // Add zoom control
    this.detailView.addEventListener('wheel', this.handleWheel, { passive: false });
    
    // Start animation loop
    this.startAnimation();
    
    console.log('Detail view opened for:', data.title);
  }
  
  /**
   * Apply color theme to detail view based on portfolio color
   * @param {string} color - Hex color code
   * @param {Object} data - Portfolio item data
   */
  applyColorTheme(color, data) {
    if (!color) return;
    
    // Convert hex to RGB for alpha variations
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const rgb = hexToRgb(color);
    if (!rgb) return;
    
    // Remove any existing particle background
    const existingBg = this.detailView.querySelector('.detail-particle-background');
    if (existingBg) existingBg.remove();
    
    // Create particle background container
    const particleBg = document.createElement('div');
    particleBg.className = 'detail-particle-background';
    particleBg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;
    
    // Create small flying particles with accent color
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 4; // Small particles: 4-12px
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 15 + 10; // 10-25s animation
      const delay = Math.random() * 5;
      const opacity = Math.random() * 0.4 + 0.2; // 0.2-0.6 opacity
      
      // Random movement pattern
      const moveX = (Math.random() - 0.5) * 200; // -100 to 100px
      const moveY = (Math.random() - 0.5) * 200;
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        top: ${y}%;
        background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity});
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6);
        animation: floatParticle${i} ${duration}s ease-in-out ${delay}s infinite;
      `;
      
      particleBg.appendChild(particle);
      
      // Create unique animation for each particle
      const style = document.createElement('style');
      style.textContent = `
        @keyframes floatParticle${i} {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: ${opacity};
          }
          25% { 
            transform: translate(${moveX * 0.5}px, ${moveY * 0.3}px) scale(1.2);
            opacity: ${opacity * 1.5};
          }
          50% { 
            transform: translate(${moveX}px, ${moveY}px) scale(0.8);
            opacity: ${opacity * 0.7};
          }
          75% { 
            transform: translate(${moveX * 0.3}px, ${moveY * 0.7}px) scale(1.1);
            opacity: ${opacity * 1.2};
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Add flying PNG images from portfolio background folder with shooting star effect
    const folder = data.folder || data.id;
    const backgroundPath = `assets/portfolios/${folder}/background/`;
    
    // First, collect available images
    const availableImages = [];
    const maxImagesToCheck = 10;
    
    // Create a promise-based image loader to check which images exist
    const checkImage = (path) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(path);
        img.onerror = () => resolve(null);
        img.src = path;
      });
    };
    
    // Load available images and create 8-10 shooting stars
    const numShootingStars = Math.floor(Math.random() * 3) + 8; // 8-10 shooting stars
    
    // Check which images exist (1.png through 10.png)
    Promise.all(
      Array.from({ length: maxImagesToCheck }, (_, i) => 
        checkImage(`${backgroundPath}${i + 1}.png`)
      )
    ).then(results => {
      const validImages = results.filter(path => path !== null);
      
      // If no images found, skip
      if (validImages.length === 0) {
        console.log('No background images found for', folder);
        return;
      }
      
      console.log(`Found ${validImages.length} background images for ${folder}`);
      
      // Create 8-10 shooting stars, cycling through available images
      for (let i = 0; i < numShootingStars; i++) {
        const imgElement = document.createElement('img');
        const imgPath = validImages[i % validImages.length]; // Cycle through available images
        
        // Bigger size for shooting stars
        const size = Math.random() * 40 + 60; // 60-100px
        
        // Random starting position (off-screen or edge)
        const startSide = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let startX, startY, endX, endY;
        
        switch(startSide) {
          case 0: // Start from top
            startX = Math.random() * 100;
            startY = -10;
            endX = Math.random() * 100;
            endY = 110;
            break;
          case 1: // Start from right
            startX = 110;
            startY = Math.random() * 100;
            endX = -10;
            endY = Math.random() * 100;
            break;
          case 2: // Start from bottom
            startX = Math.random() * 100;
            startY = 110;
            endX = Math.random() * 100;
            endY = -10;
            break;
          case 3: // Start from left
            startX = -10;
            startY = Math.random() * 100;
            endX = 110;
            endY = Math.random() * 100;
            break;
        }
        
        // Animation duration and delay
        const duration = Math.random() * 8 + 6; // 6-14 seconds
        const delay = Math.random() * 5; // 0-5 second delay
        
        imgElement.src = imgPath;
        imgElement.alt = '';
        imgElement.className = 'shooting-star';
        imgElement.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${startX}%;
          top: ${startY}%;
          object-fit: contain;
          opacity: 0;
          filter: drop-shadow(0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)) 
                  drop-shadow(0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5));
          animation: shootingStar${i} ${duration}s ease-in-out ${delay}s infinite;
          transform-origin: center center;
        `;
        
        particleBg.appendChild(imgElement);
        
        // Create shooting star animation with trail effect
        const imgStyle = document.createElement('style');
        imgStyle.textContent = `
          @keyframes shootingStar${i} {
            0% { 
              left: ${startX}%;
              top: ${startY}%;
              opacity: 0;
              transform: rotate(${Math.random() * 360}deg) scale(0.5);
              filter: drop-shadow(0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)) 
                      drop-shadow(0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5))
                      blur(0px);
            }
            10% { 
              opacity: 1;
              transform: rotate(${Math.random() * 360}deg) scale(1);
            }
            50% { 
              left: ${(startX + endX) / 2}%;
              top: ${(startY + endY) / 2}%;
              opacity: 1;
              transform: rotate(${Math.random() * 360}deg) scale(1.1);
              filter: drop-shadow(0 0 15px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)) 
                      drop-shadow(0 0 25px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7))
                      blur(0px);
            }
            90% { 
              opacity: 1;
              transform: rotate(${Math.random() * 360}deg) scale(0.9);
            }
            100% { 
              left: ${endX}%;
              top: ${endY}%;
              opacity: 0;
              transform: rotate(${Math.random() * 360}deg) scale(0.5);
              filter: drop-shadow(0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)) 
                      drop-shadow(0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5))
                      blur(1px);
            }
          }
        `;
        document.head.appendChild(imgStyle);
      }
    });
    
    this.detailView.insertBefore(particleBg, this.detailView.firstChild);
    
    // Set dark base background
    this.detailView.style.background = `
      radial-gradient(ellipse at center, rgba(15, 20, 45, 1) 0%, rgba(5, 8, 20, 1) 100%)
    `;
    
    // Apply color theme to title card
    const titleCard = this.detailView.querySelector('.title-card');
    if (titleCard) {
      titleCard.style.background = `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) 100%)`;
      titleCard.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
      
      const title = titleCard.querySelector('h2');
      if (title) {
        title.style.textShadow = `
          0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1),
          0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8),
          0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6),
          0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)
        `;
      }
    }
    
    // Apply color theme to all cards
    const cards = this.detailView.querySelectorAll('.wall-box:not(.title-card)');
    cards.forEach(card => {
      card.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
      
      // Update card title color
      const h3 = card.querySelector('h3');
      if (h3) {
        h3.style.color = color;
      }
      
      // Update list item borders
      const listItems = card.querySelectorAll('li');
      listItems.forEach(li => {
        li.style.borderLeftColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
        li.style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;
      });
      
      // Update links
      const links = card.querySelectorAll('.detail-link');
      links.forEach(link => {
        link.style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
        link.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
      });
    });
    
    // Update back button
    if (this.backBtn) {
      this.backBtn.style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
      this.backBtn.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    }
  }
  
  /**
   * Load images from portfolio folder into cards
   * @param {Object} data - Portfolio item data
   */
  loadPortfolioImages(data) {
    const folder = data.folder || data.id;
    const basePath = `assets/portfolios/${folder}/`;
    
    console.log('Loading images for portfolio:', data.title, 'from:', basePath);
    
    // Card names mapping to folder names
    const cardFolders = {
      'overview': 'overview',
      'gallery': 'gallery',
      'technologies': 'technologies',
      'details': 'details',
      'links': 'links',
      'contact': 'contact'
    };
    
    // Load images for each card
    Object.keys(cardFolders).forEach(cardName => {
      const card = this.detailView.querySelector(`[data-card="${cardName}"]`);
      if (!card) {
        console.log('Card not found:', cardName);
        return;
      }
      
      const imagesContainer = card.querySelector('.card-images');
      if (!imagesContainer) {
        console.log('Images container not found for card:', cardName);
        return;
      }
      
      // Clear previous images
      imagesContainer.innerHTML = '';
      
      // Try to load images from the card's folder
      const cardPath = `${basePath}${cardFolders[cardName]}/`;
      console.log('Loading images from:', cardPath);
      
      // Try common image names (1.jpg, 2.jpg, etc.)
      this.loadImagesFromFolder(cardPath, imagesContainer, 5);
    });
  }
  
  /**
   * Load images from a folder
   * @param {string} folderPath - Path to the folder
   * @param {HTMLElement} container - Container to append images to
   * @param {number} maxImages - Maximum number of images to try loading
   */
  loadImagesFromFolder(folderPath, container, maxImages = 5) {
    console.log('Trying to load images from:', folderPath);
    let loadedCount = 0;
    
    for (let i = 1; i <= maxImages; i++) {
      const img = document.createElement('img');
      const jpgPath = `${folderPath}${i}.jpg`;
      const pngPath = `${folderPath}${i}.png`;
      
      img.alt = `Portfolio image ${i}`;
      img.loading = 'lazy';
      
      // Try JPG first
      img.src = jpgPath;
      console.log('Attempting to load:', jpgPath);
      
      img.onload = function() {
        console.log('✓ Image loaded successfully:', this.src);
        loadedCount++;
      };
      
      img.onerror = function() {
        console.log('✗ JPG failed, trying PNG:', pngPath);
        // Try PNG
        this.src = pngPath;
        this.onerror = function() {
          console.log('✗ PNG also failed, removing element');
          this.remove();
        };
        this.onload = function() {
          console.log('✓ PNG loaded successfully:', this.src);
          loadedCount++;
        };
      };
      
      container.appendChild(img);
    }
    
    console.log('Appended', maxImages, 'image elements to container');
  }
  
  /**
   * Hide the detail view
   */
  hide() {
    if (!this.isOpen) return;
    
    // Hide detail view
    this.detailView.classList.remove('active');
    this.detailView.setAttribute('aria-hidden', 'true');
    
    // Set state
    this.isOpen = false;
    this.currentData = null;
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyPress);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.detailView.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.detailView.removeEventListener('wheel', this.handleWheel);
    
    // Stop animation
    this.stopAnimation();
    
    // Reset rotation, zoom, and position to face title card
    this.rotation = { x: 0, y: -308.57 };
    this.targetRotation = { x: 0, y: -308.57 };
    this.zoom = 1.3;
    this.targetZoom = 1.3;
    this.position = { x: 0, y: 0, z: 0 };
    this.targetPosition = { x: 0, y: 0, z: 0 };
    this.keys = { w: false, a: false, s: false, d: false };
    
    console.log('Detail view closed');
  }
  
  /**
   * Handle mouse down to start dragging
   */
  handleMouseDown(event) {
    // Allow dragging anywhere, including on cards
    // Only prevent drag on the back button
    if (event.target.closest('.back-button')) {
      return;
    }
    
    event.preventDefault();
    this.isDragging = true;
    this.lastMousePos = {
      x: event.clientX,
      y: event.clientY
    };
    this.detailView.style.cursor = 'grabbing';
  }
  
  /**
   * Handle mouse up to stop dragging
   */
  handleMouseUp(event) {
    this.isDragging = false;
    this.lastMousePos = null;
    this.detailView.style.cursor = 'grab';
  }
  
  /**
   * Handle mouse movement for drag rotation (first-person eye-look)
   */
  handleMouseMove(event) {
    if (!this.isDragging || !this.lastMousePos) {
      return;
    }
    
    // Calculate mouse delta
    const deltaX = event.clientX - this.lastMousePos.x;
    const deltaY = event.clientY - this.lastMousePos.y;
    
    // Update target rotation for first-person eye-look
    // Mouse movement directly controls where you're looking
    // Horizontal mouse movement rotates around Y axis (left/right look)
    this.targetRotation.y += deltaX * this.dragSensitivity;
    
    // Vertical mouse movement rotates around X axis (up/down look)
    // Invert deltaY so dragging down looks down (cards move up) and dragging up looks up (cards move down)
    this.targetRotation.x -= deltaY * this.dragSensitivity;
    
    // Clamp X rotation to prevent looking too far up or down
    this.targetRotation.x = Math.max(-89, Math.min(89, this.targetRotation.x));
    
    // Update last position
    this.lastMousePos = {
      x: event.clientX,
      y: event.clientY
    };
  }
  
  /**
   * Handle mouse wheel for zoom
   */
  handleWheel(event) {
    event.preventDefault();
    
    // Adjust zoom based on wheel delta
    const delta = event.deltaY * -0.001;
    this.targetZoom += delta;
    
    // Clamp zoom value
    this.targetZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.targetZoom));
  }
  
  /**
   * Start animation loop
   */
  startAnimation() {
    this.updateRotation();
  }
  
  /**
   * Stop animation loop
   */
  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Update rotation and position with smooth interpolation
   */
  updateRotation() {
    if (!this.isOpen) return;
    
    // Update movement based on WASD keys
    this.updateMovement();
    
    // Smooth interpolation for rotation
    this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.1;
    this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.1;
    this.zoom += (this.targetZoom - this.zoom) * 0.1;
    
    // Smooth interpolation for position
    this.position.x += (this.targetPosition.x - this.position.x) * 0.1;
    this.position.y += (this.targetPosition.y - this.position.y) * 0.1;
    this.position.z += (this.targetPosition.z - this.position.z) * 0.1;
    
    // Apply transforms to wall-grid for first-person eye-look view
    // First rotate the view (your eyes looking around), then move the world opposite to your position
    if (this.wallGrid) {
      this.wallGrid.style.transform = `
        scale(${this.zoom})
        rotateX(${-this.rotation.x}deg)
        rotateY(${-this.rotation.y}deg)
        translate3d(${-this.position.x}px, ${-this.position.y}px, ${-this.position.z}px)
      `;
    }
    
    // Continue animation
    this.animationFrameId = requestAnimationFrame(this.updateRotation);
  }
  
  /**
   * Handle keyboard events (ESC to close)
   * @param {KeyboardEvent} event
   */
  handleKeyPress(event) {
    if (event.key === 'Escape' && this.isOpen) {
      this.hide();
    }
  }
  
  /**
   * Handle key down for WASD movement
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    if (!this.isOpen) return;
    
    const key = event.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
      this.keys[key] = true;
      event.preventDefault();
    }
  }
  
  /**
   * Handle key up for WASD movement
   * @param {KeyboardEvent} event
   */
  handleKeyUp(event) {
    if (!this.isOpen) return;
    
    const key = event.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
      this.keys[key] = false;
      event.preventDefault();
    }
  }
  
  /**
   * Update camera position based on WASD keys
   */
  updateMovement() {
    // Calculate movement direction based on camera rotation
    // Movement is in the direction you're looking
    const angleY = (this.rotation.y * Math.PI) / 180;
    
    // Forward/backward (W/S)
    if (this.keys.w) {
      // Move forward in the direction we're looking
      this.targetPosition.x -= Math.sin(angleY) * this.moveSpeed;
      this.targetPosition.z -= Math.cos(angleY) * this.moveSpeed;
    }
    if (this.keys.s) {
      // Move backward (opposite of forward)
      this.targetPosition.x += Math.sin(angleY) * this.moveSpeed;
      this.targetPosition.z += Math.cos(angleY) * this.moveSpeed;
    }
    
    // Strafe left/right (A/D)
    if (this.keys.a) {
      // Strafe left (perpendicular to forward)
      this.targetPosition.x -= Math.cos(angleY) * this.moveSpeed;
      this.targetPosition.z += Math.sin(angleY) * this.moveSpeed;
    }
    if (this.keys.d) {
      // Strafe right (perpendicular to forward)
      this.targetPosition.x += Math.cos(angleY) * this.moveSpeed;
      this.targetPosition.z -= Math.sin(angleY) * this.moveSpeed;
    }
    
    // Apply boundary collision detection
    const distance = Math.sqrt(
      this.targetPosition.x * this.targetPosition.x +
      this.targetPosition.z * this.targetPosition.z
    );
    
    if (distance > this.boundaryRadius) {
      // Clamp position to boundary circle
      const angle = Math.atan2(this.targetPosition.z, this.targetPosition.x);
      this.targetPosition.x = Math.cos(angle) * this.boundaryRadius;
      this.targetPosition.z = Math.sin(angle) * this.boundaryRadius;
    }
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    this.backBtn.removeEventListener('click', this.hide);
    document.removeEventListener('keydown', this.handleKeyPress);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.detailView.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.detailView.removeEventListener('wheel', this.handleWheel);
    this.stopAnimation();
  }
}
