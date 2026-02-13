/**
 * Portfolio Data Configuration
 * Defines the structure and content for portfolio items displayed as bubbles
 * 
 * Each portfolio item can have a dedicated folder in assets/portfolios/{id}/
 * Images in that folder will be automatically loaded into the detail view cards
 */

// Debug: Log that config.js is loading
console.log('config.js is loading...');

/**
 * Portfolio data array
 * Each item represents a project/work to be displayed as a bubble in the 3D museum
 * 
 * Structure:
 * - id: Unique identifier (also used as folder name in assets/portfolios/)
 * - title: Display name
 * - description: Brief description
 * - image: Main bubble image (in assets/images/)
 * - color: Bubble color
 * - folder: Optional custom folder name (defaults to id)
 */
const portfolioData = [
  {
    id: 1,
    title: "CupofJay",
    description: "CupofJay - A creative portfolio showcasing innovative designs and artistic expressions.",
    image: "assets/images/cupofjay.jpg",
    color: "#0000FF",
    folder: "cupofjay" // Folder: assets/portfolios/cupofjay/
  },
  {
    id: 2,
    title: "Kylabidaboo",
    description: "Kylabidaboo - Unique and vibrant creative works that push the boundaries of imagination.",
    image: "assets/images/kylabidaboo.jpg",
    color: "#E24A90",
    folder: "kylabidaboo"
  },
  {
    id: 3,
    title: "Jnnzth",
    description: "Jnnzth - Innovative solutions and creative approaches to modern challenges.",
    image: "assets/images/jnnzth.jpg",
    color: "#90E24A",
    folder: "jnnzth"
  },
  {
    id: 4,
    title: "Bonchan",
    description: "Bonchan - Artistic excellence and creative mastery in every project.",
    image: "assets/images/bonchan.jpg",
    color: "#FF4500",
    folder: "bonchan"
  },
  {
    id: 5,
    title: "Beyl",
    description: "Beyl - Cutting-edge designs that blend functionality with aesthetic appeal.",
    image: "assets/images/beyl.jpg",
    color: "#FFD700",
    folder: "beyl"
  },
  {
    id: 6,
    title: "Juan.through.tree",
    description: "Juan.through.tree - Nature-inspired creativity and organic design philosophy.",
    image: "assets/images/juan.jpg",
    color: "#8B4513",
    folder: "juan"
  },
  {
    id: 7,
    title: "Shine",
    description: "Shine - Brilliant concepts that illuminate the path to creative excellence.",
    image: "assets/images/shine.jpg",
    color: "#FFFFFF",
    folder: "shine"
  },
  {
    id: 8,
    title: "Mfghozt",
    description: "Mfghozt - Mysterious and captivating designs that leave a lasting impression.",
    image: "assets/images/mfghozt.jpg",
    color: "#000000",
    folder: "mfghozt"
  },
  {
    id: 9,
    title: "Cian",
    description: "Cian - Bold and dynamic creative solutions for the modern world.",
    image: "assets/images/cian.jpg",
    color: "#FF8C00",
    folder: "cian"
  },
  {
    id: 10,
    title: "Well Known Renjard",
    description: "Well Known Renjard - Renowned for exceptional quality and innovative thinking.",
    image: "assets/images/renjard.jpg",
    color: "#9400D3",
    folder: "renjard"
  },
  {
    id: 11,
    title: "Pibee",
    description: "Pibee - Sweet and delightful designs that bring joy to every project.",
    image: "assets/images/pibee.jpg",
    color: "#00CED1",
    folder: "pibee"
  },
  {
    id: 12,
    title: "Jem",
    description: "Jem - Precious and refined creative works that sparkle with originality.",
    image: "assets/images/jem.jpg",
    color: "#4B0082",
    folder: "jem"
  },
  {
    id: 13,
    title: "KCCalip",
    description: "KCCalip - Professional excellence and creative innovation in every detail.",
    image: "assets/images/kccalip.jpg",
    color: "#32CD32",
    folder: "kccalip"
  },
  {
    id: 14,
    title: "Alyssa",
    description: "Alyssa - Elegant and sophisticated designs that embody timeless beauty.",
    image: "assets/images/alyssa.jpg",
    color: "#FF6347",
    folder: "alyssa"
  }
];

/**
 * Validates a portfolio item to ensure it has all required fields
 * @param {Object} item - Portfolio item to validate
 * @returns {Object} Validation result with isValid flag and error messages
 */
function validatePortfolioItem(item) {
  const errors = [];
  
  // Check required fields
  if (!item.id || typeof item.id !== 'number') {
    errors.push('Portfolio item must have a valid numeric id');
  }
  
  if (!item.title || typeof item.title !== 'string' || item.title.trim() === '') {
    errors.push('Portfolio item must have a non-empty title string');
  }
  
  if (!item.description || typeof item.description !== 'string' || item.description.trim() === '') {
    errors.push('Portfolio item must have a non-empty description string');
  }
  
  // Check optional fields if present
  if (item.image !== undefined && typeof item.image !== 'string') {
    errors.push('Portfolio item image must be a string if provided');
  }
  
  if (item.color !== undefined) {
    if (typeof item.color !== 'string') {
      errors.push('Portfolio item color must be a string if provided');
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(item.color)) {
      errors.push('Portfolio item color must be a valid hex color code (e.g., #4A90E2)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates an array of portfolio items
 * @param {Array} data - Array of portfolio items to validate
 * @returns {Object} Validation result with isValid flag, error messages, and valid items
 */
function validatePortfolioData(data) {
  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Portfolio data must be an array'],
      validItems: []
    };
  }
  
  if (data.length === 0) {
    return {
      isValid: false,
      errors: ['Portfolio data array cannot be empty'],
      validItems: []
    };
  }
  
  const allErrors = [];
  const validItems = [];
  const seenIds = new Set();
  
  data.forEach((item, index) => {
    const validation = validatePortfolioItem(item);
    
    if (!validation.isValid) {
      allErrors.push(`Item ${index}: ${validation.errors.join(', ')}`);
    } else {
      // Check for duplicate IDs
      if (seenIds.has(item.id)) {
        allErrors.push(`Item ${index}: Duplicate id ${item.id} found`);
      } else {
        seenIds.add(item.id);
        validItems.push(item);
      }
    }
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    validItems: validItems
  };
}

// Validate the portfolio data on load
const dataValidation = validatePortfolioData(portfolioData);
if (!dataValidation.isValid) {
  console.error('Portfolio data validation failed:', dataValidation.errors);
} else {
  console.log('Portfolio data loaded successfully:', portfolioData.length, 'items');
}

// Make sure portfolioData is available globally
window.portfolioData = portfolioData;
window.validatePortfolioItem = validatePortfolioItem;
window.validatePortfolioData = validatePortfolioData;

// Export for use in other modules (Node.js compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    portfolioData,
    validatePortfolioItem,
    validatePortfolioData
  };
}
