const loader = document.querySelector(".load");
const bodyPage = document.querySelector(".body-page");
loader.style.display="block";
function loaderOff() {
    loader.style.display="none";
    bodyPage.style.display="block";
}

const btnFavorite = document.getElementById("btn-favorite");
const btnPurchased = document.getElementById("btn-purchased");
const bookFavorites = document.querySelector(".book-favorites");
const bookPurchased = document.querySelector(".book-purchased");

btnFavorite.classList.add("active");
bookPurchased.style.display = "none";
bookFavorites.style.display = "block";

function activateButton(button) {
    document.querySelectorAll('.options-con button').forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    if (button === btnFavorite) {
        bookFavorites.style.display = "block";
        bookPurchased.style.display = "none";
    } else if (button === btnPurchased) {
        bookFavorites.style.display = "none";
        bookPurchased.style.display = "block";
    }
}

btnFavorite.addEventListener("focus", () => activateButton(btnFavorite));
btnPurchased.addEventListener("focus", () => activateButton(btnPurchased));

if (apiToken) {
    const btnContainer = document.querySelector('.btn-container');

    if (btnContainer) {
        const button = document.createElement('button');
        button.className = 'btn-message';
        button.id = 'btn_send';
        button.textContent = 'Send message';

        btnContainer.appendChild(button);
    } else {
        console.error('Контейнер .btn-container не знайдено');
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const usernameInput = document.getElementById("username");
    const urlParams = new URLSearchParams(window.location.search);
    const user_from_comm_id = urlParams.get("id");

    async function getUserComment() {
        try {
            const response = await fetch(`/api/users/${user_from_comm_id}`, {
                method: 'GET',
            });
            const result = await response.json();
            return result.success ? result.data : null;

        } catch (error) {
            console.error("Error when receiving a user profile:", error);
            return null;
        }
    }

    const user_comm = await getUserComment();
    getUserInfo(user_comm);


    function getUserInfo(user) {
        document.getElementById("username").value = user.username || "";
        setWidth(usernameInput);

        const userImage = document.getElementById("userImage");
        userImage.src = `/${user.photo}` || "/storage/img/reader.jpg";
    }

    usernameInput.addEventListener("input", function () {
        setWidth(usernameInput);
    });

    function setWidth(input) {
        const padding = 20;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.font = "18px Arial";

        const textWidth = context.measureText(input.value).width;

        if(textWidth < 100) {
            input.style.width = '110px';
        } else {
            input.style.width = `${textWidth + padding}px`;
        }
    }

    const purchased_authorFilter = document.getElementById("purchased_authorFilter");
    const purchased_genreFilter = document.getElementById("purchased_genreFilter");
    const purchased_yearFilter = document.getElementById("purchased_yearFilter");
    const purchased_bookList = document.querySelector(".purchased-book-list");

    let purchased_userPurchases = [];

    async function fetch_purchased_Purchases() {
        try {
            const response = await fetch(`http://localhost:8000/api/purchases/user/${user_from_comm_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                }
            });
            if (response.ok) {
                const result = await response.json();
                purchased_userPurchases = result.data.map(purchase => purchase.book_id);
            } else {
                console.error("Error loading purchases: status", response.status);
            }
        } catch (error) {
            console.error("Error loading purchases:", error);
        }
    }

    async function fetch_purchased_Authors() {
        try {
            const response = await fetch("http://localhost:8000/api/authors");
            if (response.ok) {
                const result = await response.json();
                const authors = result.data.sort((a, b) => a.name.localeCompare(b.name));

                authors.forEach(author => {
                    const option = document.createElement("option");
                    option.value = author.id;
                    option.textContent = author.name;
                    purchased_authorFilter.appendChild(option);
                });
            } else {
                console.error("Error uploading authors: status", response.status);
            }
        } catch (error) {
            console.error("Error uploading authors:", error);
        }
    }

    async function fetch_purchased_Genres() {
        try {
            const response = await fetch("http://localhost:8000/api/genres");
            if (response.ok) {
                const result = await response.json();
                const genres = result.data.sort((a, b) => a.name.localeCompare(b.name));

                genres.forEach(genre => {
                    const option = document.createElement("option");
                    option.value = genre.id;
                    option.textContent = genre.name;
                    purchased_genreFilter.appendChild(option);
                });
            } else {
                console.error("Genre loading error: status", response.status);
            }
        } catch (error) {
            console.error("Genre loading error:", error);
        }
    }

    async function fetch_purchased_Years() {
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
                    purchased_yearFilter.appendChild(option);
                });
            } else {
                console.error("Error loading years: status", response.status);
            }
        } catch (error) {
            console.error("Error loading years:", error);
        }
    }

    async function display_purchased_Books(authorId = "", genreId = "", year = "") {
        try {
            const response = await fetch("http://localhost:8000/api/books");
            if (response.ok) {
                const result = await response.json();
                const books = result.data;

                purchased_bookList.innerHTML = "";

                const filteredBooks = books.filter(book =>
                    (authorId === "" || book.authors.some(a => a.id === parseInt(authorId))) &&
                    (genreId === "" || book.genres.some(g => g.id === parseInt(genreId))) &&
                    (year === "" || book.year === year) &&
                    purchased_userPurchases.includes(book.id)
                );
                if(filteredBooks.length > 0) {
                    filteredBooks.forEach(book => {
                        const card = document.createElement("div");
                        card.className = "purchased-card";
                        card.innerHTML = `
                            <div class="purchased-img" style="background-image: url('/${book.cover_image}')"></div>
                            <h3 class="purchased-title">${book.title.length > 20 ? book.title.slice(0, 20) + '...' : book.title}</h3>
                        `;

                        card.addEventListener("click", () => {
                            window.location.href = `/frontend/html/book/show.html?id=${book.id}`;
                        });

                        purchased_bookList.appendChild(card);
                    });
                } else {
                    const noPurchased = document.createElement("div");
                    noPurchased.className = "no-purchased";
                    noPurchased.innerHTML = `
                            <h4>This reader doesn't have any books purchased</h4>
                        `;
                    purchased_bookList.appendChild(noPurchased)
                }
            }
        } catch (error) {
            console.error("Error downloading books:", error);
        }
    }

    purchased_authorFilter.addEventListener("change", () => display_purchased_Books(purchased_authorFilter.value, purchased_genreFilter.value, purchased_yearFilter.value));
    purchased_genreFilter.addEventListener("change", () => display_purchased_Books(purchased_authorFilter.value, purchased_genreFilter.value, purchased_yearFilter.value));
    purchased_yearFilter.addEventListener("change", () => display_purchased_Books(purchased_authorFilter.value, purchased_genreFilter.value, purchased_yearFilter.value));

    await fetch_purchased_Purchases();
    await fetch_purchased_Authors();
    await fetch_purchased_Genres();
    await fetch_purchased_Years();
    await display_purchased_Books();

    function closeAll_purchased_Selects(exceptSelect = null) {
        document.querySelectorAll('.purchased-filter-item select').forEach(otherSelect => {
            if (otherSelect !== exceptSelect && otherSelect.isOpen) {
                const parentElement = otherSelect.parentElement;
                parentElement.style.height = '59px';
                otherSelect.isOpen = false;
                otherSelect.disabled = true;
                setTimeout(() => otherSelect.disabled = false, 0);
            }
        });
    }

    document.querySelectorAll('.purchased-filter-item select').forEach(select => {
        select.isOpen = false;

        select.addEventListener('click', function(event) {
            event.stopPropagation();
            if (this.isOpen) {
                this.parentElement.style.height = '59px';
                this.isOpen = false;
                this.disabled = true;
                setTimeout(() => this.disabled = false, 0);
            } else {
                closeAll_purchased_Selects(this);
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
            closeAll_purchased_Selects();
        }
    });

    window.addEventListener('scroll', closeAll_purchased_Selects);

    window.addEventListener('wheel', function(event) {
        if (event.deltaY !== 0) {
            closeAll_purchased_Selects();
        }
    });


    if(apiToken) {
        const sendMessage = document.getElementById("btn_send");
        const modal = document.getElementById("chat_modalDialog");
        const closeModal = document.getElementById("chat_closeModal");
        const cancelDialog = document.getElementById("chat_cancelDialog");
        const startDialog = document.getElementById("chat_startDialog");
        const chatTitleInput = document.getElementById("chat_chatTitle");

        const favorites_filter = document.querySelector(".filter-container");
        const purchased_filter = document.querySelector(".purchased-filter-container");

        sendMessage.addEventListener('click', () => {
            modal.style.display = "flex";

            purchased_filter.style.display = "none"
        });

        closeModal.addEventListener('click', () => {
            modal.style.display = "none";

            purchased_filter.style.display = "block"
        });

        cancelDialog.addEventListener('click', () => {
            modal.style.display = "none";

            purchased_filter.style.display = "block"
        });

        startDialog.addEventListener('click', async () => {
            const title = chatTitleInput.value.trim();

            if (!title) {
                alert('Title cannot be empty.');
                return;
            }

            const forbiddenAdmin = /admin/i;
            const forbiddenModer = /moder/i;

            if (forbiddenAdmin.test(title) || forbiddenModer.test(title)) {
                alert('Title cannot contain the word "admin / moder".');
                return;
            }

            try {
                const response = await fetch('/api/chats', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: title,
                        receiver_id: user_from_comm_id,
                    }),
                });

                if (!response.ok) {
                    console.log('Failed to create a chat.');
                    return;
                }

                const newChat = await response.json();
                const newChatId = newChat.chat.id;

                sessionStorage.removeItem('hasMessage');
                sessionStorage.removeItem('currentChatId');

                window.location.href = `/frontend/html/user/message.html?id=${newChatId}`;
            } catch (error) {
                console.error('Error creating a chat:', error);
                alert('An error occurred while creating the chat. Please try again.');
            } finally {
                modal.style.display = "none";
            }
        });
    }

    const authorFilter = document.getElementById("authorFilter");
    const genreFilter = document.getElementById("genreFilter");
    const yearFilter = document.getElementById("yearFilter");
    const bookList = document.querySelector(".book-list");
    const searchInput = document.querySelector(".search-input");

    let userFavorites = [];
    let books = [];

    async function fetchFavorites() {
        try {
            const response = await fetch(`http://localhost:8000/api/favorites/user/${user_from_comm_id}`, {
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
                console.error("Error downloading books: status", response.status);
            }
        } catch (error) {
            console.error("Error downloading books:", error);
        }
    }

    function displayBooks(authorId = "", genreId = "", year = "") {
        bookList.innerHTML = "";

        const filteredBooks = books.filter(book =>
            userFavorites.includes(book.id) &&
            (authorId === "" || book.authors.some(a => a.id === parseInt(authorId))) &&
            (genreId === "" || book.genres.some(g => g.id === parseInt(genreId))) &&
            (year === "" || book.year === year)
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

            if (userFavorites.includes(book.id)) {
                const favoriteIcon = document.createElement("i");
                favoriteIcon.className = "fa-solid fa-heart favorite-icon";
                card.appendChild(favoriteIcon);
            }

            card.addEventListener("click", () => {
                window.location.href = `/frontend/html/book/show.html?id=${book.id}`;
            });

            bookList.appendChild(card);
            });
        } else {
            const noFavorites = document.createElement("div");
            noFavorites.className = "no-favorites";
            noFavorites.innerHTML = `
               <h4>This reader doesn't have any books favorites</h4>
            `;
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

    authorFilter.addEventListener("change", () => {
        displayBooks(authorFilter.value, genreFilter.value, yearFilter.value);
    });
    genreFilter.addEventListener("change", () => {
        displayBooks(authorFilter.value, genreFilter.value, yearFilter.value);
    });
    yearFilter.addEventListener("change", () => {
        displayBooks(authorFilter.value, genreFilter.value, yearFilter.value);
    });

    await fetchFavorites();
    await fetchBooks();
    await fetchAuthors();
    await fetchGenres();
    await fetchYears();
    displayBooks();
    loaderOff();

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
});
