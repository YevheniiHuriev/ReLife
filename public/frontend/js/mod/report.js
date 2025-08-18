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
                <li><a href="/frontend/html/mod/user.html">Users</a></li>
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

const btnAll = document.getElementById("btn-all");
const btnNew = document.getElementById("btn-new");
const allReports = document.querySelector(".all-reports");
const newReports = document.querySelector(".new-reports");

btnNew.classList.add("active");
allReports.style.display = "none";
newReports.style.display = "block";

function activateButton(button) {
    document.querySelectorAll('.options-con button').forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    if (button === btnAll) {
        allReports.style.display = "block";
        newReports.style.display = "none";
    } else if (button === btnNew) {
        allReports.style.display = "none";
        newReports.style.display = "block";
    }
}

btnAll.addEventListener("focus", () => activateButton(btnAll));
btnNew.addEventListener("focus", () => activateButton(btnNew));

const searchInput = document.querySelector(".search-input");

async function loadSearchedReports(email) {
    try {
        const response = await fetch("http://localhost:8000/api/reports", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
        });
        if(response.ok)
        {
            const result = await response.json();
            const reports = result.data;


            const filteredReports = reports.filter(r =>
                r.comment.user.email.toLowerCase().includes(email.toLowerCase())
            );

            reportsTableBody.innerHTML = "";

            let i = 1;

            filteredReports.reverse().forEach(report => {
                const row = document.createElement("tr");

                row.innerHTML = `
                <td>${i}</td>
                <td><button class="show-comment" data-comment-id="${report.comment.id}">Show Comment</button></td>
                <td><button class="show-user" data-user-id='${report.reporter_id}'>${report.user.username}</button></td>
                <td class="reason">${report.reason}</td>
                <td>${new Date(report.created_at).toLocaleString('uk-UA', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false })}</td>
                <td><i class="fa-solid fa-circle" style="color: ${report.isChecked ? 'green' : 'red'};"></i></td>
                <td>${report.isChecked ? report.verdict : ' - '}</td>
            `;

                reportsTableBody.appendChild(row);
                i++;
            });

            document.querySelectorAll(".show-comment").forEach(button => {
                button.addEventListener("click", async (e) => {
                    const commentId = e.target.getAttribute("data-comment-id");
                    await loadComment(commentId);
                    commentModal.style.display = "block";
                });
            });

            document.querySelectorAll(".show-user").forEach(button => {
                button.addEventListener("click", async (e) => {
                    const userId = e.target.getAttribute("data-user-id");
                    await loadUser(userId);
                    userModal.style.display = "block";
                });
            });
        }

    } catch (error) {
        console.error("Error loading reports", error);
    }
}

searchInput.addEventListener("input", (event) => {
    event.preventDefault();
    const email = searchInput.value.trim();

    if (email === "") {
        loadReports();
    } else {
        loadSearchedReports(email);
    }
});

const reportsTableBody = document.getElementById("reportsTableBody");
const commentModal = document.getElementById("commentModal");
const closeModal = document.getElementById("closeModal");
const commentsContainer = document.querySelector(".comments");
const userModal = document.getElementById("userModal")
const userContainer = document.querySelector(".user-mod");
const userBContainer = document.querySelector(".ban-content-user");
const userWContainer = document.querySelector(".modal-content-user");

