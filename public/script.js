document.addEventListener('DOMContentLoaded', function () {
    const moviesList = document.getElementById('movies-list');
    const searchBar = document.getElementById('search-bar');
    const pageInfo = document.getElementById('page-info');
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');

    let currentPage = 1;
    let searchQuery = '';

    // Function to fetch and render movies
    async function fetchAndRenderMovies(page, search = '') {
        const response = await fetch(`/movies?page=${page}&limit=5&search=${search}`);
        const data = await response.json();

        moviesList.innerHTML = '';
        data.movies.forEach(movie => {
            const li = document.createElement('li');
            li.setAttribute('data-id', movie.id);
            const isFavorite = favoriteMovies.some(fav => fav.id === movie.id);
            const isWatchlist = watchlistsMovies.some(watchlist => watchlist.id === movie.id);

            li.innerHTML = `
                <h2>${movie.title}</h2>
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Rating:</strong> ${movie.vote_average} (${movie.vote_count} votes)</p>
                <button class="favorite-btn" data-movie-id="${movie.id}">
                    ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                <button class="watchlist-btn" data-movie-id="${movie.id}">
                    ${isWatchlist ? 'Remove from Watch List' : 'Add to Watch List'}
                </button>
            `;
            moviesList.appendChild(li);
        });

        // Update page info
        pageInfo.textContent = `Page ${data.page} of ${data.totalPages}`;
        prevPage.disabled = data.page === 1;
        nextPage.disabled = data.page === data.totalPages;
    }

    // Event listener for the favorite & watch list buttons
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    const watchListBtns = document.querySelectorAll('.watchlist-btn');

     // Handle favorite button click (Add/Remove)
     favoriteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const movieId = this.dataset.movieId;
            const action = this.textContent.includes('Add') ? 'add' : 'remove';
            fetch(`/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ movieId, action })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.textContent = action === 'add' ? 'Remove from Favorites' : 'Add to Favorites';
                    fetchAndRenderMovies(currentPage, searchQuery); // Re-render movie list
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });

    // Handle watchlist button click (Add/Remove)
    watchListBtns.forEach(button => {
        button.addEventListener('click', function () {
            const movieId = this.dataset.movieId;
            const action = this.textContent.includes('Add') ? 'add' : 'remove';
            fetch(`/watchlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ movieId, action })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.textContent = action === 'add' ? 'Remove from Watch List' : 'Add to Watch List';
                    fetchAndRenderMovies(currentPage, searchQuery); // Re-render movie list
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });

    // Event listeners for navigation
    prevPage.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchAndRenderMovies(currentPage, searchQuery);
        }
    });

    nextPage.addEventListener('click', () => {
        currentPage++;
        fetchAndRenderMovies(currentPage, searchQuery);
    });

    // Event listener for search
    searchBar.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1; // Reset to the first page
        fetchAndRenderMovies(currentPage, searchQuery);
    });

    // Initial fetch
    fetchAndRenderMovies(currentPage);

    
});
