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
   * Load images from portfolio folder into cards
   * @param {Object} data - Portfolio item data
   */
  loadPortfolioImages(data) {
    const folder = data.folder || data.id;
    const basePath = `assets/portfolios/${folder}/`;
    
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
      if (!card) return;
      
      const imagesContainer = card.querySelector('.card-images');
      if (!imagesContainer) return;
      
      // Clear previous images
      imagesContainer.innerHTML = '';
      
      // Try to load images from the card's folder
      const cardPath = `${basePath}${cardFolders[cardName]}/`;
      
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
    let loadedCount = 0;
    
    for (let i = 1; i <= maxImages; i++) {
      const img = document.createElement('img');
      img.src = `${folderPath}${i}.jpg`;
      img.alt = `Portfolio image ${i}`;
      img.loading = 'lazy';
      img.style.display = 'none';
      
      img.onload = () => {
        img.style.display = 'block';
        loadedCount++;
      };
      
      img.onerror = () => {
        // Try .png extension
        img.src = `${folderPath}${i}.png`;
        img.onerror = () => {
          // Remove if neither jpg nor png exists
          img.remove();
        };
      };
      
      container.appendChild(img);
    }
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
