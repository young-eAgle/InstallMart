# Guest Document Upload Backend Implementation

## Overview
This document describes the backend changes needed to support document uploads for guest users during checkout. Currently, guest users receive a 401 (Unauthorized) error when trying to upload documents because the document upload API requires authentication.

## Required Backend Endpoints

### 1. Guest Document Upload Endpoint

**Endpoint:** `POST /api/documents/guest-upload`
**Description:** Allows guest users to upload identification documents during checkout
**Authentication:** None (public endpoint)

#### Request
```http
POST /api/documents/guest-upload
Content-Type: multipart/form-data

Form Data:
- document: File (the document file)
- type: String (document type: cnic_front, cnic_back, utility_bill, etc.)
- orderId: String (temporary order identifier)
- sessionId: String (optional, for tracking guest sessions)
```

#### Response
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": "doc_123456",
    "type": "cnic_front",
    "fileName": "cnic_front.jpg",
    "fileSize": 1024000,
    "uploadedAt": "2023-12-08T10:30:00Z",
    "status": "pending"
  }
}
```

### 2. Guest Document Retrieval Endpoint

**Endpoint:** `GET /api/documents/guest/:orderId`
**Description:** Retrieves documents uploaded by a guest user for a specific order
**Authentication:** None (public endpoint, but requires order ID)

#### Request
```http
GET /api/documents/guest/ord_123456
```

#### Response
```json
{
  "documents": [
    {
      "id": "doc_123456",
      "type": "cnic_front",
      "fileName": "cnic_front.jpg",
      "fileSize": 1024000,
      "uploadedAt": "2023-12-08T10:30:00Z",
      "status": "pending"
    }
  ]
}
```

### 3. Guest Document Deletion Endpoint

**Endpoint:** `DELETE /api/documents/guest/:documentId`
**Description:** Deletes a document uploaded by a guest user
**Authentication:** None (public endpoint, but requires document ID)

#### Request
```http
DELETE /api/documents/guest/doc_123456
```

#### Response
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Database Schema Changes

### Guest Documents Table
```sql
CREATE TABLE guest_documents (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL -- Documents expire after 30 days
);
```

## Implementation Steps

### Step 1: Create Guest Document Model
```javascript
// models/GuestDocument.js
const mongoose = require('mongoose');

const guestDocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['cnic_front', 'cnic_back', 'utility_bill', 'salary_slip', 'bank_statement', 'other']
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'processed', 'deleted']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// Index for automatic cleanup
guestDocumentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('GuestDocument', guestDocumentSchema);
```

### Step 2: Implement Guest Document Controller
```javascript
// controllers/guestDocumentController.js
const GuestDocument = require('../models/GuestDocument');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/guest-documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs only
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed'));
    }
  }
});

// Upload guest document
exports.uploadGuestDocument = async (req, res) => {
  try {
    // Validate required fields
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!req.body.type || !req.body.orderId) {
      return res.status(400).json({
        success: false,
        message: 'Document type and order ID are required'
      });
    }

    // Create document record
    const document = new GuestDocument({
      type: req.body.type,
      fileName: req.file.filename,
      fileSize: req.file.size,
      filePath: req.file.path,
      orderId: req.body.orderId,
      sessionId: req.body.sessionId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        type: document.type,
        fileName: document.fileName,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt,
        status: document.status
      }
    });
  } catch (error) {
    console.error('Guest document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

// Get guest documents by order ID
exports.getGuestDocuments = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const documents = await GuestDocument.find({ orderId })
      .select('id type fileName fileSize uploadedAt status')
      .sort({ uploadedAt: -1 });

    res.json({
      documents
    });
  } catch (error) {
    console.error('Get guest documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents'
    });
  }
};

// Delete guest document
exports.deleteGuestDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await GuestDocument.findById(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Delete document record
    await GuestDocument.findByIdAndDelete(documentId);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete guest document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
};
```

### Step 3: Update Routes
```javascript
// routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  getAllUserDocuments,
  updateDocumentStatus
} = require('../controllers/documentController');
const {
  uploadGuestDocument,
  getGuestDocuments,
  deleteGuestDocument
} = require('../controllers/guestDocumentController');

// Existing authenticated routes
router.route('/')
  .post(protect, upload.single('document'), uploadDocument)
  .get(protect, getMyDocuments);

router.route('/:id')
  .delete(protect, deleteDocument);

router.route('/all')
  .get(protect, getAllUserDocuments);

router.route('/:userId/:documentId/status')
  .put(protect, updateDocumentStatus);

// New guest routes
router.route('/guest-upload')
  .post(upload.single('document'), uploadGuestDocument);

router.route('/guest/:orderId')
  .get(getGuestDocuments);

router.route('/guest/:documentId')
  .delete(deleteGuestDocument);

module.exports = router;
```

## Security Considerations

1. **File Validation**: Only allow image files and PDFs
2. **File Size Limits**: Restrict uploads to 5MB maximum
3. **Expiration**: Automatically delete guest documents after 30 days
4. **Access Control**: Guest documents can only be accessed via order ID
5. **Rate Limiting**: Implement rate limiting to prevent abuse

## Integration with Existing Systems

### Document Transfer Process
When a guest user creates an account after checkout:
1. Retrieve guest documents using order ID
2. Transfer documents from guest storage to user profile
3. Update document ownership in the database
4. Delete temporary guest document records

### Order Processing
When processing orders with guest documents:
1. Admins can view guest documents in the admin panel
2. Documents are associated with the order
3. Verification workflow remains the same as authenticated users

## Testing

### Unit Tests
```javascript
// tests/guestDocument.test.js
describe('Guest Document Upload', () => {
  test('should upload document successfully', async () => {
    // Test implementation
  });
  
  test('should reject invalid file types', async () => {
    // Test implementation
  });
  
  test('should reject files larger than 5MB', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```javascript
// tests/integration/guestCheckout.test.js
describe('Guest Checkout with Document Upload', () => {
  test('should complete checkout with document upload', async () => {
    // Test implementation
  });
  
  test('should retrieve uploaded documents', async () => {
    // Test implementation
  });
});
```

## Deployment Notes

1. Ensure the `/uploads/guest-documents` directory exists and is writable
2. Configure proper file permissions
3. Set up backup procedures for uploaded documents
4. Monitor disk space usage
5. Implement logging for document upload activities