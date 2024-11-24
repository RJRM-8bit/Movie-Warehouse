document.addEventListener('DOMContentLoaded', () => {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');

    favoriteButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const movieId = e.target.closest('li').dataset.id;

            fetch('/favorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ movieId })
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert('Movie added to favorites!');
                    } else {
                        alert('Error adding movie to favorites.');
                    }
                });
        });
    });
});