async function loadReports() {
    try {
        const response = await fetch("http://localhost:8000/api/reports", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
        });
        const result = await response.json();

        reportsTableBody.innerHTML = "";

        let i = 1;

        result.data.reverse().forEach(report => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${i}</td>
                <td><button class="show-comment" data-comment-id="${report.comment.id}">Show Comment</button></td>
                <td><button class="show-user" data-user-id='${report.reporter_id}'>${report.user.username}</button></td>
                <td>${report.reason}</td>
                <td>${new Date(report.created_at).toLocaleString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false })}</td>
                <td><i class="fa-solid fa-circle" style="color: ${report.isChecked ? 'green' : 'red'};"></i></td>
                <td>${report.isChecked ? report.verdict : ' - '}</td>
            `;

            reportsTableBody.appendChild(row);
            i++;
        });

        document.querySelectorAll(".show-comment").forEach(button => {
            button.addEventListener("click", async (e) => {
                const commentId = e.target.getAttribute("data-comment-id");
                await loadComment(commentId);
                commentModal.style.display = "block";
            });
        });

        document.querySelectorAll(".show-user").forEach(button => {
            button.addEventListener("click", async (e) => {
                const userId = e.target.getAttribute("data-user-id");
                await loadUser(userId);
                userModal.style.display = "block";
            });
        });
    } catch (error) {
        console.error("Error downloading reports:", error);
    }
}

async function loadUser(userId) {
    try {
        const user_response = await fetch(`http://localhost:8000/api/users/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
        });

        if (!user_response.ok) {
            console.log(`HTTP Error: ${user_response.status}`);
            return;
        }

        const { data: user } = await user_response.json();

        if (!user) {
            userContainer.innerHTML = `<p>User not found.</p>`;
            return;
        }

        userContainer.innerHTML = `
            <div class="user">
                <div class="user-body">
                    <img src="/${user.photo}" alt="${user.username}" class="comment-photo">
                    <div class="user-info">
                        <p class="userName"><b>Username:</b> ${user.username}</p>
                        <p class="userEnamil"><b>Email</b>: <span id="copyEmail">${user.email}</span></p>
                    </div>
                </div>
                <div class="user-footer">
                    <button class="btn-warning-user">Warning</button>
                    <button class="btn-ban-user">Ban</button>
                </div>
            </div>
        `;

        document.getElementById("copyEmail").addEventListener("click", function () {
            const email = this.textContent;
            navigator.clipboard.writeText(email).then(() => {
                this.style.color="gray";
            }).catch(err => {
                console.error("Copy error: ", err);
            });
        });

        const warningButton = document.querySelector(".btn-warning-user");
        const banButton = document.querySelector(".btn-ban-user");

        warningButton.addEventListener("click", () => {
            const confirmation = confirm("Are you sure you want to warn this user?");

            if (confirmation) {
                alert("The user has been successfully warned!")
                feedbackFromAdministration(userId,
                    "Hello.\nYour complaint has been reviewed and rejected.\nPlease note: submitting baseless complaints may result in strict penalties! Respect the moderators' work and file complaints only for valid reasons.");
                userModal.style.display = "none";
            }
        });

        banButton.addEventListener("click", () => {
            userWContainer.style.display = "none";
            userBContainer.style.display = "block";
            showBanOptions(userId);
        });

    } catch (error) {
        console.error("Error when uploading a user:", error);
    }
}

function showBanOptions(userId) {
    const userBDurations = [
        { label: "3 hours", value: 3 },
        { label: "6 hours", value: 6 },
        { label: "12 hours", value: 12 },
        { label: "1 day", value: 24 },
        { label: "1 week", value: 168 },
        { label: "1 month", value: 720 },
        { label: "1 year", value: 8760 },
        { label: "Custom", value: "custom" },
    ];

    userBContainer.innerHTML = `
        <div class="ban-options">
            <p>Select a duration for ban:</p>
            <div class="duration-ban-user-list">
                ${userBDurations.map(d => `<button class="duration-ban-user-btn" data-value="${d.value}">${d.label}</button>`).join("")}
            </div>
            <input type="number" id="custom-duration" placeholder="Enter hours" style="display: none;">
            <div class="ban-footer">
                <button id="ban-user" disabled>Ban</button>
                <button id="cancel-ban">Cancel</button>
            </div>
        </div>
    `;

    const durationBanButtons = document.querySelectorAll(".duration-ban-user-btn");
    const customDurationInput = document.getElementById("custom-duration");
    const banButton = document.getElementById("ban-user");
    const cancelButton = document.getElementById("cancel-ban");

    durationBanButtons.forEach(button => {
        button.addEventListener("click", () => {
            durationBanButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");

            if (button.dataset.value === "custom") {
                customDurationInput.style.display = "block";
                customDurationInput.focus();
                banButton.disabled = true;
            } else {
                customDurationInput.style.display = "none";
                banButton.disabled = false;
                banButton.dataset.duration = button.dataset.value;
            }
        });
    });

    customDurationInput.addEventListener("input", () => {
        const value = customDurationInput.value;
        if (value && !isNaN(value) && value > 0) {
            banButton.disabled = false;
            banButton.dataset.duration = value;
        } else {
            banButton.disabled = true;
        }
    });

    cancelButton.addEventListener("click", () => {
        userBContainer.style.display = "none";
        userWContainer.style.display = "block";
    });

    banButton.addEventListener("click", async () => {
        const banDuration = banButton.dataset.duration;

        if (!banDuration) {
            alert("Please select a valid duration.");
            return;
        }

        try {

            const response = await fetch(`http://localhost:8000/api/user_bans`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    ban_duration: banDuration
                })
            });

            if (response.ok) {
                feedbackFromAdministration(userId,
                    "Hello.\nYou have been banned for ignoring warnings about baseless complaints.\nPlease note: further baseless complaints may result in a longer ban! Respect the moderators' work and submit complaints only for valid reasons.")
                alert("User has been banned successfully.");
                userBContainer.style.display = "none";
                userWContainer.style.display = "block";
                userModal.style.display = "none";
            } else {
                console.log(`HTTP Error: ${response.status}`);
            }

        } catch (error) {
            console.error("Error when creating a ban:", error);
        }
    });
}

