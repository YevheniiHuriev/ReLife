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
        console.error("Error:", error);
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

    // Перевірка, чи клік був поза межами userDropdown
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
