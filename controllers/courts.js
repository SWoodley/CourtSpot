const Court = require('../models/Court');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const courts = await Court.find({});
    res.render('courts/index', { courts })
}

module.exports.renderNewForm = (req, res) => {
    res.render('courts/new');
}

module.exports.createCourt = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.court.location,
        limit: 1
    }).send()
    const court = new Court(req.body.court);
    court.geometry = geoData.body.features[0].geometry;
    court.images = req.files.map(f => ({ url: f.path, filename: f.filename })); //make an array of images and add it to the model
    court.author = req.user._id;
    await court.save();
    console.log(court);
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
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    court.images.push(...imgs);
    await court.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await court.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated court!');
    res.redirect(`/courts/${court._id}`)
}

module.exports.deleteCourt = async (req, res) => {
    const { id } = req.params;
    await Court.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted court')
    res.redirect('/courts');
}