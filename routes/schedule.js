const router = require('express').Router();
const { addConfig, getConfigTemplate, publishConfigUpdate } = require('../controllers/schedule.controller');

// GET /template to get the existing firebase remote config template data
router.get('/template', getConfigTemplate);

// POST /publish to publish updates to remote config value
router.post('/publish', publishConfigUpdate);

// POST /add to add new config variable
router.post('/add', addConfig);

module.exports = router;