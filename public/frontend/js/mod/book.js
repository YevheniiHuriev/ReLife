const loader = document.querySelector(".load");
const bodyPage = document.querySelector(".body-page");
loader.style.display="block";
function loaderOff() {
    loader.style.display="none";
    bodyPage.style.display="block";
}

function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.classList.toggle("show");
}

const apiToken = localStorage.getItem("api_token");
const loginLink = document.getElementById("loginLink");
const userDropdown = document.getElementById("userDropdown");
let currentUserId = 0;

async function getUserProfile() {
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const username = data.data.username;
            currentUserId = data.data.id;
            loginLink.style.display = "none";
            userDropdown.style.display = "block";
            document.querySelector(".dropdown-toggle").textContent = username;
        } else {
            console.error("Error retrieving user profile");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

if (apiToken) {
    try {
        const decoded = jwt_decode(apiToken);

        const now = Date.now() / 1000;
        if (decoded.exp < now) {
            localStorage.removeItem("api_token");
            loginLink.style.display = "block";
            userDropdown.style.display = "none";
            window.location.href = `../../html/auth/login.html`;
        } else {
            getUserProfile();
        }
    } catch (error) {
        localStorage.removeItem("api_token");
        loginLink.style.display = "block";
        userDropdown.style.display = "none";
    }
} else {
    loginLink.style.display = "block";
    userDropdown.style.display = "none";
}

document.addEventListener("click", function(event) {
    const dropdownMenu = document.getElementById("dropdownMenu");
    const userDropdown = document.getElementById("userDropdown");

    if (!userDropdown.contains(event.target) && dropdownMenu.classList.contains("show")) {
        dropdownMenu.classList.remove("show");
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const navbarLinks = document.querySelector(".navbar-links");

    async function getAuthenticatedUserRole() {
        if(apiToken)
        {
            try {
                const response = await fetch('/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                return result.success ? result.data.role.name : null;
            } catch (error) {
                console.error("Error fetching user role:", error);
                return null;
            }
        }
    }

    const userRole = await getAuthenticatedUserRole();

    function addNavLinksByRole(role) {
        if (role === "admin") {
            navbarLinks.insertAdjacentHTML("beforeend", `
                <li><a href="/frontend/html/mod/user.html">Users</a></li>
                <li><a href="/frontend/html/mod/report.html">Reports</a></li>
            `);
        } else if (role === "moderator") {
            navbarLinks.insertAdjacentHTML("beforeend", `
                <li><a href="/frontend/html/mod/report.html">Reports</a></li>
            `);
        }
    }

    addNavLinksByRole(userRole);
    loaderOff();

    if(apiToken) {
        const unreadIndicator = document.getElementById('unread_messages_indicator');
        const mess_indicator = document.getElementById('mess_indicator');

        async function checkUnreadMessages() {
            try {
                const response = await fetch('/api/chats', {
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.error('Не вдалося отримати список чатів.');
                    return;
                }

                const chats = await response.json();

                const hasUnreadMessages = chats.some(chat =>
                    chat.messages.some(
                        message => !message.is_checked && message.sender_id !== currentUserId
                    )
                );

                unreadIndicator.style.display = hasUnreadMessages ? 'inline-block' : 'none';
                mess_indicator.style.width = hasUnreadMessages ? '134px' : '115px';
            } catch (error) {
                console.error('Error checking unread messages:', error);
            }
        }

        checkUnreadMessages();
        setInterval(checkUnreadMessages, 15000);
    }
});

const currentYear = new Date().getFullYear();
document.getElementById('year').setAttribute('max', currentYear);

const btnNew = document.getElementById("btn_new_book");
const btnUp = document.getElementById("btn_up_book");
const btnDel = document.getElementById("btn_del_book");
const newBook = document.querySelector(".new-book");
const updateBook = document.querySelector(".up-book");
const deleteBook = document.querySelector(".del-book");

btnNew.classList.add("active");
updateBook.style.display = "none";
deleteBook.style.display = "none";
newBook.style.display = "block";

function activateButton(button) {
    document.querySelectorAll('.options-con button').forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    if (button === btnNew) {
        updateBook.style.display = "none";
        deleteBook.style.display = "none";
        newBook.style.display = "block";
    } else if (button === btnUp) {
        newBook.style.display = "none";
        deleteBook.style.display = "none";
        updateBook.style.display = "block";
    } else if (button === btnDel) {
        updateBook.style.display = "none";
        newBook.style.display = "none";
        deleteBook.style.display = "block";
    }
}

btnNew.addEventListener("focus", () => activateButton(btnNew));
btnUp.addEventListener("focus", () => activateButton(btnUp));
btnDel.addEventListener("focus", () => activateButton(btnDel));

function getPdfFile(input_id, img_id, url_complete_img) {
    document.getElementById(`${input_id}`).addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                document.getElementById(`${img_id}`).src = `${url_complete_img}`;
            };
            reader.readAsDataURL(file);
        }
    });
}