const closeButtonUser = document.querySelector('.close-user');
closeButtonUser.addEventListener('click', () => {
    userModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === commentModal) {
        commentModal.style.display = 'none';
    }
    if (event.target === userModal) {
        userModal.style.display = 'none';
        userBContainer.style.display = "none";
        userWContainer.style.display = "block";
    }
});

async function loadNewReports() {
    try {
        const response = await fetch("http://localhost:8000/api/reports", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
        });

        const result = await response.json();

        newReportsTableBody.innerHTML = "";

        let i = 1;

        result.data.filter(report => !report.isChecked).reverse().forEach(report => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${i}</td>
                <td><button class="show-comment" data-comment-id="${report.comment.id}">Show Comment</button></td>
                <td><button class="show-user" data-user-id='${report.reporter_id}'>${report.user.username}</button></td>
                <td class="reason">${report.reason}</td>
                <td>${new Date(report.created_at).toLocaleString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false })}</td>
                <td><i class="fa-solid fa-circle" style="color: red;"></i></td>
                <td class="options">
                    <button class="reject-btn">Reject</button>
                    <button class="warning-btn">Warning</button>
                    <button class="mute-btn">Mute</button>
                    <button class="ban-btn">Ban</button>
                </td>
            `;

            newReportsTableBody.appendChild(row);

            row.querySelector(".reject-btn").addEventListener("click", () => {
                try {
                    fetch(`/api/reports/${report.id}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiToken}`
                        },
                        body: JSON.stringify({
                            verdict: `The report was rejected`,
                        })
                    });

                    loadNewReports();
                    loadReports();
                } catch (error) {
                    console.error(error);
                }
            });

            row.querySelector(".mute-btn").addEventListener("click", () => {
                showDurationModal(report.id, "Mute", report.comment.user_id);
                feedbackFromAdministration(report.comment.user_id,
                    "Hello.\nYou have been muted for severe violations of the rules.\nPlease be aware: further violations may result in a longer mute or even a ban!");
            });
            row.querySelector(".ban-btn").addEventListener("click", () => {
                showDurationModal(report.id, "Ban", report.comment.user_id);
                feedbackFromAdministration(report.comment.user_id,
                    "Hello.\nYou have been banned for repeated violations of the rules.\nPlease be aware: further violations may result in a longer ban!");
            });

            row.querySelector(".warning-btn").addEventListener("click", () => {
                try {
                    fetch(`/api/reports/${report.id}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiToken}`
                        },
                        body: JSON.stringify({
                            verdict: `The user received a warning`,
                        })
                    });

                    feedbackFromAdministration(report.comment.user_id,
                        "Hello.\nWe have received a complaint about your comment from another user.\nThere are a few minor rules violations in your comment. Please follow the rules to avoid further consequences.");

                    loadNewReports();
                    loadReports();
                } catch (error) {
                    console.error(error);
                }
            });
            i++;

            loaderOff();
        });

        document.querySelectorAll(".show-comment").forEach(button => {
            button.addEventListener("click", async (e) => {
                const commentId = e.target.getAttribute("data-comment-id");
                await loadComment(commentId);
                commentModal.style.display = "block";
            });
        });

        document.querySelectorAll(".show-user").forEach(button => {
            button.addEventListener("click", async (e) => {
                const userId = e.target.getAttribute("data-user-id");
                await loadUser(userId);
                userModal.style.display = "block";
            });
        });
    } catch (error) {
        console.error("Error loading new reports:", error);
    }
}

async function feedbackFromAdministration (receiverId, message) {
    // Get admin ID
    const systemResponse = await fetch(`http://localhost:8000/api/system_bot`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiToken}`
        }
    });

    if (systemResponse.ok) {
        const botData = await systemResponse.json();
        const botId = botData.bot_id;

        const checkChatResponse = await fetch(`http://localhost:8000/api/administration`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
            body: JSON.stringify({
                receiver_id: receiverId
            })
        });

        if (checkChatResponse.ok) {
            const checkChatData = await checkChatResponse.json();

            let chatId;
            if (checkChatData.chat_id) {
                chatId = checkChatData.chat_id;
            } else {
                const chatResponse = await fetch(`http://localhost:8000/api/chats`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiToken}`
                    },
                    body: JSON.stringify({
                        sender_id: botId,
                        receiver_id: receiverId,
                        title: "Administration"
                    })
                });

                if (chatResponse.ok) {
                    const chatData = await chatResponse.json();
                    chatId = chatData.chat.id;
                } else {
                    console.error("Failed to create chat.");
                    return;
                }
            }

            const messageResponse = await fetch(`http://localhost:8000/api/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    sender_id: botId,
                    content: message
                })
            });

            if (messageResponse.ok) {
            } else {
                console.error("Failed to create message.");
            }
        } else {
            console.error("Failed to check for existing chat.");
        }
    } else {
        console.error("Failed to fetch admin ID.");
    }
}

