const express = require ('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { courtSchema } = require('../schemas.js');
const Court = require('../models/Court');


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

router.get('/new', (req, res) => {
    res.render('courts/new');
})


router.post('/', validateCourt, catchAsync(async (req, res, next) => {
    // if (!req.body.court) throw new ExpressError('Invalid Court Data', 400);

    const court = new Court(req.body.court);
    await court.save();
    res.redirect(`/courts/${court._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const court = await Court.findById(req.params.id).populate('reviews');
    res.render('courts/show', { court });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const court = await Court.findById(req.params.id)
    res.render('courts/edit', { court });
}))

router.put('/:id', validateCourt, catchAsync(async (req, res) => {
    const { id } = req.params;
    const court = await Court.findByIdAndUpdate(id, { ...req.body.court });
    res.redirect(`/courts/${court._id}`)
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Court.findByIdAndDelete(id);
    res.redirect('/courts');
}));

module.exports = router;