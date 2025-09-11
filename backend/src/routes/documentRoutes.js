const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getIncentiveDocumentMappings,
  createIncentiveDocumentMapping,
  deleteIncentiveDocumentMapping,
  uploadDocument,
  getUserUploadedDocuments,
  deleteUploadedDocument
} = require('../controllers/documentController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes (for all authenticated users)
router.get('/', getAllDocuments);
router.get('/mappings', getIncentiveDocumentMappings);
router.get('/uploaded', getUserUploadedDocuments);
router.get('/:id', getDocumentById);

// Upload routes (for all authenticated users)
router.post('/upload', upload.single('document'), handleUploadError, uploadDocument);
router.delete('/uploaded/:id', deleteUploadedDocument);

// Admin only routes
router.post('/', authorizeRoles('admin'), createDocument);
router.put('/:id', authorizeRoles('admin'), updateDocument);
router.delete('/:id', authorizeRoles('admin'), deleteDocument);

// Mapping routes (admin only)
router.post('/mappings', authorizeRoles('admin'), createIncentiveDocumentMapping);
router.delete('/mappings/:id', authorizeRoles('admin'), deleteIncentiveDocumentMapping);

module.exports = router;