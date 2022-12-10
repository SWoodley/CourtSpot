const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { courtSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Court = require('./models/Court');

mongoose.connect('mongodb://localhost:27017/court-spot', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//Input validation middleware
const validateCourt = (req, res, next) => {
    const { error } = courtSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
});
app.get('/courts', catchAsync(async (req, res) => {
    const courts = await Court.find({});
    res.render('courts/index', { courts })
}));

app.get('/courts/new', (req, res) => {
    res.render('courts/new');
})


app.post('/courts', validateCourt, catchAsync(async (req, res, next) => {
    // if (!req.body.court) throw new ExpressError('Invalid Court Data', 400);

    const court = new Court(req.body.court);
    await court.save();
    res.redirect(`/courts/${court._id}`)
}))

app.get('/courts/:id', catchAsync(async (req, res,) => {
    const court = await Court.findById(req.params.id)
    res.render('courts/show', { court });
}));

app.get('/courts/:id/edit', catchAsync(async (req, res) => {
    const court = await Court.findById(req.params.id)
    res.render('courts/edit', { court });
}))

app.put('/courts/:id', validateCourt, catchAsync(async (req, res) => {
    const { id } = req.params;
    const court = await Court.findByIdAndUpdate(id, { ...req.body.court });
    res.redirect(`/courts/${court._id}`)
}));

app.delete('/courts/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Court.findByIdAndDelete(id);
    res.redirect('/courts');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})