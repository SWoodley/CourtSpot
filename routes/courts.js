const express = require ('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { courtSchema } = require('../schemas.js');
const Court = require('../models/Court');
const {isLoggedIn} = require('../utils/authMiddleware');


//Input validation middleware
const validateCourt = (req, res, next) => {
    //check for an error from validation operation
    const { error } = courtSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const courts = await Court.find({});
    res.render('courts/index', { courts })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('courts/new');
})


router.post('/', isLoggedIn, validateCourt, catchAsync(async (req, res, next) => {
    const court = new Court(req.body.court);
    await court.save();
    req.flash('success', 'Successfully made a new court!')
    res.redirect(`/courts/${court._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const court = await Court.findById(req.params.id).populate('reviews');
    if(!court){
        req.flash('error', 'Court not found');
        return res.redirect('/courts');
    }
    res.render('courts/show', { court });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const court = await Court.findById(req.params.id)
    if(!court){
        req.flash('error', 'Court not found');
        return res.redirect('/courts');
    }
    res.render('courts/edit', { court });
}))

router.put('/:id', isLoggedIn, validateCourt, catchAsync(async (req, res) => {
    const { id } = req.params;
    const court = await Court.findByIdAndUpdate(id, { ...req.body.court });
    req.flash('success', 'Update Successful!');
    res.redirect(`/courts/${court._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Court.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted court');
    res.redirect('/courts');
}));

module.exports = router;