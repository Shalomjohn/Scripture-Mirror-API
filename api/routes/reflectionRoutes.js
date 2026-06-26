const express = require('express');
const reflectionController = require('../controllers/reflectionController');
const authenticationMiddleware = require('../middlewares/authenticationMiddleware');
const router = express.Router();


// Protected routes (require authentication)
router.use(authenticationMiddleware.authenticate);

router.get('/', reflectionController.getReflections);
router.post('/', reflectionController.createReflection);
router.put('/:reflectionId', reflectionController.updateReflection);
router.delete('/:reflectionId', reflectionController.deleteReflection);

router.post('/folders', reflectionController.createFolder);
router.put('/folders/:folderId', reflectionController.updateFolder);
router.delete('/folders/:folderId', reflectionController.deleteFolder);

module.exports = router; 