function showDurationModal(reportId, action, userId) {
    const durations = [
        { label: "3 hours", value: 3 },
        { label: "6 hours", value: 6 },
        { label: "12 hours", value: 12 },
        { label: "1 day", value: 24 },
        { label: "1 week", value: 168 },
        { label: "1 month", value: 720 },
        { label: "1 year", value: 8760 },
        { label: "Custom", value: "custom" },
    ];

    const modalContainer = document.getElementById("mute_ban_modal");

    modalContainer.innerHTML = `
        <div class="report-modal-content">
            <p>Select a duration for ${action.toLowerCase()}:</p>
            <ul class="duration-list">
                ${durations
        .map(
            (duration) =>
                `<li><button class="duration-button" data-value="${duration.value}">${duration.label}</button></li>`
        )
        .join("")}
            </ul>
            <input type="number" id="customDurationInput" placeholder="Enter hours for ${action.toLowerCase()}" style="display: none;" />
            <div class="modal-actions">
                <button id="submitDuration" disabled>Submit</button>
                <button id="cancelModal">Cancel</button>
            </div>
        </div>
    `;

    modalContainer.style.display = "block";

    const durationButtons = modalContainer.querySelectorAll(".duration-button");
    const customDurationInput = modalContainer.querySelector("#customDurationInput");
    const submitButton = modalContainer.querySelector("#submitDuration");
    const cancelButton = modalContainer.querySelector("#cancelModal");

    let selectedDuration = null;

    durationButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectedDuration = button.dataset.value;

            durationButtons.forEach((btn) => btn.classList.remove("selected"));
            button.classList.add("selected");

            if (selectedDuration === "custom") {
                customDurationInput.style.display = "block";
                customDurationInput.focus();
            } else {
                customDurationInput.style.display = "none";
                customDurationInput.value = "";
            }

            submitButton.disabled = false;
        });
    });

    cancelButton.addEventListener("click", closeModal);

    submitButton.addEventListener("click", async () => {
        let duration;

        if (selectedDuration === "custom") {
            duration = parseInt(customDurationInput.value, 10);
            if (isNaN(duration) || duration <= 0) {
                alert("Please enter a valid custom duration in hours.");
                return;
            }
        } else {
            duration = parseInt(selectedDuration, 10);
        }

        try {
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const banResponse = await fetch(`/api/user_bans/active`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    'userId': userId,
                    'userTimeZone': userTimeZone,
                }),
            });

            const muteResponse = await fetch(`/api/user_mutes/active`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    'userId': userId,
                    'userTimeZone': userTimeZone,
                }),
            });

            const banData = banResponse.ok ? await banResponse.json() : null;
            const muteData = muteResponse.ok ? await muteResponse.json() : null;

            const currentTime = new Date();

            if (banData?.data) {
                const banExpiry = new Date(banData.data.created_at);
                banExpiry.setHours(banExpiry.getHours() + banData.data.ban_duration);
                const banRemaining = Math.ceil((banExpiry - currentTime) / (1000 * 60 * 60));

                if (action === "Mute") {
                    alert("The reader is already banned.");
                    await addVerdict(reportId, "The reader is banned");
                    loadNewReports();
                    loadReports();
                    return;
                }

                if (action === "Ban") {
                    const confirmBan = confirm(`The user has an active ban with ${banRemaining} hours remaining. Do you want to extend the ban?`);
                    if (!confirmBan) {
                        await addVerdict(reportId, "The reader is banned");
                        loadNewReports();
                        loadReports();
                        return;
                    }

                    duration += banRemaining;

                    await deleteActiveRecord(`/api/user_bans/${banData.data.id}`);
                }
            } else if(banData?.expired) {

                if (action === "Ban") {
                    await deleteActiveRecord(`/api/user_bans/${banData.expired.id}`);
                }
            }

            if (muteData?.data) {
                const muteExpiry = new Date(muteData.data.created_at);
                muteExpiry.setHours(muteExpiry.getHours() + muteData.data.mute_duration);
                const muteRemaining = Math.ceil((muteExpiry - currentTime) / (1000 * 60 * 60));

                if (action === "Ban") {
                    const confirmBan = confirm(`The user has an active mute with ${muteRemaining} hours remaining. Do you want to proceed with the ban?`);
                    if (!confirmBan) {
                        await addVerdict(reportId, "The reader is muted");
                        loadNewReports();
                        loadReports();
                        return;
                    }

                    await deleteActiveRecord(`/api/user_mutes/${muteData.data.id}`);
                } else if (action === "Mute") {
                    const confirmMute = confirm(`The user has an active mute with ${muteRemaining} hours remaining. Do you want to extend the mute?`);
                    if (!confirmMute) {
                        await addVerdict(reportId, "The reader is muted");
                        loadNewReports();
                        loadReports();
                        return;
                    }

                    duration += muteRemaining;

                    await deleteActiveRecord(`/api/user_mutes/${muteData.data.id}`);
                }
            } else if(muteData?.expired) {

                if (action === "Mute") {
                    await deleteActiveRecord(`/api/user_mutes/${muteData.expired.id}`);
                }
            }

            const endpoint = `/api/user_${action.toLowerCase()}s`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    [`${action.toLowerCase()}_duration`]: duration
                })
            });

            const data = await response.json();
            if (data.message) {
                alert(data.message);

                await addVerdict(reportId, `${action} for ${duration} hours`);

                loadNewReports();
                loadReports();
            }

        } catch (error) {
            console.error("Error:", error);
        } finally {
            closeModal();
        }
    });

    async function addVerdict(reportId, verdict) {
        await fetch(`/api/reports/${reportId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
            body: JSON.stringify({
                verdict
            })
        });
    }

    async function deleteActiveRecord(url) {
        await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${apiToken}`
            }
        });
    }

    function closeModal() {
        modalContainer.style.display = "none";
        modalContainer.innerHTML = "";
    }

    window.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            modalContainer.style.display = 'none';
        }
    });
}

