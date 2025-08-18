const loader = document.querySelector(".load");
const bodyPage = document.querySelector(".body-page");
loader.style.display="block";
function loaderOff() {
    loader.style.display="none";
    bodyPage.style.display="block";
}

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("id");

async function loadBookData() {
    try {
        const response = await fetch(`http://localhost:8000/api/books/${bookId}`);
        if (response.ok) {
            const result = await response.json();
            const book = result.data;

            document.getElementById("coverImage").src = `/${book.cover_image}`;
            document.getElementById("bookTitle").textContent = book.title;
            document.getElementById("bookDescription").textContent = book.description;
            document.getElementById("author").textContent = book.authors.map(author => author.name).join(", ");
            document.getElementById("year").textContent = book.year;
            document.getElementById("pages").textContent = book.pages;
            document.getElementById("price").textContent = book.price;
            document.getElementById("genres").textContent = book.genres.map(genre => genre.name).join(", ");
        } else {
            console.error("Could not load book data");
        }
    } catch (error) {
        console.error("Error loading book data:", error);
    }
}

loadBookData();

document.addEventListener("DOMContentLoaded", async () => {
    const bookOptionsContainer = document.querySelector(".book-options");

    async function updateFavoritesButton(isFavorite, favoriteId = null) {
        if (isFavorite) {
            const addToFavoritesButton = bookOptionsContainer.querySelector("#addToFavoritesButton");
            if (addToFavoritesButton) {
                addToFavoritesButton.outerHTML = `
                <button id="removeFromFavoritesButton">Delete from favorites</button>`;
            }

            const removeFromFavoritesButton = document.getElementById("removeFromFavoritesButton");
            if (removeFromFavoritesButton) {
                removeFromFavoritesButton.addEventListener("click", async () => {
                    try {
                        if (favoriteId) {
                            const deleteResponse = await fetch(`/api/favorites/${favoriteId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${apiToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (deleteResponse.ok) {
                                alert("Book removed from favorites.");
                                updateFavoritesButton(false);
                            } else {
                                console.error("Error removing book from favorites:", await deleteResponse.json());
                                alert("Failed to remove book from favorites. Please try again.");
                            }
                        } else {
                            console.error("Favorite ID not found for removal.");
                        }
                    } catch (error) {
                        console.error("Error removing book from favorites:", error);
                    }
                });
            }
        } else {
            const removeFromFavoritesButton = bookOptionsContainer.querySelector("#removeFromFavoritesButton");
            if (removeFromFavoritesButton) {
                removeFromFavoritesButton.outerHTML = `
                <button id="addToFavoritesButton">Add to favorites</button>`;
            }

            const addToFavoritesButton = document.getElementById("addToFavoritesButton");
            if (addToFavoritesButton) {
                addToFavoritesButton.addEventListener("click", async () => {
                    try {
                        const response = await fetch('/api/favorites', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiToken}`
                            },
                            body: JSON.stringify({ book_id: bookId })
                        });

                        const data = await response.json();
                        if (data.data) {
                            alert("Book added to favorites.");
                            updateFavoritesButton(true, data.data.id); // Передаємо ID обраного
                        } else if (data.message) {
                            alert(data.message);
                        }
                    } catch (error) {
                        console.error("Error adding book to favorites:", error);
                        alert("Failed to add book to favorites. Please try again.");
                    }
                });
            }
        }
    }

    async function checkPurchaseStatus() {
        try {
            let isFavorite = false;
            let favoriteId = null;

            // Перевіряємо, чи книга в favorites
            if (apiToken) {
                const favoritesResponse = await fetch(`/api/favorites`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${apiToken}`,
                        "Content-Type": "application/json"
                    }
                });

                if (favoritesResponse.ok) {
                    const favoritesData = await favoritesResponse.json();
                    const favorite = favoritesData.data.find(fav => fav.book_id === parseInt(bookId));
                    if (favorite) {
                        isFavorite = true;
                        favoriteId = favorite.id;
                    }
                }

                const response = await fetch(`/api/purchases/${bookId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${apiToken}`,
                        "Content-Type": "application/json"
                    }
                });
                const result = await response.json();

                if (!result.data || !result.data.is_completed) {
                    bookOptionsContainer.innerHTML = `
                    <button id="readDemoButton">Read demo</button>
                    <button id="${isFavorite ? "removeFromFavoritesButton" : "addToFavoritesButton"}">
                        ${isFavorite ? "Delete from favorites" : "Add to favorites"}
                    </button>
                    <button id="buyButton">Buy</button>`;

                    const readDemoButton = document.getElementById("readDemoButton");
                    const buyButton = document.getElementById("buyButton");

                    readDemoButton.addEventListener("click", () => {
                        window.location.href = `/frontend/html/book/demo.html?id=${bookId}`;
                    });

                    buyButton.addEventListener("click", () => {
                        window.location.href = `../../html/book/purchase.html?id=${bookId}`;
                    });

                    await updateFavoritesButton(isFavorite, favoriteId);
                } else if (result.data.is_completed) {

                    bookOptionsContainer.innerHTML = `<button id="readButton">Read</button>
                                                      <button id="noteButton">Note</button>`;

                    const infoComments = document.querySelector(".info-comments");
                    if (infoComments) {
                        infoComments.style.minHeight = "560px";
                    }

                    const readButton = document.getElementById("readButton");
                    readButton.addEventListener("click", () => {
                        window.location.href = `../../html/book/read.html?id=${bookId}`;
                    });

                    const noteModal = document.getElementById('noteModal');
                    const noteTextarea = document.getElementById('noteTextarea');
                    const saveNote = document.getElementById('saveNote');
                    const closeNoteBtn = document.querySelector('.close-note');
                    const noteButton = document.getElementById("noteButton");

                    noteButton.addEventListener("click", async () => {
                        noteModal.style.display = 'block';

                        if (noteTextarea) {
                            noteTextarea.focus();
                            noteTextarea.selectionStart = noteTextarea.value.length;
                            noteTextarea.selectionEnd = noteTextarea.value.length;
                        }
                    });

                    noteTextarea.value = '';
                    try {
                        const note = await fetchNote();
                        if (note) {
                            noteTextarea.value = note.note;
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

                    saveNote.addEventListener('click', async () => {
                        const noteText = noteTextarea.value.trim();

                        try {
                            const noteExists = await fetchNote();

                            if (noteExists) {
                                if (!noteText) {
                                    await deleteNote(noteExists.id);
                                    alert('Note saved successfully');
                                    return;
                                }
                                await updateNote(noteText);
                            } else {
                                if (!noteText) {
                                    alert('Note cannot be empty');
                                    return;
                                }
                                await createNote(noteText);
                            }

                            alert('Note saved successfully');
                        } catch (error) {
                            console.error('Error saving note:', error.message);
                        }
                    });
                    async function fetchNote() {
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
                    async function updateNote(noteText) {
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
                    async function createNote(noteText) {
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
                }
            } else {
                bookOptionsContainer.innerHTML = `<button id="readDemoButton">Read demo</button>`;
                const readDemoButton = document.getElementById("readDemoButton");
                readDemoButton.addEventListener("click", () => {
                    window.location.href = `/frontend/html/book/demo.html?id=${bookId}`;
                });
                const infoComments = document.querySelector(".info-comments");
                if (infoComments) {
                    infoComments.style.minHeight = "560px";
                }
            }
        } catch (error) {
            console.error("Error checking purchase status:", error);
        }
    }

    checkPurchaseStatus();
});

const btnInfo = document.getElementById("btn-info");
const btnComments = document.getElementById("btn-comments");
const infoCon = document.querySelector(".info-con");
const commentsCon = document.querySelector(".comments-con");
const modalRule = document.getElementById('modal-rule');

btnInfo.classList.add("active");
infoCon.style.display = "block";
commentsCon.style.display = "none";

function activateButton(button) {
    document.querySelectorAll('.options-con button').forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    if (button === btnInfo) {
        infoCon.style.display = "block";
        commentsCon.style.display = "none";
    } else if (button === btnComments) {
        infoCon.style.display = "none";
        commentsCon.style.display = "block";

        if(apiToken)
        {
            if (!localStorage.getItem('modalOpened')) {
                modalRule.style.display = 'flex';
                localStorage.setItem('modalOpened', 'true');
            }
        }
    }
}

btnInfo.addEventListener("focus", () => activateButton(btnInfo));
btnComments.addEventListener("focus", () => activateButton(btnComments));

document.addEventListener("DOMContentLoaded", async () => {
    const commentsContainer = document.querySelector(".comments");
    const commentInput = document.getElementById("commentInput");
    const sendCommentButton = document.getElementById("sendCommentButton");

    async function getAuthenticatedUser() {
        try {
            if(apiToken) {
                const response = await fetch('/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                return result.success ? result.data : null;
            }
        } catch (error) {
            console.error("Error when receiving a user profile:", error);
            return null;
        }
    }

    const authenticatedUser = await getAuthenticatedUser();
    const userId = authenticatedUser ? authenticatedUser.id : null;
    const userRole = authenticatedUser ? authenticatedUser.role.name : "reader";

    async function loadComments() {
        try {
            const response = await fetch(`http://localhost:8000/api/comments`);
            const result = await response.json();

            commentsContainer.innerHTML = "";

            const filteredComments = result.data.filter(comment => comment.book_id === parseInt(bookId));

            filteredComments.reverse().forEach(comment => {
                const commentDiv = document.createElement("div");
                commentDiv.classList.add("comment");

                const createdAt = new Date(comment.created_at);
                const formattedDate = `${createdAt.getFullYear()}.${String(createdAt.getMonth() + 1).padStart(2, '0')}.${String(createdAt.getDate()).padStart(2, '0')}
                ${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}`;


                commentDiv.innerHTML = `
                <div class="comment-header">
                    <img src="/${comment.user.photo}" alt="${comment.user.username}" class="comment-photo">
                    <div class="comment-info">
                        <a href="/frontend/html/user/show.html?id=${comment.user.id}" class="comment-username">${comment.user.username}</a>
                        <span class="comment-date">${formattedDate}</span>
                    </div>
                </div>
                <div class="comment-body">
                    <p class="comment-content">${comment.content}</p>
                </div>
                <div class="comment-footer">
                    ${comment.user_id !== userId ? `<button class="report-button"><span class="tooltip" data-tooltip="Report"><i class="fa-regular fa-flag"></i></span></button>` : ""}
                    ${canEditOrDelete(comment.user_id) ? `
                        <button id="update_comment" class="edit-button"><span class="tooltip" data-tooltip="Update"><i class="fa-regular fa-pen-to-square"></i></span></button>
                        <button class="delete-button"><span class="tooltip" data-tooltip="Delete"><i class="fa-regular fa-trash-can"></i></span></button>
                    ` : ""}
                </div>
            `;

                commentsContainer.appendChild(commentDiv);

                if (comment.user_id !== userId) {
                    const reportButton = commentDiv.querySelector(".report-button");
                    reportButton.addEventListener("click", () => reportComment(comment.id));
                }

                if (canEditOrDelete(comment.user_id)) {
                    const editButton = commentDiv.querySelector(".edit-button");
                    const deleteButton = commentDiv.querySelector(".delete-button");

                    editButton.addEventListener("click", () => toggleEditMode(commentDiv, comment.id, comment.content));
                    deleteButton.addEventListener("click", () => deleteComment(comment.id));
                }
            });
        } catch (error) {
            console.error("Error uploading comments:", error);
        }
    }

    async function reportComment(commentId) {
        const reasons = [
            "Spam",
            "Offensive language",
            "Hate speech",
            "Inappropriate content",
            "Other"
        ];

        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.innerHTML = `
        <div class="modal-content">
            <h3>Select a reason to report</h3>
            <ul class="reasons-list">
                ${reasons.map(reason => `<li><button class="reason-button">${reason}</button></li>`).join("")}
            </ul>
            <textarea id="customReason" placeholder="Enter your reason here..." style="display: none;"></textarea>
            <div class="modal-actions">
                <button id="submitReason" disabled>Submit</button>
                <button id="cancelReport">Cancel</button>
            </div>
        </div>
    `;
        document.body.appendChild(modal);

        const reasonButtons = modal.querySelectorAll(".reason-button");
        const customReasonInput = modal.querySelector("#customReason");
        const submitButton = modal.querySelector("#submitReason");
        const cancelButton = modal.querySelector("#cancelReport");

        let selectedReason = "";

        reasonButtons.forEach(button => {
            button.addEventListener("click", () => {
                selectedReason = button.textContent;
                reasonButtons.forEach(btn => btn.classList.remove("selected"));
                button.classList.add("selected");

                if (selectedReason === "Other") {
                    customReasonInput.style.display = "block";
                    customReasonInput.focus();
                } else {
                    customReasonInput.style.display = "none";
                    customReasonInput.value = "";
                }

                submitButton.disabled = false;
            });
        });

        cancelButton.addEventListener("click", () => {
            modal.remove();
        });

        submitButton.addEventListener("click", async () => {
            const reason = selectedReason === "Other" ? customReasonInput.value.trim() : selectedReason;
            if (!reason) {
                alert("Please provide a valid reason.");
                return;
            }

            try {

                const report_response = await fetch(`http://localhost:8000/api/reports`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiToken}`,
                    }
                });
                if(report_response.ok)
                {
                    const result = await report_response.json();
                    const reports = result.data;

                    const filteredReports = reports.filter(r => r.comment.id === commentId);

                    if(filteredReports.length > 0)
                    {
                        alert("Comment has been reported successfully.");

                        feedbackFromAdministration(userId,
                            "Hello.\nThank you for your vigilance!\nYour complaint will be reviewed as soon as possible. Violators will be held accountable in accordance with the rules.");
                        return;
                    }
                } else {
                    console.log("Report not found!")
                }

                const response = await fetch(`http://localhost:8000/api/reports`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiToken}`
                    },
                    body: JSON.stringify({ comment_id: commentId, reason })
                });

                if (response.ok) {
                    alert("Comment has been reported successfully.");

                    feedbackFromAdministration(userId,
                        "Hello.\nThank you for your vigilance!\nYour complaint will be reviewed as soon as possible. Violators will be held accountable in accordance with the rules.");
                } else {
                    alert("Failed to report comment. Please try again later.");
                }
            } catch (error) {
                console.error("Error reporting a comment:", error);
            } finally {
                modal.remove();
            }
        });
    }

    async function feedbackFromAdministration (receiverId, message) {
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
                    console.log(`Chat already exists with ID: ${chatId}`);
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

    function canEditOrDelete(commentUserId) {
        return userId === commentUserId || userRole === "admin" || userRole === "moderator";
    }

    function toggleEditMode(commentDiv, commentId) {
        const commentContent = commentDiv.querySelector(".comment-content");
        const editButton = commentDiv.querySelector(".edit-button");

        if (editButton.id === "update_comment") {
            const currentContent = commentContent.textContent;
            commentContent.innerHTML = `<textarea class="edit-textarea">${currentContent}</textarea>`;
            editButton.innerHTML = "<span class=\"tooltip\" data-tooltip=\"Update\"><i class=\"fa-solid fa-check\"></i></span>";
            editButton.id = "edit_comment";
            const textarea = document.querySelector(".edit-textarea");
            if (textarea) {
                textarea.focus();
                textarea.selectionStart = textarea.value.length;
                textarea.selectionEnd = textarea.value.length;
            }

            const cancelButton = document.createElement("button");
            cancelButton.classList.add("cancel-button");
            cancelButton.innerHTML = "<span class=\"tooltip\" data-tooltip=\"Cancel\"><i class=\"fa-solid fa-xmark\"></i></span>";
            editButton.after(cancelButton);

            cancelButton.addEventListener("click", () => {
                commentContent.textContent = currentContent; // повертаємо старе значення
                editButton.innerHTML = "<span class=\"tooltip\" data-tooltip=\"Update\"><i class=\"fa-regular fa-pen-to-square\"></i></span>";
                editButton.id = "update_comment";
                cancelButton.remove();
            });
        } else {
            const newContent = commentDiv.querySelector(".edit-textarea")
                .value;
            updateComment(commentId, newContent, commentDiv).then((success) => {
                if (success) {
                    commentContent.textContent = newContent;
                }
            });
            editButton.innerHTML = "<span class=\"tooltip\" data-tooltip=\"Update\"><i class=\"fa-regular fa-pen-to-square\"></i></span>";
            editButton.id = "update_comment";
            const cancelButton = commentDiv.querySelector(".cancel-button");
            if (cancelButton) cancelButton.remove();
        }
    }

    sendCommentButton.addEventListener("click", async () => {
        const content = commentInput.value.trim();
        if (content.length < 1) {
            alert("The comment must contain at least 1 character.");
            return;
        }
        try {
            const response = await fetch("http://localhost:8000/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    book_id: bookId,
                    content
                })
            });

            let data = response.ok ? await response.json() : null;

            if(data === null) {
                window.location.href = "../../html/auth/login.html";
            } else if (response.ok && data?.message === 'Muted') {

                const muteResponse = await fetch(`/api/user_mutes/${userId}`, {
                    headers: {
                        "Authorization": `Bearer ${apiToken}`
                    }
                });
                const muteData = muteResponse.ok ? await muteResponse.json() : null;
                const currentTime = new Date();
                if (muteData?.data) {
                    const muteExpiry = new Date(muteData.data.created_at);
                    muteExpiry.setHours(muteExpiry.getHours() + muteData.data.mute_duration);
                    const muteRemaining = Math.ceil((muteExpiry - currentTime) / (1000 * 60 * 60));

                    const expiryDateTime = `${String(muteExpiry.getDate()).padStart(2, '0')}-${String(muteExpiry.getMonth() + 1).padStart(2, '0')}-${muteExpiry.getFullYear()} ${String(muteExpiry.getHours()).padStart(2, '0')}:${String(muteExpiry.getMinutes()).padStart(2, '0')}`;

                    alert(`You have been muted for ${muteRemaining} hours for violating the rules of commenting. Mute will expire on: ${expiryDateTime}`);
                    commentInput.value = "";
                }

            } else if(response.ok) {
                commentInput.value = "";
                loadComments();
            }
        } catch (error) {
            console.error("Помилка при додаванні коментаря:", error);
        }
    });

    async function deleteComment(commentId) {
        try {
            const reportCheckResponse = await fetch(`http://localhost:8000/api/comments/rep/${commentId}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${apiToken}`
                }
            });

            if (!reportCheckResponse.ok) {
                alert("Error checking report status.");
                return;
            }

            const reportCheckData = await reportCheckResponse.json();

            if(reportCheckData.message === 'Muted')
            {
                const muteResponse = await fetch(`/api/user_mutes/${userId}`, {
                    headers: {
                        "Authorization": `Bearer ${apiToken}`
                    }
                });
                const muteData = muteResponse.ok ? await muteResponse.json() : null;
                const currentTime = new Date();
                if (muteData?.data) {
                    const muteExpiry = new Date(muteData.data.created_at);
                    muteExpiry.setHours(muteExpiry.getHours() + muteData.data.mute_duration);
                    const muteRemaining = Math.ceil((muteExpiry - currentTime) / (1000 * 60 * 60));

                    const expiryDateTime = `${String(muteExpiry.getDate()).padStart(2, '0')}-${String(muteExpiry.getMonth() + 1).padStart(2, '0')}-${muteExpiry.getFullYear()} ${String(muteExpiry.getHours()).padStart(2, '0')}:${String(muteExpiry.getMinutes()).padStart(2, '0')}`;

                    alert(`You have been muted for ${muteRemaining} hours for violating the rules of commenting. Mute will expire on: ${expiryDateTime}`)
                }
            }

            if (reportCheckData.has_report) {
                alert("You cannot delete a comment that has a report");
                return;
            }

            const deleteResponse  = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${apiToken}`
                }
            });

            if (deleteResponse .ok) {
                loadComments();
            } else {
                alert("Could not delete comment.");
            }
        } catch (error) {
            console.error("Помилка при видаленні коментаря:", error);
        }
    }

    async function updateComment(commentId, newContent) {
        if (!newContent || newContent.length < 1) {
            alert("The comment must contain at least 1 character.");
            return false;
        }
        try {
            const response = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("api_token")}`
                },
                body: JSON.stringify({ content: newContent })
            });

            let data = response.ok ? await response.json() : null;

            if(data === null) {
                alert("Comment could not be updated.");
                return false;
            } else if (response.ok && data?.message === 'Muted') {
                const muteResponse = await fetch(`/api/user_mutes/${userId}`, {
                    headers: {
                        "Authorization": `Bearer ${apiToken}`
                    }
                });
                const muteData = muteResponse.ok ? await muteResponse.json() : null;
                const currentTime = new Date();
                if (muteData?.data) {
                    const muteExpiry = new Date(muteData.data.created_at);
                    muteExpiry.setHours(muteExpiry.getHours() + muteData.data.mute_duration);
                    const muteRemaining = Math.ceil((muteExpiry - currentTime) / (1000 * 60 * 60));

                    const expiryDateTime = `${String(muteExpiry.getDate()).padStart(2, '0')}-${String(muteExpiry.getMonth() + 1).padStart(2, '0')}-${muteExpiry.getFullYear()} ${String(muteExpiry.getHours()).padStart(2, '0')}:${String(muteExpiry.getMinutes()).padStart(2, '0')}`;

                    alert(`You have been muted for ${muteRemaining} hours for violating the rules of commenting. Mute will expire on: ${expiryDateTime}`)
                    loadComments();
                }
            } else if(response.ok) {
                return true;
            }
        } catch (error) {
            console.error("Error updating a comment:", error);
            return false;
        }
    }

    const ButtonRule = document.getElementById('rules');
    const modalRule = document.getElementById('modal-rule');
    const closeButtonRule = document.querySelector('.close-rule');

    ButtonRule.addEventListener('click', () => {
        modalRule.style.display = 'flex';
    });

    closeButtonRule.addEventListener('click', () => {
        modalRule.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalRule) {
            modalRule.style.display = 'none';
        }
    });

    loadComments();
    loaderOff();

    const rulesButton = document.getElementById("rules");

    if (!apiToken) {
        rulesButton.style.display = 'none';
    }

    const observer = new MutationObserver(() => {
        const reportButtons = document.querySelectorAll(".report-button");
        if (!apiToken) {
            reportButtons.forEach(button => {
                button.style.display = "none";
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
