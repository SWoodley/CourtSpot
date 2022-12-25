const express = require ('express');
const router = express.Router();
const courts = require('../controllers/courts');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCourt } = require('../utils/middleware');
const Court = require('../models/Court');


router.route('/')
    .get(catchAsync(courts.index))
    .post(isLoggedIn, validateCourt, catchAsync(courts.createCourt))

router.get('/new', isLoggedIn, courts.renderNewForm)

router.route('/:id')
    .get(catchAsync(courts.showCourt))
    .put(isLoggedIn, isAuthor, validateCourt, catchAsync(courts.updateCourt))
    .delete(isLoggedIn, isAuthor, catchAsync(courts.deleteCourt));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(courts.renderEditForm))



module.exports = router;