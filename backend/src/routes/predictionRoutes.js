const express = require('express');
const controller = require('../controllers/predictionController');
const upload = require('../middleware/upload');
const validateObjectId = require('../middleware/validateObjectId');
const requireStorage = require('../middleware/requireStorage');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireStorage);

router.post('/', upload, asyncHandler(controller.create));
router.get('/', asyncHandler(controller.list));
router.get('/stats', asyncHandler(controller.stats)); // must stay above '/:id'
router.get('/:id', validateObjectId, asyncHandler(controller.getOne));
router.delete('/:id', validateObjectId, asyncHandler(controller.remove));

module.exports = router;
