const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Court = require('../models/Court');

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
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const court = new Court({
            //YOUR USER ID
            author: '63c6dc88c3ecdb00165dac38',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
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