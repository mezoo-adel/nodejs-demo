# Laravel-Style Validation in Node.js

This project now includes a Laravel-style validation system that allows you to create form requests with validation rules, custom messages, and custom validation logic.

## Features

- **Form Request Classes**: Similar to Laravel's FormRequest
- **Validation Rules**: String-based validation rules like Laravel
- **Custom Messages**: Override default error messages
- **Custom Validation**: Add complex validation logic
- **Middleware Integration**: Easy integration with Express routes
- **Async Support**: Full support for async validation (database checks, etc.)

## Available Validation Rules

- `required` - Field must be present and not empty
- `string` - Field must be a string
- `email` - Field must be a valid email address
- `min:n` - Field must be at least n characters
- `max:n` - Field must not exceed n characters
- `numeric` - Field must be a number
- `integer` - Field must be an integer
- `boolean` - Field must be a boolean
- `confirmed` - Field must match field_confirmation
- `in:val1,val2,val3` - Field must be one of the specified values

## Creating a Form Request

### 1. Basic Form Request

```javascript
const FormRequest = require('@/Requests/FormRequest');

class CreatePostRequest extends FormRequest {
  rules() {
    return {
      title: 'required|string|min:3|max:255',
      content: 'required|string|min:10',
      status: 'required|in:draft,published',
      category_id: 'required|integer'
    };
  }

  messages() {
    return {
      'title.required': 'Post title is required',
      'title.min': 'Title must be at least 3 characters',
      'content.required': 'Post content cannot be empty',
      'status.in': 'Status must be either draft or published'
    };
  }
}

module.exports = CreatePostRequest;
```

### 2. Form Request with Custom Validation

```javascript
const FormRequest = require('@/Requests/FormRequest');
const Post = require('@/Models/Post');

class UpdatePostRequest extends FormRequest {
  rules() {
    return {
      title: 'string|min:3|max:255',
      content: 'string|min:10',
      slug: 'string|min:3|max:255'
    };
  }

  async customValidation(data) {
    const errors = {};

    // Check if slug is unique (excluding current post)
    if (data.slug) {
      const postId = this.req.params.id;
      const existingPost = await Post.findOne({ 
        slug: data.slug, 
        _id: { $ne: postId } 
      });
      
      if (existingPost) {
        errors.slug = ['Slug already exists'];
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

module.exports = UpdatePostRequest;
```

## Using Form Requests in Routes

```javascript
const express = require('express');
const CreatePostRequest = require('@/Requests/CreatePostRequest');
const UpdatePostRequest = require('@/Requests/UpdatePostRequest');
const PostController = require('@/Controllers/PostController');

const router = express.Router();

// Apply validation middleware before controller
router.post('/', CreatePostRequest.middleware(), PostController.create);
router.put('/:id', UpdatePostRequest.middleware(), PostController.update);

module.exports = router;
```

## Using in Controllers

```javascript
class PostController {
  static async create(req, res) {
    // Validation already passed, safe to use data
    const postData = req.body;
    
    try {
      const post = await Post.create(postData);
      res.status(201).json({ message: 'Post created', post });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async update(req, res) {
    const id = req.params.id;
    const updateData = req.body;
    
    try {
      const post = await Post.findByIdAndUpdate(id, updateData, { new: true });
      res.json({ message: 'Post updated', post });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
```

## Using the Base Validator Directly

If you prefer middleware-style validation without form request classes:

```javascript
const Validator = require('@/utils/Validator');

const validatePost = Validator.middleware({
  title: 'required|string|min:3|max:255',
  content: 'required|string|min:10',
  status: 'required|in:draft,published'
}, {
  'title.required': 'Post title is required',
  'content.min': 'Content must be at least 10 characters'
});

router.post('/posts', validatePost, PostController.create);
```

## Error Response Format

When validation fails, the response will be:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Email already exists"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Advanced Features

### Getting Validated Data

In your form request, you can access validated data:

```javascript
class CreatePostRequest extends FormRequest {
  // ... rules and messages

  getValidatedData() {
    return this.validated(); // Only returns fields with validation rules
  }
}
```

### Conditional Validation

```javascript
async customValidation(data) {
  const errors = {};

  // Only validate slug if status is published
  if (data.status === 'published' && !data.slug) {
    errors.slug = ['Slug is required for published posts'];
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
```

This validation system provides the same flexibility and power as Laravel's validation while being fully integrated with your Node.js/Express application.
