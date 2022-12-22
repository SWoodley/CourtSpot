const express = require ('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../utils/middleware');
const Review = require('../models/review');
const Court = require('../models/Court');


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const court = await Court.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    court.reviews.push(review);
    await review.save();
    await court.save();
    req.flash('success', 'Successsfully created a new review!')
    res.redirect(`/courts/${court._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Court.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', `Successsfully deleted review`)
    res.redirect(`/courts/${id}`);
}))


module.exports = router;