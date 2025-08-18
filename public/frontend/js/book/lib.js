const loader = document.querySelector(".load");
const loader_2 = document.querySelector(".load-2");
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

    let userPurchases = [];

    async function fetchPurchases() {
        try {
            const response = await fetch("http://localhost:8000/api/purchases", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                }
            });
            if (response.ok) {
                const result = await response.json();
                userPurchases = result.data.map(purchase => purchase.book_id);
            } else {
                console.error("Error loading purchases: status", response.status);
            }
        } catch (error) {
            console.error("Error loading purchases:", error);
        }
    }

    const searchInput = document.querySelector(".search-input");

    async function displaySearchedBooks(title) {
        try {
            const response = await fetch("http://localhost:8000/api/books");
            if (response.ok) {
                const result = await response.json();
                const books = result.data;

                const filteredBooks = books.filter(book =>
                    book.title.toLowerCase().includes(title.toLowerCase()) &&
                    userPurchases.includes(book.id)
                );

                bookList.innerHTML = "";

                filteredBooks.reverse().forEach(book => {
                    const card = document.createElement("div");
                    card.className = "card";
                    card.innerHTML = `
                        <div class="img" style="background-image: url('/${book.cover_image}')"></div>
                        <h3>${book.title.length > 20 ? book.title.slice(0, 20) + '...' : book.title}</h3>
                    `;

                    if (userPurchases.includes(book.id)) {
                        const noteIcon = document.createElement("i");
                        noteIcon.className = "fa-solid fa-pen-to-square note-icon";
                        card.appendChild(noteIcon);
                    }

                    card.addEventListener("click", () => {
                        window.location.href = `/frontend/html/book/show.html?id=${book.id}`;
                    });

                    bookList.appendChild(card);
                });
            }
        } catch (error) {
            console.error("Error loading books", error);
        }
    }

    searchInput.addEventListener("input", (event) => {
        event.preventDefault();
        const title = searchInput.value.trim();

        authorFilter.value = "";
        genreFilter.value = "";
        yearFilter.value = "";

        if (title === "") {
            displayBooks();
        } else {
            displaySearchedBooks(title);
        }
    });

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
                const books = result.data;
                const years = [...new Set(books.map(book => book.year))].sort((a, b) => b - a);

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

    let currentBookId = null;
    async function displayBooks(authorId = "", genreId = "", year = "") {
        try {
            const response = await fetch("http://localhost:8000/api/books");
            if (response.ok) {
                const result = await response.json();
                const books = result.data;

                bookList.innerHTML = "";

                const filteredBooks = books.filter(book =>
                    (authorId === "" || book.authors.some(a => a.id === parseInt(authorId))) &&
                    (genreId === "" || book.genres.some(g => g.id === parseInt(genreId))) &&
                    (year === "" || book.year === year) &&
                    userPurchases.includes(book.id)
                );
                if(filteredBooks.length > 0)
                {
                    filteredBooks.forEach(book => {
                        const card = document.createElement("div");
                        card.className = "card";
                        card.innerHTML = `
                        <div class="img" style="background-image: url('/${book.cover_image}')"></div>
                        <h3 class="title">${book.title.length > 20 ? book.title.slice(0, 20) + '...' : book.title}</h3>
                    `;
                        if (userPurchases.includes(book.id)) {
                            const noteIcon = document.createElement("i");
                            noteIcon.className = "fa-solid fa-pen-to-square note-icon";

                            noteIcon.addEventListener("click", (event) => handleNoteIconClick(event, book.id));

                            card.appendChild(noteIcon);
                        }

                        card.addEventListener("click", () => {
                            window.location.href = `/frontend/html/book/show.html?id=${book.id}`;
                        });

                        bookList.appendChild(card);
                    });
                } else {
                    const noPurchased = document.createElement("div");
                    noPurchased.className = "no-purchased";
                    noPurchased.innerHTML = `
                        <h4>You don't have any books purchased</h4>
                    `;
                    noPurchased.style.position = "absolute";
                    noPurchased.style.top = "45%";
                    noPurchased.style.left = "57.7%";
                    noPurchased.style.transform = "translate(-50%, -50%)";

                    bookList.appendChild(noPurchased)
                }
            }
        } catch (error) {
            console.error("Помилка завантаження книг:", error);
        }
    }

    const noteModal = document.getElementById('noteModal');
    const noteTextarea = document.getElementById('noteTextarea');
    let saveNote = document.getElementById('saveNote');
    const closeNoteBtn = document.getElementById('closeNoteModal');

    async function saveNoteHandler(bookId) {
        const noteText = noteTextarea.value.trim();

        try {
            const noteExists = await fetchNoteForBook(bookId);

            if (noteExists) {
                if (!noteText) {
                    await deleteNote(noteExists.id);
                    alert('Note saved successfully');
                    return;
                }
                await updateNoteForBook(noteText, bookId);
            } else {
                if (!noteText) {
                    alert('Note cannot be empty');
                    return;
                }
                await createNoteForBook(noteText, bookId);
            }

            alert('Note saved successfully');
            currentBookId = null;
        } catch (error) {
            console.error('Error saving note:', error.message);
        }
    }

    async function handleNoteIconClick(event, bookId) {
        event.stopPropagation();
        event.preventDefault();

        if (currentBookId === bookId) {
            saveNote.replaceWith(saveNote.cloneNode(true));
            saveNote = document.getElementById('saveNote');
            saveNote.addEventListener('click', () => saveNoteHandler(bookId));
        } else {
            saveNote.replaceWith(saveNote.cloneNode(true));
            saveNote = document.getElementById('saveNote');
            saveNote.addEventListener('click', () => saveNoteHandler(bookId));
        }

        currentBookId = bookId;
        noteModal.style.display = 'block';
        noteTextarea.value = '';
        loader_2.style.display = "block";
        noteModal.style.display = 'none';

        try {
            const note = await fetchNoteForBook(bookId);
            if (note) {
                noteTextarea.value = note.note;
                noteModal.style.display = 'block';
            } else {
                noteModal.style.display = 'block';
            }
            loader_2.style.display = "none";

            if (noteTextarea) {
                noteTextarea.focus();
                noteTextarea.selectionStart = noteTextarea.value.length;
                noteTextarea.selectionEnd = noteTextarea.value.length;
            }
        } catch (error) {
            console.error('Error fetching note:', error.message);
        }

        closeNoteBtn.addEventListener('click', () => {
            noteModal.style.display = 'none';
        });

        closeModal.addEventListener('click', () => {
            noteModal.style.display = 'none';
        });
    }

    async function fetchNoteForBook(bookId) {
        const response = await fetch(`http://localhost:8000/api/notes/${bookId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.data || null;
        }

        if (response.status === 404) {
            return null;
        }

        throw new Error('Failed to fetch note');
    }

    async function updateNoteForBook(noteText, bookId) {
        const response = await fetch(`http://localhost:8000/api/notes/${bookId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ note: noteText }),
        });

        if (!response.ok) {
            throw new Error('Failed to update note');
        }
    }

    async function createNoteForBook(noteText, bookId) {
        const response = await fetch('http://localhost:8000/api/notes', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ book_id: bookId, note: noteText }),
        });

        if (!response.ok) {
            throw new Error('Failed to create note');
        }
    }

    async function deleteNote(nodeId) {
        const response = await fetch(`http://localhost:8000/api/notes/${nodeId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });
    }

    authorFilter.addEventListener("change", () => displayBooks(authorFilter.value, genreFilter.value, yearFilter.value));
    genreFilter.addEventListener("change", () => displayBooks(authorFilter.value, genreFilter.value, yearFilter.value));
    yearFilter.addEventListener("change", () => displayBooks(authorFilter.value, genreFilter.value, yearFilter.value));

    await fetchPurchases();
    await fetchAuthors();
    await fetchGenres();
    await fetchYears();
    await displayBooks();
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

    // Обробник кліку на селект
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
