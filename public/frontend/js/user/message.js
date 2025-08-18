const loader = document.querySelector(".load");
const bodyPage = document.querySelector(".body-page");
loader.style.display="block";
function loaderOff() {
    loader.style.display="none";
    bodyPage.style.display="block";
}

document.addEventListener('DOMContentLoaded', async () => {
    const chatList = document.getElementById('chatList');
    const messageList = document.getElementById('messageList');
    const messageForm = document.getElementById('messageForm');
    const textarea = document.getElementById('new-message');
    let selectedChatId = null;
    let debounceTimer = null;
    const processedMessageIds = new Set();

    async function getAuthenticatedUser() {
        try {
            if (apiToken) {
                const response = await fetch('/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json',
                    },
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
    const currentUserId = authenticatedUser ? authenticatedUser.id : null;

    async function markVisibleMessagesAsRead() {
        const visibleMessageIds = Array.from(messageList.querySelectorAll('.message-item.unread'))
            .filter(message => {
                const rect = message.getBoundingClientRect();
                return rect.top >= 0 && rect.bottom <= window.innerHeight;
            })
            .map(message => parseInt(message.dataset.id))
            .filter(id => !processedMessageIds.has(id));

        if (visibleMessageIds.length === 0) return;

        try {
            const response = await fetch('/api/markAsRead', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message_ids: visibleMessageIds }),
            });

            if (!response.ok) {
                console.log('Failed to mark messages as read.');
                return
            }

            visibleMessageIds.forEach(id => {
                processedMessageIds.add(id);
                const messageElement = document.querySelector(`.message-item[data-id="${id}"]`);
                if (messageElement) {
                    messageElement.classList.remove('unread');
                }
            });

            updateUnreadCount(selectedChatId, visibleMessageIds.length);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    function handleScrollWithDebounce() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            markVisibleMessagesAsRead();
        }, 200);
    }

    messageList.addEventListener('scroll', handleScrollWithDebounce);

    async function fetchChats() {
        try {
            const response = await fetch('/api/chats', {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            });
            if (!response.ok) {
                console.log('Failed to fetch chats.');
                return;
            }
            const chats = await response.json();
            renderChatList(chats);

            if(chat_id) activateChatFromURL();

        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    }

    function updateUnreadCount(chatId, readCount) {
        const chatElement = document.querySelector(`.chat-item[data-id="${chatId}"] .chat-indicator`);
        if (chatElement) {
            const currentUnreadCount = parseInt(chatElement.textContent) || 0;
            const newUnreadCount = Math.max(currentUnreadCount - readCount, 0);
            chatElement.textContent = newUnreadCount > 0 ? newUnreadCount : '';
            chatElement.classList.toggle('red', newUnreadCount > 0);
            chatElement.classList.toggle('green', newUnreadCount === 0);

            if (newUnreadCount > 9) {
                chatElement.classList.add('large-count');
            } else {
                chatElement.classList.remove('large-count');
            }
        }
    }

    function renderChatList(chats) {
        chatList.innerHTML = chats.map(chat => {
            const chatPartner = chat.user_one.id === currentUserId ? chat.user_two : chat.user_one;
            const unreadCount = chat.messages.filter(
                m => !m.is_checked && m.sender_id !== currentUserId
            ).length;

            return `
            <li class="chat-item" data-id="${chat.id}">
                <img src="/${chatPartner.photo}" alt="Avatar">
                <div class="chat-info">
                    <div class="chat-title">${chat.title}</div>
                    <div class="chat-date">${new Date(chat.created_at).toLocaleDateString()}</div>
                </div>
                <div class="chat-indicator ${unreadCount > 0 ? 'red' : 'green'} ${unreadCount > 9 ? 'large-count' : ''}">
                    ${unreadCount || ''}
                </div>
                <button class="delete-chat"><i class="fa-regular fa-trash-can"></i></button>
            </li>
        `;
        }).join('');
    }

    chatList.addEventListener('click', async (e) => {
        const chatItem = e.target.closest('.chat-item');
        if (!chatItem) return;

        if (e.target.classList.contains('delete-chat')) {
            if (!chatItem) return;
            const chatId = chatItem.dataset.id;

            const confirmation = confirm('Ви дійсно хочете видалити цей чат?');
            if (!confirmation) return;

            try {
                const response = await fetch(`/api/chats/${chatId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                    },
                });
                if (!response.ok) {
                    console.log('Unable to delete a chat.');
                    return;
                }

                const url = new URL(window.location.href);
                url.searchParams.delete('id');
                window.history.replaceState(null, '', url.toString());

                chatItem.remove();

                if (selectedChatId === chatId) {
                    selectedChatId = null;
                    messageList.innerHTML = '';
                    messageForm.style.display = 'none';
                }
            } catch (error) {
                console.error('Error when deleting a chat:', error);
            }
        }else {
            selectedChatId = chatItem.dataset.id;
            await fetchMessages(selectedChatId);
            messageForm.style.display = 'flex';
        }
    });

    async function fetchMessages(chatId) {
        try {
            const response = await fetch(`/api/chats/${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            });
            if (!response.ok) {
                console.log('Failed to fetch messages.');
                return;
            }

            const chat = await response.json();
            renderMessages(chat.messages, chat.user_one, chat.user_two);
            scrollToFirstUnread();
            markVisibleMessagesAsRead();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }
    function scrollToFirstUnread() {
        const firstUnreadMessage = messageList.querySelector('.message-item.unread');
        if (firstUnreadMessage) {
            firstUnreadMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setTimeout(() => {
                messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
            }, 0);
        }
    }

    function renderMessages(messages, userOne, userTwo) {
        let lastMessageDate = null;

        messageList.innerHTML = messages.map(message => {
            const isCurrentUser = message.sender_id === currentUserId;
            const messageOwner = isCurrentUser
                ? (currentUserId === userOne.id ? userOne : userTwo)
                : (currentUserId === userOne.id ? userTwo : userOne);

            const currentMessageDate = new Date(message.created_at);
            const shouldAddDateSeparator = !lastMessageDate ||
                (currentMessageDate - lastMessageDate > 24 * 60 * 60 * 1000);

            lastMessageDate = currentMessageDate;

            const dateSeparator = shouldAddDateSeparator
                ? `<div class="date-separator">${currentMessageDate.toLocaleDateString()}</div>`
                : '';

            return `
            ${dateSeparator}
            <div class="message-item ${!message.is_checked && !isCurrentUser ? 'unread' : ''}" data-id="${message.id}">
                <div class="message-header">
                    <img src="/${messageOwner.photo}" alt="Avatar">
                    <div class="message-content">
                        <div class="meta">
                            <div class="message-username">${messageOwner.username}</div>
                           <div class="message-meta">${new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <textarea class="edit-area" style="display: none;">${message.content}</textarea>
                        <div class="message-text"><p class="message-content-text">${message.content}</p></div>
                     </div>
                </div>

                <div class="message-actions">
                    ${isCurrentUser ? `
                        <button class="edit-message"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="update-message" style="display: none;"><i class="fa-solid fa-check"></i></button>
                        <button class="cancel-edit" style="display: none;"><i class="fa-solid fa-xmark"></i></button>
                        <button class="delete-message"><i class="fa-regular fa-trash-can"></i></button>
                    ` : ''}
                </div>
            </div>
        `;
        }).join('');
    }

    messageList.addEventListener('click', async (e) => {
        const messageItem = e.target.closest('.message-item');
        if (!messageItem) return;

        const messageId = messageItem.dataset.id;

        if (e.target.classList.contains('delete-message')) {
            try {
                const response = await fetch(`/api/messages/${messageId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                    },
                });
                if (!response.ok) {
                    console.log('Failed to delete message.');
                    return;
                }
                messageItem.remove();

                if(chat_id) {
                    const response = await fetch(`/api/chats/hasMessages/${chat_id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${apiToken}`,
                        }
                    });

                    if (!response.ok) {
                        console.log('Invalid chat id.');
                        return;
                    }
                    const data = await response.json();
                    const hasMessage_chat =  JSON.stringify(data.exist);

                    console.log(sessionStorage.getItem('currentChatId'))
                    if(hasMessage_chat === 'false' && chat_id === sessionStorage.getItem('currentChatId')) {
                        hasMessage = false;
                        sessionStorage.setItem('hasMessage', 'false');
                    } else if(hasMessage_chat === 'true' && chat_id === sessionStorage.getItem('currentChatId')) {
                        hasMessage = true;
                    }
                }

            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }

        if (e.target.classList.contains('edit-message')) {
            const editArea = messageItem.querySelector('.edit-area');
            const messageText = messageItem.querySelector('.message-text');
            const updateButton = messageItem.querySelector('.update-message');
            const cancelButton = messageItem.querySelector('.cancel-edit');
            const editButton = e.target;

            editArea.style.display = 'block';
            if (editArea) {
                editArea.focus();
                editArea.selectionStart = editArea.value.length;
                editArea.selectionEnd = editArea.value.length;
            }
            messageText.style.display = 'none';
            updateButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';
            editButton.style.display = 'none';
        }

        if (e.target.classList.contains('cancel-edit')) {
            const editArea = messageItem.querySelector('.edit-area');
            const messageText = messageItem.querySelector('.message-text');
            const updateButton = messageItem.querySelector('.update-message');
            const cancelButton = e.target;
            const editButton = messageItem.querySelector('.edit-message');

            editArea.style.display = 'none';
            messageText.style.display = 'block';
            updateButton.style.display = 'none';
            cancelButton.style.display = 'none';
            editButton.style.display = 'inline-block';
        }

        if (e.target.classList.contains('update-message')) {
            const editArea = messageItem.querySelector('.edit-area');
            const messageText = messageItem.querySelector('.message-text');
            const messageTextContext = messageItem.querySelector('.message-content-text');
            const updateButton = e.target;
            const cancelButton = messageItem.querySelector('.cancel-edit');
            const editButton = messageItem.querySelector('.edit-message');

            try {
                const response = await fetch(`/api/messages/${messageId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: editArea.value }),
                });
                if (!response.ok) {
                    console.log('Failed to update message.');
                    return;
                }

                messageTextContext.textContent = editArea.value;
                editArea.style.display = 'none';
                messageText.style.display = 'block';
                updateButton.style.display = 'none';
                cancelButton.style.display = 'none';
                editButton.style.display = 'inline-block';
            } catch (error) {
                console.error('Error updating message:', error);
            }
        }
    });

    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = textarea.value.trim();
        if (!content) return;

        try {
            const response = await fetch(`/api/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chat_id: selectedChatId, content }),
            });
            if (!response.ok) {
                console.log('Failed to send message.');
                return;
            }
            textarea.value = '';

            if(sessionStorage.getItem('currentChatId') === chat_id) hasMessage = true;

            await fetchMessages(selectedChatId);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    fetchChats();
    loaderOff();

    const urlParams = new URLSearchParams(window.location.search);
    const chat_id = urlParams.get("id");
    let hasMessage = false;

    window.addEventListener('pagehide', () => {

        if (hasMessage === true) {
            sessionStorage.setItem('hasMessage', 'true');
        }

        if (chat_id && hasMessage === false && (sessionStorage.getItem('hasMessage') === 'false' || sessionStorage.getItem('hasMessage') === null))  {
            try {
                const deleteUrl = `/api/chats/delete`;
                const beaconPayload = JSON.stringify({ chat_id });
                const blob = new Blob([beaconPayload], { type: 'application/json' });
                navigator.sendBeacon(deleteUrl, blob);

                removeNewChat();

                sessionStorage.removeItem('hasMessage');
                sessionStorage.removeItem('currentChatId');

            } catch (error) {
                console.error('Error when deleting a chat:', error);
            }
        }
    });

    function removeNewChat() {
        const chatItem = document.querySelector(`.chat-item[data-id="${chat_id}"]`);
        if (chatItem) {
            chatItem.remove();
        }
    }

    function activateChatFromURL()  {

        if (chat_id) {
            const chatListItem = document.querySelector(`#chatList .chat-item[data-id="${chat_id}"]`);

            if (!chatListItem) {
                const url = new URL(window.location.href);
                url.searchParams.delete('id');
                window.history.replaceState(null, '', url.toString());
                return;
            }
            function handleChatClick(event) {
                const target = event.target.closest(".chat-item");
                if (target) {
                    sessionStorage.setItem('currentChatId', `${target.dataset.id}`);
                }
            }

            chatList.addEventListener("click", handleChatClick);

            if (chatListItem) {
                chatListItem.click();
            } else {
                console.error(`Chat with ID ${chat_id} was not found in the list.`);
            }
        }
    }
});
