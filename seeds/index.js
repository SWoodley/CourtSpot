const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Court = require('../models/Court');

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

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Court.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const court = new Court({
            //YOUR USER ID
            author: '63a36c3a2925d32d9038cf57',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [-113,47.0202]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dxra6ljas/image/upload/v1672666832/CourtSpot/justus-menke-bWDXFaBTnL8-unsplash_kzgevt.jpg',
                    filename: 'CourtSpot/justus-menke-bWDXFaBTnL8-unsplash_kzgevt.jpg'
                },
                {
                    url: 'https://res.cloudinary.com/dxra6ljas/image/upload/v1672666825/CourtSpot/tim-chow-X2c2NH0O_1w-unsplash_jeucld.jpg',
                    filename: 'CourtSpot/tim-chow-X2c2NH0O_1w-unsplash_jeucld.jpg'
                }
            ]
        })
        await court.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})