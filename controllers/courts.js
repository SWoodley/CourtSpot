const Court = require('../models/Court');

module.exports.index = async (req, res) => {
    const courts = await Court.find({});
    res.render('courts/index', { courts })
}

module.exports.renderNewForm = (req, res) => {
    res.render('courts/new');
}

module.exports.createCourt = async (req, res, next) => {
    const court = new Court(req.body.court);
    court.author = req.user._id;
    await court.save();
    req.flash('success', 'Successfully made a new court!');
    res.redirect(`/courts/${court._id}`)
}

module.exports.showCourt = async (req, res,) => {
    const court = await Court.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!court) {
        req.flash('error', 'Cannot find that court!');
        return res.redirect('/courts');
    }
    res.render('courts/show', { court });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const court = await Court.findById(id)
    if (!court) {
        req.flash('error', 'Cannot find that court!');
        return res.redirect('/courts');
    }
    res.render('courts/edit', { court });
}

module.exports.updateCourt = async (req, res) => {
    const { id } = req.params;
    const court = await Court.findByIdAndUpdate(id, { ...req.body.court });
    req.flash('success', 'Successfully updated court!');
    res.redirect(`/courts/${court._id}`)
}

module.exports.deleteCourt = async (req, res) => {
    const { id } = req.params;
    await Court.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted court')
    res.redirect('/courts');
}