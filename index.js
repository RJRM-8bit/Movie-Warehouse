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

// Handle adding a movie to watch list
app.post('/watchlist', (req, res) => {
    const { movieId } = req.body;
    // Find the movie by ID
    const movie = movies.find((m) => m.id == movieId);
    if (movie && !watchlistsMovies.includes(movie)) {
        watchlistsMovies.push(movie);
        res.json({ success: true, watchlist: watchlistsMovies });
    } else {
        res.json({ success: false, message: 'Movie not found or already in Watchlist.' });
    }
});

// View favorites
app.get('/favorites', (req, res) => {
    res.render('index', { movies: favoriteMovies });
});

app.get('/watchlisted', (req, res) => {
    res.render('index', { movies: watchlistsMovies });
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
