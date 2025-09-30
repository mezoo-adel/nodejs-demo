class Validator {
  constructor() {
    this.errors = {};
    this.rules = {};
    this.messages = {};
  }

  /**
   * Validate data against rules
   * @param {Object} data - Data to validate
   * @param {Object} rules - Validation rules
   * @param {Object} messages - Custom error messages
   * @returns {Promise<Object>} - Validation result
   */
  async validate(data, rules, messages = {}) {
    this.errors = {};
    this.rules = rules;
    this.messages = messages;

    for (const field in rules) {
      const fieldRules = rules[field].split('|');
      const value = data[field];

      for (const rule of fieldRules) {
        await this.validateRule(field, value, rule, data);
      }
    }

    return {
      isValid: Object.keys(this.errors).length === 0,
      errors: this.errors
    };
  }

  /**
   * Validate a single rule for a field
   */
  async validateRule(field, value, rule, allData) {
    const [ruleName, ruleValue] = rule.split(':');

    switch (ruleName) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          this.addError(field, this.getMessage(field, 'required', 'The {field} field is required.'));
        }
        break;

      case 'min':
        if (value && value.length < parseInt(ruleValue)) {
          this.addError(field, this.getMessage(field, 'min', `The {field} must be at least ${ruleValue} characters.`));
        }
        break;

      case 'max':
        if (value && value.length > parseInt(ruleValue)) {
          this.addError(field, this.getMessage(field, 'max', `The {field} may not be greater than ${ruleValue} characters.`));
        }
        break;

      case 'email':
        if (value && !/^\S+@\S+\.\S+$/.test(value)) {
          this.addError(field, this.getMessage(field, 'email', 'The {field} must be a valid email address.'));
        }
        break;

      case 'unique':
        // This will be handled by custom validation in requests
        break;

      case 'confirmed':
        const confirmField = `${field}_confirmation`;
        if (value && allData[confirmField] !== value) {
          this.addError(field, this.getMessage(field, 'confirmed', 'The {field} confirmation does not match.'));
        }
        break;

      case 'string':
        if (value && typeof value !== 'string') {
          this.addError(field, this.getMessage(field, 'string', 'The {field} must be a string.'));
        }
        break;

      case 'numeric':
        if (value && isNaN(value)) {
          this.addError(field, this.getMessage(field, 'numeric', 'The {field} must be a number.'));
        }
        break;

      case 'integer':
        if (value && (!Number.isInteger(Number(value)))) {
          this.addError(field, this.getMessage(field, 'integer', 'The {field} must be an integer.'));
        }
        break;

      case 'boolean':
        if (value !== undefined && typeof value !== 'boolean' && !['true', 'false', '1', '0'].includes(String(value))) {
          this.addError(field, this.getMessage(field, 'boolean', 'The {field} field must be true or false.'));
        }
        break;

      case 'in':
        const allowedValues = ruleValue.split(',');
        if (value && !allowedValues.includes(String(value))) {
          this.addError(field, this.getMessage(field, 'in', `The selected {field} is invalid. Must be one of: ${allowedValues.join(', ')}.`));
        }
        break;

      default:
        // Custom validation rules can be added here
        break;
    }
  }

  /**
   * Add an error for a field
   */
  addError(field, message) {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
  }

  /**
   * Get custom message or default message
   */
  getMessage(field, rule, defaultMessage) {
    const customKey = `${field}.${rule}`;
    const fieldKey = field;
    
    if (this.messages[customKey]) {
      return this.messages[customKey].replace('{field}', field);
    }
    
    if (this.messages[fieldKey]) {
      return this.messages[fieldKey].replace('{field}', field);
    }
    
    return defaultMessage.replace('{field}', field);
  }

  /**
   * Create a validation middleware
   */
  static middleware(rules, messages = {}) {
    return async (req, res, next) => {
      const validator = new Validator();
      const result = await validator.validate(req.body, rules, messages);
      
      if (!result.isValid) {
        return res.status(422).json({
          message: 'The given data was invalid.',
          errors: result.errors
        });
      }
      
      next();
    };
  }
}

module.exports = Validator;
