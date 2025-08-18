const loader = document.querySelector(".load");
const bodyPage = document.querySelector(".body-page");
loader.style.display="block";
function loaderOff() {
    loader.style.display="none";
    bodyPage.style.display="block";
}

document.addEventListener("DOMContentLoaded", async () => {
    const authorFilter = document.getElementById("authorFilter");
    const genreFilter = document.getElementById("genreFilter");
    const yearFilter = document.getElementById("yearFilter");
    const bookList = document.querySelector(".book-list");
    const searchInput = document.querySelector(".search-input");

    let userFavorites = [];
    let books = [];

    async function fetchFavorites() {
        try {
            const response = await fetch("http://localhost:8000/api/favorites", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                }
            });
            if (response.ok) {
                const result = await response.json();
                userFavorites = result.data.map(favorite => favorite.book_id);
            } else {
                console.error("Error loading favorites: status", response.status);
            }
        } catch (error) {
            console.error("Error loading favorites:", error);
        }
    }

    async function fetchBooks() {
        try {
            const response = await fetch("http://localhost:8000/api/books");
            if (response.ok) {
                const result = await response.json();
                books = result.data;
            } else {
                console.error("Error loading books: status", response.status);
            }
        } catch (error) {
            console.error("Error loading books:", error);
        }
    }

    function displayBooks(authorId = "", genreId = "", year = "", searchTitle = "") {
        bookList.innerHTML = "";

        const filteredBooks = books.filter(book =>
            userFavorites.includes(book.id) && // Тільки книги у вибраному
            (authorId === "" || book.authors.some(a => a.id === parseInt(authorId))) &&
            (genreId === "" || book.genres.some(g => g.id === parseInt(genreId))) &&
            (year === "" || book.year === year) &&
            (searchTitle === "" || book.title.toLowerCase().includes(searchTitle.toLowerCase()))
        );
        if(filteredBooks.length > 0) {
            filteredBooks.forEach(book => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                <div class="img" style="background-image: url('/${book.cover_image}')"></div>
                <h3 class="title">${book.title.length > 20 ? book.title.slice(0, 20) + '...' : book.title}</h3>
            `;

                if (userFavorites.includes(book.id)) {
                    const favoriteIcon = document.createElement("i");
                    favoriteIcon.className = "fa-solid fa-heart favorite-icon";

                    favoriteIcon.addEventListener("mouseenter", () => {
                        favoriteIcon.classList.remove("fa-heart");
                        favoriteIcon.classList.add("fa-heart-crack");
                    });

                    favoriteIcon.addEventListener("mouseleave", () => {
                        favoriteIcon.classList.remove("fa-heart-crack");
                        favoriteIcon.classList.add("fa-heart");
                    });

                    favoriteIcon.addEventListener("click", async (event) => {
                        event.stopPropagation();
                        try {
                            const response = await fetch(`/api/destroy_by_book_id`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${apiToken}`,
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ book_id: book.id })
                            });

                            if (response.ok) {
                                userFavorites = userFavorites.filter(id => id !== book.id);
                                card.remove();
                                displayBooks();
                                console.log(`Book with id ${book.id} removed from favorites.`);
                            } else {
                                const error = await response.json();
                                console.error("Error removing book from favorites:", error);
                                alert("Failed to remove book from favorites. Please try again.");
                            }
                        } catch (error) {
                            console.error("Error removing book from favorites:", error);
                        }
                    });

                    card.appendChild(favoriteIcon);
                }

                card.addEventListener("click", () => {
                    window.location.href = `/frontend/html/book/show.html?id=${book.id}`;
                });

                bookList.appendChild(card);
            });
        } else {
            const noFavorites = document.createElement("div");
            noFavorites.className = "no-purchased";
            noFavorites.innerHTML = `
                        <h4>You don't have any books favorites</h4>
                    `;
            noFavorites.style.position = "absolute";
            noFavorites.style.top = "45%";
            noFavorites.style.left = "57.7%";
            noFavorites.style.transform = "translate(-50%, -50%)";

            bookList.appendChild(noFavorites)
        }

    }

    async function fetchAuthors() {
        try {
            const response = await fetch("http://localhost:8000/api/authors");
            if (response.ok) {
                const result = await response.json();
                const authors = result.data.sort((a, b) => a.name.localeCompare(b.name));

                authors.forEach(author => {
                    const option = document.createElement("option");
                    option.value = author.id;
                    option.textContent = author.name;
                    authorFilter.appendChild(option);
                });
            } else {
                console.error("Error uploading authors: status", response.status);
            }
        } catch (error) {
            console.error("Error uploading authors:", error);
        }
    }

    async function fetchGenres() {
        try {
            const response = await fetch("http://localhost:8000/api/genres");
            if (response.ok) {
                const result = await response.json();
                const genres = result.data.sort((a, b) => a.name.localeCompare(b.name));

                genres.forEach(genre => {
                    const option = document.createElement("option");
                    option.value = genre.id;
                    option.textContent = genre.name;
                    genreFilter.appendChild(option);
                });
            } else {
                console.error("Genre loading error: status", response.status);
            }
        } catch (error) {
            console.error("Genre loading error:", error);
        }
    }

    async function fetchYears() {
        try {
            const response = await fetch("http://localhost:8000/api/books");
            if (response.ok) {
                const result = await response.json();
                const years = [...new Set(result.data.map(book => book.year))].sort((a, b) => b - a);

                years.forEach(year => {
                    const option = document.createElement("option");
                    option.value = year;
                    option.textContent = year;
                    yearFilter.appendChild(option);
                });
            } else {
                console.error("Error loading years: status", response.status);
            }
        } catch (error) {
            console.error("Error loading years:", error);
        }
    }

    searchInput.addEventListener("input", (event) => {
        event.preventDefault();
        const searchTitle = searchInput.value.trim();

        authorFilter.value = "";
        genreFilter.value = "";
        yearFilter.value = "";

        displayBooks("", "", "", searchTitle);
    });

    authorFilter.addEventListener("change", () => {
        displayBooks(authorFilter.value, genreFilter.value, yearFilter.value, searchInput.value.trim());
    });
    genreFilter.addEventListener("change", () => {
        displayBooks(authorFilter.value, genreFilter.value, yearFilter.value, searchInput.value.trim());
    });
    yearFilter.addEventListener("change", () => {
        displayBooks(authorFilter.value, genreFilter.value, yearFilter.value, searchInput.value.trim());
    });

    await fetchFavorites();
    await fetchBooks();
    await fetchAuthors();
    await fetchGenres();
    await fetchYears();
    displayBooks();
    loaderOff();
});

