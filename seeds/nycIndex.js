const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Court = require('../models/Court');
const { nycData } = require('./nycOpenDataCourts');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: 'pk.eyJ1Ijoic2hha2VlbHdvb2RsZXkiLCJhIjoiY2xjZmJnZ21vMXA3aTNwcDRxeWZnNDUyYyJ9.63cU1BDjd1QyRozzmGy2hA' });

const dbUrl = process.env.DBURL || 'mongodb://localhost:27017/court-spot';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Court.deleteMany({});
    for (courtData of nycData) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const geoData = await geocoder.forwardGeocode({
            query: `${courtData.Name}, New York`,
            limit: 1
        }).send()
        const court = new Court({
            //YOUR USER ID
            author: '63c6dc88c3ecdb00165dac38',
            location: `${courtData.Location}, New York`,
            title: `${courtData.Name}`,
            description: ` ${courtData.Info ? `${courtData.Info}<br>` : ``}Location: ${courtData.Location}<br>Phone: ${courtData.Phone}<br>Courts: ${courtData.Courts}<br>Tennis Type: ${courtData.Tennis_Type}<br>Accessible: ${courtData.Accessible}`,
            price,
            geometry: geoData.body.features[0].geometry,
            // geometry: {
            //     type: "Point",
            //     coordinates: [
            //         cities[random1000].longitude,
            //         cities[random1000].latitude
            //     ]
            // },
            images: [
                {
                    url: 'https://res.cloudinary.com/dxra6ljas/image/upload/v1672666824/CourtSpot/carlo-bazzo-KgYMstXJJzA-unsplash_wppwcv.jpg',
                    filename: 'CourtSpot/carlo-bazzo-KgYMstXJJzA-unsplash_wppwcv.jpg'
                },
                {
                    url: 'https://res.cloudinary.com/dxra6ljas/image/upload/v1672666831/CourtSpot/donald-teel-yMzODq5vAr8-unsplash_ltzhvd.jpg',
                    filename: 'CourtSpot/donald-teel-yMzODq5vAr8-unsplash_ltzhvd.jpg'
                }
            ]
        })
        await court.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})