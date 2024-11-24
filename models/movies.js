const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: String,
    overview: String,
    release_date: String,
    vote_average: Number,
    vote_count: Number,
    favorite: { type: Boolean, default: false }
});

// Create and export the Movie model
const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;