function closeAllSelects(exceptSelect = null) {
    document.querySelectorAll('.filter-item select').forEach(otherSelect => {
        if (otherSelect !== exceptSelect && otherSelect.isOpen) {
            const parentElement = otherSelect.parentElement;
            parentElement.style.height = '59px';
            otherSelect.isOpen = false;
            otherSelect.disabled = true;
            setTimeout(() => otherSelect.disabled = false, 0);
        }
    });
}

document.querySelectorAll('.filter-item select').forEach(select => {
    select.isOpen = false;

    select.addEventListener('click', function(event) {
        event.stopPropagation();
        if (this.isOpen) {
            this.parentElement.style.height = '59px';
            this.isOpen = false;
            this.disabled = true;
            setTimeout(() => this.disabled = false, 0);
        } else {
            closeAllSelects(this);
            const optionsCount = this.options.length;
            const optionHeight = 27;
            const calculatedHeight = optionsCount * optionHeight;
            this.parentElement.style.height = `${calculatedHeight + 50}px`;
            this.isOpen = true;
        }
    });

    select.addEventListener('mouseleave', function() {
        if (this.isOpen) {
            this.parentElement.style.height = '59px';
            this.isOpen = false;
            this.disabled = true;
            setTimeout(() => this.disabled = false, 0);
        }
    });

    select.addEventListener('change', function() {
        this.parentElement.style.height = '59px';
        this.isOpen = false;
    });
});

document.addEventListener('click', function(event) {
    if (!event.target.closest('.filter-item select')) {
        closeAllSelects();
    }
});

window.addEventListener('scroll', closeAllSelects);

window.addEventListener('wheel', function(event) {
    if (event.deltaY !== 0) {
        closeAllSelects();
    }
});
