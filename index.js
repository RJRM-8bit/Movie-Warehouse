const { engine } = require('express-handlebars');
const express = require('express');
const fs = require('fs');
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Setup Handlebars as the view engine
app.engine('hbs', engine({
    defaultLayout: 'layout',
    extname: 'hbs',
    layoutsDir: __dirname + '/views',
    helpers: {
        // Custom helper to increment a number (used for pagination)
        inc: function (value) {
            return parseInt(value) + 1;
        },
        // Custom helper to decrement a number (used for pagination)
        dec: function (value) {
            return parseInt(value) - 1;
        },
        // Custom helper to check if the page is greater than 1 (for 'Previous' link)
        pageGreaterThanOne: function (page) {
            return page > 1; // Returns true if the page is greater than 1
        },
        // Custom helper to check if the page is less than total pages (for 'Next' link)
        pageLessThanTotalPages: function (page, totalPages) {
            return page < totalPages; // Returns true if the page is less than totalPages
        },
        isFavorite: function(movieId){
            return favoriteMovies.some(movie => movie.id == movieId);
        },
        isInWatchlist: function(movieId){
            return watchlistsMovies.some(movie => movie.id == movieId);
        }
    }
}));

// Set up Handlebars as the view engine
app.set('view engine', 'hbs');

// Define the directory where your templates are located
app.set('views', path.join(__dirname, 'views'));

// Set up a partials directory (optional, for reusable pieces like headers or footers)
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Parse JSON request bodies

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

// In-memory list for favorite movies
let favoriteMovies = [];
let watchlistsMovies = [];
let watchedMovies = [];

// Serve static files (for CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Load movies from a JSON file
const movies = JSON.parse(fs.readFileSync(path.join(__dirname, 'movies.json'), 'utf8'));

// Routes
app.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 5; // Movies per page, default is 5
    const search = req.query.search || ''; // Search query (optional)

    // Debugging: Check for movies with missing titles
    movies.forEach(movie => {
        if (!movie.title) {
            console.warn('Movie with missing or null title:', movie);
        }
    });

    // Filter movies based on the search query
    const filteredMovies = movies.filter(movie =>
        movie.title && movie.title.toLowerCase().includes(search.toLowerCase())
    );

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

    // Render the page with data using Handlebars
    res.render('index', {
        total: filteredMovies.length,
        page,
        limit,
        totalPages: Math.ceil(filteredMovies.length / limit),
        movies: paginatedMovies,
        search,
    });
});

// Handle adding or removing a movie to/from favorites
app.post('/favorite', (req, res) => {
    const { movieId, action } = req.body;
    const movie = movies.find((m) => m.id == movieId);
    
    if (action === 'add') {
        if (movie && !favoriteMovies.includes(movie)) {
            favoriteMovies.push(movie);
            return res.json({ success: true });
        }
        return res.json({ success: false, message: 'Movie already in favorites.' });
    } else if (action === 'remove') {
        if (movie && favoriteMovies.includes(movie)) {
            favoriteMovies = favoriteMovies.filter(fav => fav.id !== movieId);
            return res.json({ success: true });
        }
        return res.json({ success: false, message: 'Movie not found in favorites.' });
    }

    res.json({ success: false, message: 'Invalid action.' });
});

// Handle adding or removing a movie to/from the watchlist
app.post('/watchlist', (req, res) => {
    const { movieId, action } = req.body;
    const movie = movies.find((m) => m.id == movieId);
    
    if (action === 'add') {
        if (movie && !watchlistsMovies.includes(movie)) {
            watchlistsMovies.push(movie);
            return res.json({ success: true });
        }
        return res.json({ success: false, message: 'Movie already in watchlist.' });
    } else if (action === 'remove') {
        if (movie && watchlistsMovies.includes(movie)){
            // Remove movie from the watchlist
            watchlistsMovies = watchlistsMovies.filter(watchlist => watchlist.id !== movieId);
    
            // Check if the movie is already in the watchedMovies array
            const isAlreadyWatched = watchedMovies.some(watched => watched.id === movieId);
    
            // If the movie is not already in the watchedMovies list, add it
            if (!isAlreadyWatched) {
                watchedMovies.push(movie);
            }
    
            return res.json({ success: true });
        }
        return res.json({ success: false, message: 'Movie not found in watchlist.' });
    }

    res.json({ success: false, message: 'Invalid action.' });
});

// View favorites
app.get('/favorites', (req, res) => {
    res.render('favorites', { movies: favoriteMovies });
});

app.get('/watchlist', (req, res) => {
    res.render('index', { movies: watchlistsMovies });
});

app.get('/watched', (req, res) => {
    res.render('index', { movies: watchedMovies });
});

// Additional Pages
app.get('/movies', (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 5; // Movies per page, default is 5
    const search = req.query.search || ''; // Search query (optional)

    // Debugging: Check for movies with missing titles
    movies.forEach(movie => {
        if (!movie.title) {
            console.warn('Movie with missing or null title:', movie);
        }
    });

    // Filter movies based on the search query
    const filteredMovies = movies.filter(movie =>
        movie.title && movie.title.toLowerCase().includes(search.toLowerCase())
    );

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

    // Render the page with data using Handlebars
    res.render('index', {
        total: filteredMovies.length,
        page,
        limit,
        totalPages: Math.ceil(filteredMovies.length / limit),
        movies: paginatedMovies,
        search,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
