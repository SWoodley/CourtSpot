const express = require ('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Court = require('../models/Court');
const { isLoggedIn, isAuthor, validateCourt } = require('../utils/middleware');


router.get('/', catchAsync(async (req, res) => {
    const courts = await Court.find({});
    res.render('courts/index', { courts })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('courts/new');
})


router.post('/', isLoggedIn, validateCourt, catchAsync(async (req, res, next) => {
    const court = new Court(req.body.court);
    court.author = req.user._id;
    await court.save();
    req.flash('success', 'Successfully made a new court!')
    res.redirect(`/courts/${court._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const court = await Court.findById(req.params.id).populate({
        path: 'reviews', //populate reviews
        populate: {
            path: 'author' //populate the author of each review
        }
    }).populate('author'); //populate the court author
    if(!court){
        req.flash('error', 'Court not found');
        return res.redirect('/courts');
    }
    res.render('courts/show', { court });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const {id } = req.params;
    const court = await Court.findById(id)
    if(!court){
        req.flash('error', 'Court not found');
        return res.redirect('/courts');
    }
    res.render('courts/edit', { court });
}))

router.put('/:id', isLoggedIn, isAuthor, validateCourt, catchAsync(async (req, res) => {
    const { id } = req.params;
    const court = await Court.findByIdAndUpdate(id, { ...req.body.court });
    req.flash('success', 'Update Successful!');
    res.redirect(`/courts/${court._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Court.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted court');
    res.redirect('/courts');
}));

module.exports = router;