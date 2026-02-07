/**
 * InteractionHandler Class
 * Manages user interactions with bubbles including clicks, hover effects, and selection
 */
class InteractionHandler {
  constructor(bubbleManager, contentPanel) {
    // References to other components
    this.bubbleManager = bubbleManager;
    this.contentPanel = contentPanel;
    
    // Track interaction state
    this.hoveredBubble = null;
    this.selectedBubble = null;
    
    // Get container reference
    this.container = bubbleManager.container;
    
    // Throttling for hover events
    this.lastHoverCheck = 0;
    this.HOVER_THROTTLE = 16; // 16ms for 60fps
    
    // Bind methods to maintain context
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    
    // Initialize event listeners
    this.init();
  }
  
  /**
   * Initialize event listeners
   */
  init() {
    // Add click event listener to museum-space container
    this.container.addEventListener('click', this.handleClick);
    
    // Add mousemove event listener for hover effects
    this.container.addEventListener('mousemove', this.handleMouseMove);
    
    // Add keyboard event listener for accessibility
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  /**
   * Handle click events on bubbles
   * @param {MouseEvent} event
   */
  handleClick(event) {
    // Get click coordinates
    const x = event.clientX;
    const y = event.clientY;
    
    // Use BubbleManager.getBubbleAt() to detect clicked bubble
    const clickedBubble = this.bubbleManager.getBubbleAt(x, y);
    
    // Call selectBubble() method if bubble is found
    if (clickedBubble) {
      this.selectBubble(clickedBubble);
    }
  }
  
  /**
   * Handle mouse move events for hover effects
   * Throttled to 16ms for 60fps performance
   * @param {MouseEvent} event
   */
  handleMouseMove(event) {
    const now = performance.now();
    
    // Throttle hover checks to 60fps
    if (now - this.lastHoverCheck < this.HOVER_THROTTLE) {
      return;
    }
    
    this.lastHoverCheck = now;
    
    // Get mouse coordinates
    const x = event.clientX;
    const y = event.clientY;
    
    // Detect bubble under cursor using getBubbleAt()
    const hoveredBubble = this.bubbleManager.getBubbleAt(x, y);
    
    // Check if hover state changed
    if (hoveredBubble !== this.hoveredBubble) {
      // Remove hover class from previously hovered bubble
      if (this.hoveredBubble) {
        this.hoveredBubble.classList.remove('hovered');
      }
      
      // Apply hover CSS class to hovered bubble
      if (hoveredBubble) {
        hoveredBubble.classList.add('hovered');
        // Update cursor style to pointer when over bubble
        this.container.style.cursor = 'pointer';
      } else {
        // Reset cursor when not over bubble
        this.container.style.cursor = 'default';
      }
      
      // Update hoveredBubble reference
      this.hoveredBubble = hoveredBubble;
    }
  }
  
  /**
   * Handle keyboard events for accessibility
   * Tab to focus bubbles, Enter/Space to select
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    const target = event.target;
    
    // Check if the target is a bubble
    if (target.classList.contains('bubble')) {
      // Enter or Space key to select bubble
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); // Prevent page scroll on Space
        this.selectBubble(target);
      }
    }
  }
  
  /**
   * Select a bubble and show its content
   * @param {HTMLElement} bubble - The bubble element to select
   */
  selectBubble(bubble) {
    if (!bubble) return;
    
    // Remove selected class from previously selected bubble
    if (this.selectedBubble && this.selectedBubble !== bubble) {
      this.selectedBubble.classList.remove('selected');
      this.selectedBubble.setAttribute('aria-pressed', 'false');
    }
    
    // Add selected CSS class to bubble for visual emphasis
    bubble.classList.add('selected');
    bubble.setAttribute('aria-pressed', 'true');
    
    // Retrieve portfolio data associated with bubble
    const bubbleIndex = parseInt(bubble.getAttribute('data-index'));
    
    // Find the portfolio data from BubbleManager
    const bubbleState = this.bubbleManager.bubbles[bubbleIndex];
    const portfolioData = bubbleState ? bubbleState.data : null;
    
    // Call ContentPanel.show() with portfolio data
    if (portfolioData) {
      this.contentPanel.show(portfolioData);
    }
    
    // Update selectedBubble reference
    this.selectedBubble = bubble;
  }
  
  /**
   * Deselect the currently selected bubble
   */
  deselectBubble() {
    // Remove selected CSS class from current bubble
    if (this.selectedBubble) {
      this.selectedBubble.classList.remove('selected');
      this.selectedBubble.setAttribute('aria-pressed', 'false');
    }
    
    // Call ContentPanel.hide()
    this.contentPanel.hide();
    
    // Clear selectedBubble reference
    this.selectedBubble = null;
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    this.container.removeEventListener('click', this.handleClick);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    
    // Reset cursor
    this.container.style.cursor = 'default';
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractionHandler;
}