async function loadComment(commentId) {
    try {
        const response = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("api_token")}`
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const {data: comment} = await response.json();

        if (!comment || !comment.user) {
            commentsContainer.innerHTML = `<p>User or comment not found.</p>`;
            return;
        }

        commentsContainer.innerHTML = `
            <div class="comment">
                <div class="comment-header">
                    <img src="/${comment.user.photo}" alt="${comment.user.username}" class="comment-photo">
                    <div class="comment-info">
                        <p style="margin-bottom: 5px"><b>Username: </b>${comment.user.username}</p>
                        <p><b>Email: </b><span id="copyCommentEmail">${comment.user.email}</span></p>
                    </div>
                </div>
                <div class="comment-date">Comment date: ${new Date(comment.created_at).toLocaleString()}</div>
                <div class="comment-body">
                    <p class="comment-content">${comment.content}</p>
                </div>
                <div class="comment-footer">
                    <button class="update-button" id="update_comment"><i class="fa-regular fa-pen-to-square"></i></button>
                </div>
            </div>
        `;

        document.getElementById("copyCommentEmail").addEventListener("click", function () {
            const email = this.textContent;
            navigator.clipboard.writeText(email).then(() => {
                this.style.color="gray";
            }).catch(err => {
                console.error("Copy error: ", err);
            });
        });

        const commentDiv = commentsContainer.querySelector(".comment");
        const updateButton = commentDiv.querySelector(".update-button");
        updateButton.addEventListener("click", () => toggleEditMode(commentDiv, commentId));
    } catch (error) {
        console.error("Error uploading a comment:", error);
    }
}

function toggleEditMode(commentDiv, commentId) {
    const commentContent = commentDiv.querySelector(".comment-content");
    const commentFooter = commentDiv.querySelector(".comment-footer");
    const updateButton = commentFooter.querySelector(".update-button");

    if (updateButton.id === "update_comment") {
        const currentContent = commentContent.textContent;
        commentContent.innerHTML = `<textarea class="edit-textarea">${currentContent}</textarea>`;
        updateButton.innerHTML = "<i class=\"fa-solid fa-check\"></i>";
        updateButton.id = "edit_comment";

        const editTextarea = document.querySelector(".edit-textarea");
        if (editTextarea) {
            editTextarea.focus();
            editTextarea.selectionStart = editTextarea.value.length;
            editTextarea.selectionEnd = editTextarea.value.length;
        }

        const cancelButton = document.createElement("button");
        cancelButton.classList.add("cancel-button");
        cancelButton.innerHTML = "<i class=\"fa-solid fa-xmark\"></i>";
        commentFooter.appendChild(cancelButton);

        cancelButton.addEventListener("click", () => {
            commentContent.textContent = currentContent; // Повертаємо старе значення
            updateButton.innerHTML = "<i class=\"fa-regular fa-pen-to-square\"></i>";
            updateButton.id = "update_comment";
            cancelButton.remove();
        });
    } else {
        const newContent = commentDiv.querySelector(".edit-textarea").value;
        updateComment(commentId, newContent, commentDiv).then((success) => {
            if (success) {
                commentContent.textContent = newContent;
            }
        });
        updateButton.innerHTML = "<i class=\"fa-regular fa-pen-to-square\"></i>";
        updateButton.id = "update_comment";
        const cancelButton = commentFooter.querySelector(".cancel-button");
        if (cancelButton) cancelButton.remove();
    }
}

async function updateComment(commentId, newContent, commentDiv) {
    if (!newContent || newContent.length < 1) {
        alert("The comment must contain at least 1 character.");
        return false;
    }
    try {
        const response = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
            body: JSON.stringify({ content: newContent })
        });

        if (response.ok) {
            return true;
            loadComment();
        } else {
            console.error(`Failed to update comment: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error("Error updating a comment:", error);
        return false;
    }
}

closeModal.addEventListener("click", () => {
    commentModal.style.display = "none";
});

loadReports();
loadNewReports();
