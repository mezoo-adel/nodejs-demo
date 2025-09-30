const Validator = require('@/utils/Validator');

class FormRequest {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.validator = new Validator();
  }

  /**
   * Get the validation rules that apply to the request.
   * This method should be overridden in child classes.
   * @returns {Object}
   */
  rules() {
    return {};
  }

  /**
   * Get custom error messages for validator errors.
   * This method can be overridden in child classes.
   * @returns {Object}
   */
  messages() {
    return {};
  }

  /**
   * Perform custom validation logic.
   * This method can be overridden in child classes.
   * @param {Object} data - The data being validated
   * @returns {Promise<Object>} - Should return { isValid: boolean, errors: Object }
   */
  async customValidation(data) {
    return { isValid: true, errors: {} };
  }

  /**
   * Validate the request
   * @returns {Promise<Object>}
   */
  async validate() {
    const rules = this.rules();
    const messages = this.messages();
    const data = this.req.body;

    // Run standard validation
    const result = await this.validator.validate(data, rules, messages);

    // Run custom validation
    const customResult = await this.customValidation(data);

    // Merge errors
    const allErrors = { ...result.errors, ...customResult.errors };
    const isValid = Object.keys(allErrors).length === 0;

    return {
      isValid,
      errors: allErrors
    };
  }

  /**
   * Create middleware for this form request
   * @returns {Function}
   */
  static middleware() {
    const RequestClass = this;
    
    return async (req, res, next) => {
      const formRequest = new RequestClass(req, res);
      const result = await formRequest.validate();
      
      if (!result.isValid) {
        return res.status(422).json({
          message: 'The given data was invalid.',
          errors: result.errors
        });
      }
      
      next();
    };
  }

  /**
   * Get validated data (only fields that have validation rules)
   * @returns {Object}
   */
  validated() {
    const rules = this.rules();
    const data = this.req.body;
    const validated = {};

    for (const field in rules) {
      if (data.hasOwnProperty(field)) {
        validated[field] = data[field];
      }
    }

    return validated;
  }

  /**
   * Get all input data
   * @returns {Object}
   */
  all() {
    return this.req.body;
  }

  /**
   * Get specific input fields
   * @param {Array} fields
   * @returns {Object}
   */
  only(fields) {
    const data = this.req.body;
    const result = {};

    fields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        result[field] = data[field];
      }
    });

    return result;
  }
}

module.exports = FormRequest;
