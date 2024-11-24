document.addEventListener('DOMContentLoaded', function () {
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
});
