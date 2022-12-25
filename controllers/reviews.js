const Court = require('../models/Court');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const court = await Court.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    court.reviews.push(review);
    await review.save();
    await court.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/Courts/${court._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Court.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/Courts/${id}`);
}