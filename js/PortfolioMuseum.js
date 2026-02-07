/**
 * PortfolioMuseum - Main controller class
 * Coordinates all subsystems and manages the animation loop
 */
class PortfolioMuseum {
  /**
   * Constructor
   * @param {Object} config - Configuration object
   * @param {String|HTMLElement} config.container - CSS selector or HTMLElement for the museum container
   * @param {Array} config.data - Portfolio data array
   */
  constructor(config) {
    // Validate configuration
    if (!config) {
      throw new Error('PortfolioMuseum requires a configuration object');
    }
    
    if (!config.container) {
      throw new Error('PortfolioMuseum requires a container in config');
    }
    
    if (!config.data) {
      throw new Error('PortfolioMuseum requires portfolio data in config');
    }
    
    // Get container element (support both selector string and HTMLElement)
    if (typeof config.container === 'string') {
      this.container = document.querySelector(config.container);
      if (!this.container) {
        throw new Error(`Container not found: ${config.container}`);
      }
    } else if (config.container instanceof HTMLElement) {
      this.container = config.container;
    } else {
      throw new Error('Container must be a CSS selector string or HTMLElement');
    }
    
    // Validate portfolio data
    if (!Array.isArray(config.data) || config.data.length === 0) {
      throw new Error('Portfolio data must be a non-empty array');
    }
    
    // Detect device capabilities
    this.deviceInfo = typeof detectDeviceCapabilities === 'function' 
      ? detectDeviceCapabilities() 
      : { isMobile: false, isTablet: false, isDesktop: true, isLowEnd: false };
    
    // Apply performance optimizations
    if (typeof applyPerformanceOptimizations === 'function') {
      applyPerformanceOptimizations(this.container, this.deviceInfo);
    }
    
    // Optimize portfolio data for device
    const optimalCount = typeof getOptimalBubbleCount === 'function'
      ? getOptimalBubbleCount(config.data.length, this.deviceInfo)
      : config.data.length;
    
    // Store portfolio data (limit to optimal count)
    this.portfolioData = config.data.slice(0, optimalCount);
    
    // Component instances (initialized in init())
    this.bubbleManager = null;
    this.cameraController = null;
    this.contentPanel = null;
    this.interactionHandler = null;
    
    // Animation loop variables
    this.lastFrame = 0;
    this.animationFrameId = null;
    this.isRunning = false;
    
    // Responsive handling
    this.resizeTimeout = null;
    this.handleResize = this.handleResize.bind(this);
    
    // Bind animate method to maintain context
    this.animate = this.animate.bind(this);
  }

  /**
   * Initialize the Portfolio Museum
   * Sets up all components and starts the animation loop
   */
  init() {
    // Instantiate BubbleManager with container and data
    this.bubbleManager = new BubbleManager(this.container, this.portfolioData);
    
    // Call BubbleManager.createBubbles() to generate initial bubbles
    this.bubbleManager.createBubbles();
    
    // Instantiate CameraController with container
    this.cameraController = new CameraController(this.container);
    
    // Instantiate ContentPanel
    this.contentPanel = new ContentPanel();
    
    // Instantiate InteractionHandler with BubbleManager and ContentPanel
    this.interactionHandler = new InteractionHandler(this.bubbleManager, this.contentPanel);
    
    // Set up resize handler for responsive updates
    window.addEventListener('resize', this.handleResize);
    
    // Set running flag
    this.isRunning = true;
    
    // Start animation loop by calling animate()
    this.animate(0);
  }

  /**
   * Handle window resize with debouncing
   * Updates device info and applies optimizations
   */
  handleResize() {
    // Debounce resize events to 250ms
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      // Update device info
      if (typeof detectDeviceCapabilities === 'function') {
        this.deviceInfo = detectDeviceCapabilities();
        
        // Reapply performance optimizations
        if (typeof applyPerformanceOptimizations === 'function') {
          applyPerformanceOptimizations(this.container, this.deviceInfo);
        }
      }
    }, 250);
  }

  /**
   * Main animation loop using requestAnimationFrame
   * Throttles updates to 60fps (16.67ms minimum)
   * @param {Number} timestamp - Current timestamp from requestAnimationFrame
   */
  animate(timestamp) {
    // Check if animation should continue
    if (!this.isRunning) {
      return;
    }
    
    // Check timestamp delta to throttle to 60fps (16.67ms minimum)
    const deltaTime = timestamp - this.lastFrame;
    if (deltaTime < 16.67) {
      // Schedule next frame without updating
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }
    
    // Call CameraController.update() to get current camera state
    const cameraState = this.cameraController.update();
    
    // Pass camera state to BubbleManager.updateBubbles()
    this.bubbleManager.updateBubbles(cameraState);
    
    // Store current timestamp for next frame calculation
    this.lastFrame = timestamp;
    
    // Schedule next frame with requestAnimationFrame
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  /**
   * Destroy the Portfolio Museum and clean up resources
   * Removes event listeners, stops animation, and clears DOM elements
   */
  destroy() {
    // Stop animation loop
    this.isRunning = false;
    
    // Clear animation loop (cancel requestAnimationFrame)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Remove resize handler
    window.removeEventListener('resize', this.handleResize);
    
    // Clear resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    
    // Remove all event listeners from components
    if (this.cameraController) {
      this.cameraController.destroy();
    }
    
    if (this.interactionHandler) {
      this.interactionHandler.destroy();
    }
    
    if (this.contentPanel) {
      this.contentPanel.destroy();
    }
    
    // Remove bubble elements from DOM
    if (this.bubbleManager && this.bubbleManager.bubbles) {
      this.bubbleManager.bubbles.forEach(bubble => {
        if (bubble.element && bubble.element.parentNode) {
          bubble.element.parentNode.removeChild(bubble.element);
        }
      });
    }
    
    // Reset component references
    this.bubbleManager = null;
    this.cameraController = null;
    this.contentPanel = null;
    this.interactionHandler = null;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortfolioMuseum;
}