document.getElementById("coverImage").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("coverImagePicture").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
document.getElementById("coverImagePicture").addEventListener("click", function () {
    document.getElementById("coverImage").click();
});

getPdfFile("demo", "demoImagePicture", "/storage/img/demo_complete.jpg");
document.getElementById("demoImagePicture").addEventListener("click", function () {
    document.getElementById("demo").click();
});

getPdfFile("content", "contentImagePicture", "/storage/img/content_complete.jpg");
document.getElementById("contentImagePicture").addEventListener("click", function () {
    document.getElementById("content").click();
});

document.getElementById("addBookForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const year = document.getElementById("year").value;
    const pages = document.getElementById("pages").value;
    const price = document.getElementById("price").value;

    const authors = document.getElementById("authors").value.split(",").map(a => a.trim());
    const genres = document.getElementById("genres").value.split(",").map(g => g.trim());

    const coverImageFile = document.getElementById("coverImage").files[0];
    const contentFile = document.getElementById("content").files[0];
    const demoFile = document.getElementById("demo").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("cover_image", coverImageFile);
    formData.append("content", contentFile);
    formData.append("demo", demoFile);
    formData.append("year", year);
    formData.append("pages", pages);
    formData.append("price", price);
    authors.forEach(author => formData.append("authors[]", author));
    genres.forEach(genre => formData.append("genres[]", genre));

    await store(formData);
});

const store = async (formData) => {
    const url = `http://localhost:8000/api/books`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            alert("Book added successfully!")

            resetNewBookForm();

            await fetchBooks();
            await fetchBooksForDeletion()

        } else {
            console.log(data.message);
        }
    } catch (error) {
        console.error("Failed to add book:", error);
    }
};

function resetNewBookForm() {
    document.getElementById("title").value = '';
    document.getElementById("description").value = '';
    document.getElementById("year").value = '';
    document.getElementById("pages").value = '';
    document.getElementById("price").value = '';

    document.getElementById("authors").value = '';
    document.getElementById("genres").value = '';

    document.getElementById("coverImage").files[0] = null;
    const coverImage = document.getElementById("coverImagePicture");
    coverImage.src = "/storage/img/cover.jpg";

    document.getElementById("content").files[0] = null;
    const demoImage = document.getElementById("demoImagePicture");
    demoImage.src = "/storage/img/demo.jpg";

    document.getElementById("demo").files[0] = null;
    const contentImage = document.getElementById("contentImagePicture");
    contentImage.src = "/storage/img/content.jpg";
}

document.getElementById("update_coverImage").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("update_coverImagePicture").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
document.getElementById("update_coverImagePicture").addEventListener("click", function () {
    document.getElementById("update_coverImage").click();
});

getPdfFile("update_demo", "update_demoImagePicture", "/storage/img/demo_complete.jpg");
document.getElementById("update_demoImagePicture").addEventListener("click", function () {
    document.getElementById("update_demo").click();
});

getPdfFile("update_content", "update_contentImagePicture", "/storage/img/content_complete.jpg");
document.getElementById("update_contentImagePicture").addEventListener("click", function () {
    document.getElementById("update_content").click();
});

