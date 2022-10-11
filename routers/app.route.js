const appView = require('../controller/appController');
const router = require("express").Router();


router.get('/', appView.index);

module.exports = router;

