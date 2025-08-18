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
                <li><a href="/frontend/html/mod/book.html">Books</a></li>
                <li><a href="/frontend/html/mod/report.html">Reports</a></li>
            `);
            loaderOff();
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

var phoneMask = IMask(
    document.getElementById('phone'), {
        mask: '(000) 000-0000',
        lazy: false
    });
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() - 4);
const currentDateStr = currentDate.toISOString().split('T')[0];
const minDate = `${new Date().getFullYear() - 100}-01-01`;
document.getElementById('dateOfBirth').setAttribute('min', minDate);
document.getElementById('dateOfBirth').setAttribute('max', currentDateStr);

document.getElementById("photo").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("profileImage").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.querySelector(".profile-picture-container").addEventListener("click", function() {
    document.getElementById("photo").click();
});

let current_role = null;
let current_user = null;

document.addEventListener("DOMContentLoaded", () => {
    const selectorDisplay = document.getElementById("selectorDisplay");
    const dropdown = document.getElementById("dropdown");
    const dropdownList = document.getElementById("dropdownList");
    toggleReadonly(true);

    let users = [];

    async function fetchUsers() {
        try {
            const response = await fetch('/api/users', {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${apiToken}`
                },
            });
            if (!response.ok) throw new Error("Failed to fetch users");

            users = await response.json();

            users.sort((a, b) => a.email.localeCompare(b.email));

            renderDropdown();
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    function renderDropdown() {
        dropdownList.innerHTML = "";
        users.forEach(user => {
            const listItem = document.createElement("li");
            listItem.textContent = user.email;
            listItem.dataset.id = user.id;
            listItem.addEventListener("click", () => selectUser(user));
            dropdownList.appendChild(listItem);
        });
    }

    function populateForm(user) {
        document.getElementById("username").value = user.username || "";
        document.getElementById("firstName").value = user.first_name || "";
        document.getElementById("lastName").value = user.last_name || "";
        document.getElementById("phone").value = user.phone || "";
        document.getElementById("dateOfBirth").value = user.birthdate || "";
        document.getElementById("address").value = user.address || "";
        document.getElementById("role").value = user.role_id || "";

        const profileImage = document.getElementById("profileImage");
        profileImage.src = `/${user.photo}` || "/storage/img/avatar.jpg";
    }

    function toggleReadonly(isReadOnly) {
        const fields = [
            "username", "password", "passwordConfirmation",
            "firstName", "lastName", "phone", "dateOfBirth", "address"
        ];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (isReadOnly) {
                field.setAttribute("readonly", "true");
            } else {
                field.removeAttribute("readonly");
            }
        });
        const role_sel = document.getElementById("role");
        if (isReadOnly) {
            role_sel.setAttribute("disabled", "true");
        } else {
            role_sel.removeAttribute("disabled");
        }
    }

    function selectUser(user) {
        current_user = user;
        selectorDisplay.textContent = user.email;
        selectorDisplay.dataset.id = user.id;
        dropdown.style.display = "none";
        populateForm(user);

        toggleReadonly(false);
    }

    selectorDisplay.addEventListener("click", () => {
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".custom-selector")) {
            dropdown.style.display = "none";
        }
    });
    const role_selector = document.getElementById("role");

    async function fetchRoles() {
        try {
            const response = await fetch('http://localhost:8000/api/roles', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
            });
            if (!response.ok) throw new Error("Failed to fetch roles");

            const res_roles = await response.json();
            const roles = res_roles.data;

            if (roles.length === 0) {
                console.warn("No roles received from the API.");
                return;
            }

            roles.sort((a, b) => a.name.localeCompare(b.name));

            roles.forEach(role => {
                const option = document.createElement("option");
                option.value = role.id;
                option.textContent = role.name;
                role_selector.appendChild(option);
            });
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    }

    role_selector.addEventListener("change", (event) => {
        const roleId = event.target.value;
        if (roleId) {
            current_role = roleId;
        }
    });

    fetchUsers();
    fetchRoles();

    async function urlToFile(url, fileName = null) {
        const response = await fetch(`/${url}`);
        const data = await response.blob();
        const name = fileName || url.split('/').pop();
        const mimeType = data.type || 'image/jpg';

        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
            throw new Error('Invalid file type. Only jpeg, jpg, or png are allowed.');
        }

        return new File([data], name, { type: mimeType });

    }

    document.getElementById("updateForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const passwordConfirmation = document.getElementById("passwordConfirmation").value
        const photoFile = document.getElementById("photo").files[0];
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const dateOfBirth = document.getElementById("dateOfBirth").value;
        const phone = document.getElementById("phone").value;
        const address = document.getElementById("address").value;
        const role_id = document.getElementById("role").value;

        const formData = new FormData();
        formData.append("username", username);
        if(password.length >= 4 && passwordConfirmation.length >= 4)
        {
            if(password === passwordConfirmation)
            {
                formData.append("password", password);
                formData.append("password_confirmation", passwordConfirmation);
            } else {
                alert(`Invalid confirm password.`);
                return
            }
        }

        if (photoFile) {
            formData.append("photo", photoFile);
        } else if (current_user.photo) {
            if (current_user.photo) {
                const originalFileName = current_user.photo.split('/').pop();
                try {
                    const photoFileFromUrl = await urlToFile(current_user.photo, originalFileName);
                    formData.append("photo", photoFileFromUrl);
                } catch (error) {
                    console.error("File type error:", error);
                    alert("The photo must be of type jpeg, jpg, or png.");
                    return;
                }
            }

        }
        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("birthdate", dateOfBirth);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("role_id", role_id);

        try {
            const response = await fetch(`http://localhost:8000/api/users_admin/${current_user.id}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                body: formData,
            });

            if (response.ok) {
                alert("Successful update!");
                fetchUsers();
            } else {
                const error = await response.json();
                console.error("Error response:", error);
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    });
});