const bookSelectorDisplay = document.getElementById("selectorDisplay");
const bookDropdown = document.getElementById("dropdown");
const bookDropdownList = document.getElementById("dropdownList");
let currentBook = null;
let up_books = [];
toggleReadonly(true);

async function fetchBooks() {
    try {
        const response = await fetch('/api/books', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiToken}`
            },
        });
        if (!response.ok) {
            console.log("Failed to fetch books");
            return;
        }

        const result = await response.json();

        up_books = result.data || [];

        if (!Array.isArray(up_books)) {
            console.log("Books is not an array");
            return
        }

        up_books.sort((a, b) => a.title.localeCompare(b.title));

        renderBookDropdown();
    } catch (error) {
        console.error("Error fetching books:", error);
    }
}

function renderBookDropdown() {
    bookDropdownList.innerHTML = "";
    up_books.forEach(book => {
        const listItem = document.createElement("li");
        listItem.textContent = book.title;
        listItem.dataset.id = book.id;
        listItem.addEventListener("click", () => selectBook(book));
        bookDropdownList.appendChild(listItem);
    });
}

function toggleReadonly(isReadOnly) {
    const fields = [
        "update_title", "update_description", "update_authors",
        "update_genres", "update_year", "update_pages", "update_price"
    ];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (isReadOnly) {
            field.setAttribute("readonly", "true");
        } else {
            field.removeAttribute("readonly");
        }
    });
}

function selectBook(book) {
    currentBook = book;
    bookSelectorDisplay.textContent = book.title;
    bookSelectorDisplay.dataset.id = book.id;
    bookDropdown.style.display = "none";
    populateBookForm(book);

    toggleReadonly(false);
}

function populateBookForm(book) {
    document.getElementById("update_title").value = book.title || "";
    document.getElementById("update_description").value = book.description || "";
    document.getElementById("update_authors").value = book.authors.map(author => author.name).join(", ") || "";
    document.getElementById("update_genres").value = book.genres.map(genre => genre.name).join(", ") || "";
    document.getElementById("update_year").value = book.year || "";
    document.getElementById("update_pages").value = book.pages || "";
    document.getElementById("update_price").value = book.price || "";

    const coverImage = document.getElementById("update_coverImagePicture");
    coverImage.src = book.cover_image ? `/${book.cover_image}` : "/storage/img/cover.jpg";

    const demoImage = document.getElementById("update_demoImagePicture");
    demoImage.src = book.demo ? "/storage/img/demo_complete.jpg" : "/storage/img/demo.jpg";

    const contentImage = document.getElementById("update_contentImagePicture");
    contentImage.src = book.content ? "/storage/img/content_complete.jpg" : "/storage/img/content.jpg";
}

bookSelectorDisplay.addEventListener("click", () => {
    bookDropdown.style.display = bookDropdown.style.display === "none" ? "block" : "none";
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".up-custom-selector")) {
        bookDropdown.style.display = "none";
    }
});

document.getElementById("upBookForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const authors = document.getElementById("update_authors").value.split(",").map(a => a.trim());
    const genres = document.getElementById("update_genres").value.split(",").map(g => g.trim());

    const formData = new FormData();
    formData.append("title", document.getElementById("update_title").value);
    formData.append("description", document.getElementById("update_description").value)

    authors.forEach(author => formData.append("authors[]", author));
    genres.forEach(genre => formData.append("genres[]", genre));

    formData.append("year", document.getElementById("update_year").value);
    formData.append("pages", document.getElementById("update_pages").value);
    formData.append("price", document.getElementById("update_price").value);

    const coverFile = document.getElementById("update_coverImage").files[0];
    const up_demoFile = document.getElementById("update_demo").files[0];
    const up_contentFile = document.getElementById("update_content").files[0];

    if (coverFile) formData.append("cover_image", coverFile);
    if (up_demoFile) formData.append("demo_file", up_demoFile);
    if (up_contentFile) formData.append("content_file", up_contentFile);

    try {
        const response = await fetch(`/api/books/${currentBook.id}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiToken}`
            },
            body: formData,
        });

        if (response.ok) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            alert("Book updated successfully!");

            await fetchBooks();
            await fetchBooksForDeletion();
            resetUpdateForm();
            toggleReadonly(true);
        } else {
            const error = await response.json();
            console.error("Error updating book:", error);
        }
    } catch (error) {
        console.error("Update failed:", error);
    }
});

fetchBooks();


const deleteSelectorDisplay = document.getElementById("delete_selector_display");
const deleteDropdown = document.getElementById("delete_dropdown");
const deleteDropdownList = document.getElementById("delete_dropdown_list");
const deleteForm = document.getElementById("delBookForm");

let del_books = [];
let selectedBook = null;

async function fetchBooksForDeletion() {
    try {
        const response = await fetch('/api/books', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiToken}`
            },
        });

        if (!response.ok) {
            console.log("Failed to fetch books");
            return;
        }

        const result = await response.json();
        del_books = result.data || [];

        if (!Array.isArray(del_books)) {
            console.log("Books is not an array");
            return;
        }

        del_books.sort((a, b) => a.title.localeCompare(b.title));
        renderDeleteDropdown();
    } catch (error) {
        console.error("Error fetching books:", error);
    }
}

