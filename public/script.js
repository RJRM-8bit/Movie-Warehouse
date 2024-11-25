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

        // Update UI
        moviesList.innerHTML = '';
        data.movies.forEach(movie => {
            const li = document.createElement('li');
            li.setAttribute('data-id', movie.id);
            li.innerHTML = `
                <h2>${movie.title}</h2>
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Rating:</strong> ${movie.vote_average} (${movie.vote_count} votes)</p>
                <button class="favorite-btn add" data-movie-id="${movie.id}">Add to Favorites</button>
            `;
            moviesList.appendChild(li);
        });

        // Update page info
        pageInfo.textContent = `Page ${data.page} of ${data.totalPages}`;
        prevPage.disabled = data.page === 1;
        nextPage.disabled = data.page === data.totalPages;
    }

    // Event listener for the favorite buttons
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const movieId = this.dataset.movieId; // Get the movie ID from the data attribute
            
            fetch('/favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ movieId }) // Send the movie ID in the request body
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Optionally update the UI to show that the movie was added
                    this.textContent = 'Added to Favorites'; // Change button text
                    this.disabled = true; // Disable button to prevent re-adding
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
