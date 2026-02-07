/**
 * Utility functions for feature detection and fallbacks
 */

/**
 * Detect CSS 3D transform support
 * @returns {Boolean} True if 3D transforms are supported
 */
function supports3D() {
  const el = document.createElement('div');
  const transforms = [
    'transform',
    'WebkitTransform',
    'MozTransform',
    'msTransform',
    'OTransform'
  ];
  
  // Check if any transform property exists
  const hasTransform = transforms.some(prop => el.style[prop] !== undefined);
  
  if (!hasTransform) {
    return false;
  }
  
  // Test for 3D transform support specifically
  const has3D = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix() ||
                'MozPerspective' in document.documentElement.style ||
                'msPerspective' in document.documentElement.style ||
                'perspective' in document.documentElement.style;
  
  return has3D;
}

/**
 * Detect device capabilities and screen size
 * @returns {Object} Device information
 */
function detectDeviceCapabilities() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Detect mobile device
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  // Detect touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Estimate GPU capability (rough heuristic)
  const pixelRatio = window.devicePixelRatio || 1;
  const totalPixels = width * height * pixelRatio;
  const isLowEnd = totalPixels < 1000000 || (isMobile && pixelRatio < 2);
  
  // Detect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    isLowEnd,
    pixelRatio,
    prefersReducedMotion
  };
}

/**
 * Get optimal bubble count based on device capabilities
 * @param {Number} totalItems - Total number of portfolio items
 * @param {Object} deviceInfo - Device capability information
 * @returns {Number} Optimal bubble count
 */
function getOptimalBubbleCount(totalItems, deviceInfo) {
  if (deviceInfo.isMobile) {
    // Limit to 10 bubbles on mobile
    return Math.min(totalItems, 10);
  } else if (deviceInfo.isTablet) {
    // Limit to 15 bubbles on tablet
    return Math.min(totalItems, 15);
  } else if (deviceInfo.isLowEnd) {
    // Limit to 20 bubbles on low-end devices
    return Math.min(totalItems, 20);
  }
  
  // No limit on desktop with good GPU
  return totalItems;
}

/**
 * Get bubble size scale based on viewport
 * @param {Number} viewportWidth - Current viewport width
 * @returns {Number} Scale factor for bubble sizes
 */
function getBubbleSizeScale(viewportWidth) {
  if (viewportWidth < 480) {
    return 0.7; // 70% size on small mobile
  } else if (viewportWidth < 768) {
    return 0.85; // 85% size on mobile
  } else if (viewportWidth < 1024) {
    return 0.95; // 95% size on tablet
  }
  
  return 1.0; // Full size on desktop
}

/**
 * Apply performance optimizations based on device
 * @param {HTMLElement} container - Museum space container
 * @param {Object} deviceInfo - Device capability information
 */
function applyPerformanceOptimizations(container, deviceInfo) {
  // Add device-specific classes
  if (deviceInfo.isMobile) {
    container.classList.add('device-mobile');
  } else if (deviceInfo.isTablet) {
    container.classList.add('device-tablet');
  } else {
    container.classList.add('device-desktop');
  }
  
  // Add low-end device class for simplified visuals
  if (deviceInfo.isLowEnd) {
    container.classList.add('device-low-end');
  }
  
  // Add reduced motion class
  if (deviceInfo.prefersReducedMotion) {
    container.classList.add('reduced-motion');
  }
  
  // Set CSS custom property for bubble scale
  const scale = getBubbleSizeScale(deviceInfo.width);
  container.style.setProperty('--bubble-scale', scale);
}

/**
 * Create 2D grid fallback layout for unsupported browsers
 * @param {HTMLElement} container - The museum space container
 * @param {Array} portfolioData - Portfolio items data
 * @param {Function} onItemClick - Callback for item clicks
 */
function create2DFallback(container, portfolioData, onItemClick) {
  // Clear container
  container.innerHTML = '';
  
  // Add fallback class for styling
  container.classList.add('fallback-2d');
  
  // Create grid container
  const grid = document.createElement('div');
  grid.className = 'fallback-grid';
  
  // Create grid items
  portfolioData.forEach((item, index) => {
    const gridItem = document.createElement('div');
    gridItem.className = 'fallback-item';
    gridItem.setAttribute('data-id', item.id);
    gridItem.setAttribute('data-index', index);
    
    // Create item content
    const itemContent = document.createElement('div');
    itemContent.className = 'fallback-item-content';
    
    // Add title
    const title = document.createElement('h3');
    title.className = 'fallback-item-title';
    title.textContent = item.title;
    
    // Add description preview (first 100 chars)
    const description = document.createElement('p');
    description.className = 'fallback-item-description';
    const descText = item.description || '';
    description.textContent = descText.length > 100 
      ? descText.substring(0, 100) + '...' 
      : descText;
    
    // Assemble item
    itemContent.appendChild(title);
    itemContent.appendChild(description);
    gridItem.appendChild(itemContent);
    
    // Set background color
    const color = item.color || generateRandomColor();
    gridItem.style.backgroundColor = color;
    
    // Add click handler
    gridItem.addEventListener('click', () => {
      if (onItemClick) {
        onItemClick(item);
      }
    });
    
    grid.appendChild(gridItem);
  });
  
  container.appendChild(grid);
  
  // Add message about browser support
  const message = document.createElement('div');
  message.className = 'fallback-message';
  message.innerHTML = 
    '<p>Your browser does not support 3D transforms. Displaying simplified 2D layout.</p>' +
    '<p>For the full 3D experience, please use a modern browser like Chrome, Firefox, Safari, or Edge.</p>';
  container.insertBefore(message, grid);
}

/**
 * Generate a random vibrant color
 * @returns {String} HSL color string
 */
function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 20);
  const lightness = 50 + Math.floor(Math.random() * 20);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    supports3D,
    detectDeviceCapabilities,
    getOptimalBubbleCount,
    getBubbleSizeScale,
    applyPerformanceOptimizations,
    create2DFallback,
    generateRandomColor
  };
}
