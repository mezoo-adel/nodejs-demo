const FormRequest = require('./FormRequest');
const User = require("@/Models/User");

class StoreUserRequest extends FormRequest {
  rules() {
    return {
      name: 'required|string|min:3|max:255',
      username: 'required|string|min:3|max:255',
      email: 'required|email|max:255',
      password: 'required|string|min:8|max:255'
    };
  }

  messages() {
    return {
      'name.required': 'Name is required',
      'name.min': 'Name must be at least 3 characters',
      'username.required': 'Username is required',
      'username.min': 'Username must be at least 3 characters',
      'email.required': 'Email is required',
      'email.email': 'Please provide a valid email address',
      'password.required': 'Password is required',
      'password.min': 'Password must be at least 8 characters'
    };
  }

  async customValidation(data) {
    const errors = {};

    // Check if email already exists
    try {
      const existingUser = await User.findOne({ email: data.email }).exec();
      if (existingUser) {
        errors.email = ['Email already exists'];
      }
    } catch (error) {
      console.error('Error checking email uniqueness:', error);
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

class UpdateUserRequest extends FormRequest {
  rules() {
    return {
      name: 'string|min:3|max:255',
      username: 'string|min:3|max:255',
      email: 'email|max:255',
      password: 'string|min:8|max:255'
    };
  }

  messages() {
    return {
      'name.min': 'Name must be at least 3 characters',
      'username.min': 'Username must be at least 3 characters',
      'email.email': 'Please provide a valid email address',
      'password.min': 'Password must be at least 8 characters'
    };
  }

  async customValidation(data) {
    const errors = {};

    // Check if email already exists (excluding current user)
    if (data.email) {
      try {
        const userId = this.req.params.id;
        const existingUser = await User.findOne({ 
          email: data.email, 
          _id: { $ne: userId } 
        }).exec();
        
        if (existingUser) {
          errors.email = ['Email already exists'];
        }
      } catch (error) {
        console.error('Error checking email uniqueness:', error);
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

class LoginRequest extends FormRequest {
  rules() {
    return {
      email: 'required|email',
      password: 'required|string'
    };
  }

  messages() {
    return {
      'email.required': 'Email is required',
      'email.email': 'Please provide a valid email address',
      'password.required': 'Password is required'
    };
  }
}

module.exports = { 
  StoreUserRequest, 
  UpdateUserRequest, 
  LoginRequest 
};
