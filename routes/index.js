var express = require('express');
var router = express.Router();

var main = require('./main');

router.get('/', main.Index);
router.get('/download', main.Download);

module.exports = router;
