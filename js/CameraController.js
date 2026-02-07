/**
 * CameraController - Manages user navigation and viewpoint within the 3D space
 * Handles mouse movement, wheel zoom, and touch gestures
 */
class CameraController {
  constructor(container) {
    this.container = container;
    
    // Current camera state - start with slight right rotation for optimal title visibility
    this.rotation = { x: 0, y: 40 };
    this.zoom = 0.7;
    
    // Target values for smooth interpolation
    this.targetRotation = { x: 0, y: 40 };
    this.targetZoom = 0.7;
    
    // Constants for rotation limits (in degrees)
    this.ROTATION_LIMIT = 360; // Allow full rotation
    
    // Zoom range constants
    this.MIN_ZOOM = 0.5;
    this.MAX_ZOOM = 2.0;
    
    // Easing factor for smooth interpolation
    this.EASING_FACTOR = 0.1;
    
    // Mouse drag tracking
    this.isDragging = false;
    this.lastMousePos = null;
    this.dragStartPos = null;
    this.hasMoved = false;
    this.clickedOnBubble = false;
    this.dragSensitivity = 0.3;
    
    // Touch tracking
    this.touchStartPos = null;
    this.lastTouchPos = null;
    this.initialPinchDistance = null;
    this.initialPinchZoom = null;
    
    // Bind event handlers
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  /**
   * Initialize all event listeners
   */
  initEventListeners() {
    console.log('Initializing event listeners on:', this.container);
    console.log('Container dimensions:', this.container.offsetWidth, 'x', this.container.offsetHeight);
    
    // Mouse drag events
    this.container.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    
    // Mouse wheel for zoom
    this.container.addEventListener('wheel', this.handleWheel, { passive: false });
    
    // Touch events with passive option for performance
    this.container.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    
    console.log('Event listeners initialized');
  }
  
  /**
   * Handle mouse down to start dragging
   */
  handleMouseDown(event) {
    // Prevent text selection while dragging
    event.preventDefault();
    
    // Debug: log what was clicked
    console.log('Clicked element:', event.target);
    console.log('Clicked element class:', event.target.className);
    console.log('Is bubble?', event.target.closest('.bubble'));
    
    // Allow dragging anywhere, but track if we clicked on a bubble
    this.clickedOnBubble = event.target.closest('.bubble') !== null;
    
    this.isDragging = true;
    this.dragStartPos = {
      x: event.clientX,
      y: event.clientY
    };
    this.lastMousePos = {
      x: event.clientX,
      y: event.clientY
    };
    this.hasMoved = false;
    
    this.container.style.cursor = 'grabbing';
  }
  
  /**
   * Handle mouse up to stop dragging
   */
  handleMouseUp(event) {
    // If we clicked on a bubble and didn't move much, let the bubble click through
    if (this.clickedOnBubble && !this.hasMoved) {
      // Allow bubble interaction
    }
    
    this.isDragging = false;
    this.lastMousePos = null;
    this.dragStartPos = null;
    this.hasMoved = false;
    this.clickedOnBubble = false;
    this.container.style.cursor = 'grab';
  }
  
  /**
   * Handle mouse movement for drag rotation
   */
  handleMouseMove(event) {
    if (!this.isDragging || !this.lastMousePos) {
      return;
    }
    
    // Calculate mouse delta
    const deltaX = event.clientX - this.lastMousePos.x;
    const deltaY = event.clientY - this.lastMousePos.y;
    
    // Check if mouse has moved significantly (more than 5 pixels)
    const totalDeltaX = event.clientX - this.dragStartPos.x;
    const totalDeltaY = event.clientY - this.dragStartPos.y;
    const distance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
    
    if (distance > 5) {
      this.hasMoved = true;
    }
    
    // Update target rotation based on drag delta
    // Y-axis (left/right): reversed for natural feel
    // X-axis (up/down): normal direction
    this.targetRotation.y -= deltaX * this.dragSensitivity;
    this.targetRotation.x -= deltaY * this.dragSensitivity;
    
    // Update last position
    this.lastMousePos = {
      x: event.clientX,
      y: event.clientY
    };
  }
  
  /**
   * Handle mouse wheel for zoom
   * Adjusts zoom level and clamps between MIN_ZOOM and MAX_ZOOM
   */
  handleWheel(event) {
    // Prevent default scroll behavior
    event.preventDefault();
    
    // Adjust zoom based on wheel delta
    const delta = event.deltaY * -0.001;
    this.targetZoom += delta;
    
    // Clamp zoom value
    this.targetZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.targetZoom));
  }
  
  /**
   * Handle touch start event
   * Initialize touch tracking for drag and pinch gestures
   */
  handleTouchStart(event) {
    if (event.touches.length === 1) {
      // Single finger - track for rotation
      this.touchStartPos = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      this.lastTouchPos = { ...this.touchStartPos };
    } else if (event.touches.length === 2) {
      // Two fingers - track for pinch zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      this.initialPinchDistance = this.getTouchDistance(touch1, touch2);
      this.initialPinchZoom = this.targetZoom;
    }
  }
  
  /**
   * Handle touch move event
   * Process single-finger drag for rotation and pinch for zoom
   */
  handleTouchMove(event) {
    event.preventDefault();
    
    if (event.touches.length === 1 && this.lastTouchPos) {
      // Single finger drag - calculate delta for rotation
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.lastTouchPos.x;
      const deltaY = touch.clientY - this.lastTouchPos.y;
      
      // Update target rotation based on drag delta
      // Scale factor to make rotation feel natural
      const sensitivity = 0.2;
      this.targetRotation.y += deltaX * sensitivity;
      this.targetRotation.x -= deltaY * sensitivity;
      
      // Clamp rotation to limits
      this.targetRotation.x = Math.max(-this.ROTATION_LIMIT, Math.min(this.ROTATION_LIMIT, this.targetRotation.x));
      this.targetRotation.y = Math.max(-this.ROTATION_LIMIT, Math.min(this.ROTATION_LIMIT, this.targetRotation.y));
      
      // Update last position
      this.lastTouchPos = {
        x: touch.clientX,
        y: touch.clientY
      };
    } else if (event.touches.length === 2 && this.initialPinchDistance !== null) {
      // Pinch gesture - calculate zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const currentDistance = this.getTouchDistance(touch1, touch2);
      const scale = currentDistance / this.initialPinchDistance;
      
      this.targetZoom = this.initialPinchZoom * scale;
      
      // Clamp zoom value
      this.targetZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.targetZoom));
    }
  }
  
  /**
   * Handle touch end event
   * Reset touch tracking
   */
  handleTouchEnd(event) {
    if (event.touches.length === 0) {
      // All touches ended
      this.touchStartPos = null;
      this.lastTouchPos = null;
      this.initialPinchDistance = null;
      this.initialPinchZoom = null;
    } else if (event.touches.length === 1) {
      // One finger remaining - reset for single touch
      this.lastTouchPos = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      this.initialPinchDistance = null;
      this.initialPinchZoom = null;
    }
  }
  
  /**
   * Calculate distance between two touch points
   */
  getTouchDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Update camera state with smooth interpolation
   * Uses linear interpolation (lerp) to smoothly transition to target values
   * Returns current camera state object
   */
  update() {
    // Smooth interpolation using lerp
    this.rotation.x += (this.targetRotation.x - this.rotation.x) * this.EASING_FACTOR;
    this.rotation.y += (this.targetRotation.y - this.rotation.y) * this.EASING_FACTOR;
    this.zoom += (this.targetZoom - this.zoom) * this.EASING_FACTOR;
    
    // Clamp zoom to limits
    this.zoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom));
    
    // Return current camera state
    return {
      rotation: {
        x: this.rotation.x,
        y: this.rotation.y
      },
      zoom: this.zoom
    };
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    this.container.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.container.removeEventListener('wheel', this.handleWheel);
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    this.container.removeEventListener('touchend', this.handleTouchEnd);
  }
}