function renderDeleteDropdown() {
    deleteDropdownList.innerHTML = "";
    del_books.forEach(book => {
        const listItem = document.createElement("li");
        listItem.textContent = book.title;
        listItem.dataset.id = book.id;
        listItem.addEventListener("click", () => selectBookForDeletion(book));
        deleteDropdownList.appendChild(listItem);
    });
}

function selectBookForDeletion(book) {
    selectedBook = book;
    deleteSelectorDisplay.textContent = book.title;
    deleteSelectorDisplay.dataset.id = book.id;
    deleteDropdown.style.display = "none";

    populateDeleteForm(book);
}

function populateDeleteForm(book) {
    document.getElementById("delete_title").value = book.title || "";
    document.getElementById("delete_authors").value =  book.authors.map(author => author.name).join(", ") || "";
    const coverImage = document.getElementById("delete_coverImagePicture");
    coverImage.src = book.cover_image ? `/${book.cover_image}` : "/storage/img/cover.jpg";
}

deleteSelectorDisplay.addEventListener("click", () => {
    deleteDropdown.style.display = deleteDropdown.style.display === "none" ? "block" : "none";
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".del-custom-selector")) {
        deleteDropdown.style.display = "none";
    }
});

deleteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedBook) {
        alert("Please select a book to delete.");
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete the book "${selectedBook.title}"?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`/api/books/${selectedBook.id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${apiToken}`
            },
        });

        if (response.ok) {
            alert("Book deleted successfully!");
            await fetchBooksForDeletion();
            await fetchBooks();
            resetDeleteForm();
            if (currentBook && currentBook.id === selectedBook.id) {
                resetUpdateForm();
                toggleReadonly(true);
            }
        } else {
            const error = await response.json();
            console.error("Error response:", error);
        }
    } catch (error) {
        console.error("Error deleting book:", error);
    }
});

function resetDeleteForm() {
    selectedBook = null;
    deleteSelectorDisplay.textContent = "Select the title";
    document.getElementById("delete_title").value = "";
    document.getElementById("delete_authors").value = "";
    document.getElementById("delete_coverImagePicture").src = "/storage/img/cover.jpg";
}

function resetUpdateForm() {
    currentBook = null;
    bookSelectorDisplay.textContent = "Select the title";
    document.getElementById("update_title").value = "";
    document.getElementById("update_description").value = "";
    document.getElementById("update_authors").value = "";
    document.getElementById("update_genres").value = "";
    document.getElementById("update_year").value = "";
    document.getElementById("update_pages").value = "";
    document.getElementById("update_price").value = "";

    const coverImage = document.getElementById("update_coverImagePicture");
    coverImage.src = "/storage/img/cover.jpg";

    const demoImage = document.getElementById("update_demoImagePicture");
    demoImage.src = "/storage/img/demo.jpg";

    const contentImage = document.getElementById("update_contentImagePicture");
    contentImage.src = "/storage/img/content.jpg";
}

fetchBooksForDeletion();
