const fs = require('fs');
const path = require('path');

/**
 * Get full path by joining segments
 * @param {...string} segments - Path segments to join
 * @returns {string} - Full absolute path
 */
const fullPath = (...segments) => {
  return path.join(process.cwd(), ...segments);
};

/**
 * Append content to a file
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to append
 */
const append = (filePath, content) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.appendFileSync(filePath, content, 'utf8');
  } catch (error) {
    console.error('Error appending to file:', error);
  }
};

/**
 * Read file content
 * @param {string} filePath - Path to the file
 * @returns {string} - File content
 */
const read = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading file:', error);
    return '';
  }
};

/**
 * Write content to a file
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 */
const write = (filePath, content) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    console.error('Error writing to file:', error);
  }
};

module.exports = {
  fullPath,
  append,
  read,
  write
};
