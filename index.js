const express = require('express');
const fs = require('fs');
const path = require('path');
const hbs = require('hbs');

const app = express();
const PORT = 3000;

// Set up Handlebars as the view engine
app.set('view engine', 'hbs');

// Define the directory where your templates are located
app.set('views', path.join(__dirname, 'views'));

// Set up a partials directory (optional, for reusable pieces like headers or footers)
hbs.registerPartials(path.join(__dirname, 'views/partials'));

app.use(express.json()); // Parse JSON request bodies

// In-memory list for favorite movies
let favoriteMovies = [];

// Serve static files (for CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Load movies from a JSON file
const movies = JSON.parse(fs.readFileSync(path.join(__dirname, 'movies.json'), 'utf8'));

// Routes
app.get('/', (req, res) => {
    res.render('index', { movies })
});

// Handle adding a movie to favorites
app.post('/favorite', (req, res) => {
    const { movieId } = req.body;
    // Find the movie by ID
    const movie = movies.find((m) => m.id == movieId);
    if (movie && !favoriteMovies.includes(movie)) {
        favoriteMovies.push(movie);
        res.json({ success: true, favorites: favoriteMovies });
    } else {
        res.json({ success: false, message: 'Movie not found or already in favorites.' });
    }
});

// View favorites
app.get('/favorites', (req, res) => {
    res.render('index', { movies: favoriteMovies });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
