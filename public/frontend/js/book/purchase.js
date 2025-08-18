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
            // Відобразити дропдаун із ім'ям користувача
            loginLink.style.display = "none";
            userDropdown.style.display = "block";
            document.querySelector(".dropdown-toggle").textContent = username;
        } else {
            console.error("Error retrieving user profile.");
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
                <li><a href="/frontend/html/mod/book.html">Books</a></li>
                <li><a href="/frontend/html/mod/user.html">Users</a></li>
                <li><a href="/frontend/html/mod/report.html">Reports</a></li>
            `);
        } else if (role === "moderator") {
            navbarLinks.insertAdjacentHTML("beforeend", `
                <li><a href="/frontend/html/mod/report.html">Reports</a></li>
            `);
        }
        loaderOff();
    }

    addNavLinksByRole(userRole);

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
                    console.error('Unable to retrieve the list of chats.');
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

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("id");

    const back = document.getElementById("back");
    back.addEventListener("click", () => {
        window.location.href = `../../html/book/show.html?id=${bookId}`;
    });

    var cardNumberMask = IMask(
        document.getElementById('card-number'), {
            mask: '0000 0000 0000 0000',
        });

    var expiryDateMask = IMask(
    document.getElementById('expiry-date'), {
        mask: 'MM/YY',
        blocks: {
            MM: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 12
            },
            YY: {
                mask: IMask.MaskedRange,
                from: 24,
                to: 99
            }
        },
    });

    document.getElementById('card-number').addEventListener('input', function () {
        if (this.value.length === 19) {
            document.getElementById('expiry-date').focus();
        }
    });

    document.getElementById('expiry-date').addEventListener('input', function () {
        if (this.value.length === 5) {
            document.getElementById('cvv').focus();
        }
    });

    document.getElementById('confirm').addEventListener('click', async function () {
        const cardNumber = document.getElementById('card-number').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;

        if ([cardNumber.length, expiryDate.length, cvv.length].join() !== '19,5,3') {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/purchases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({ book_id: bookId, is_completed: true })
            });
            const data = await response.json();

            if (data.success) {
                alert('Successful payment');

                try {
                    const favoritesResponse = await fetch(`http://localhost:8000/api/favorites`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiToken}`
                        }
                    });

                    if (favoritesResponse.ok) {
                        const favoritesData = await favoritesResponse.json();
                        const favorite = favoritesData.data.find(fav => fav.book_id === parseInt(bookId));

                        if (favorite) {
                            const deleteResponse = await fetch(`http://localhost:8000/api/favorites/${favorite.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${apiToken}`
                                }
                            });

                            if (deleteResponse.ok) {
                                console.log(`Book ID ${bookId} removed from favorites.`);
                            } else {
                                console.error('Error removing book from favorites:', await deleteResponse.json());
                            }
                        } else {
                            console.log('Book not found in favorites.');
                        }
                    } else {
                        console.error('Error fetching favorites:', await favoritesResponse.json());
                    }
                } catch (fetchError) {
                    console.error('Error while fetching favorites:', fetchError);
                }

                window.location.href = `../../html/book/show.html?id=${bookId}`;
            } else {
                alert('Payment error');
                console.log(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
