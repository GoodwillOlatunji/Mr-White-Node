document.addEventListener("DOMContentLoaded", function () {
    // Connect to the Socket.IO server
    var socket = io('http://localhost:5000'); // Ensure this matches your server's address and port

    var chatBox = document.getElementById("chat-box");
    var inputField = document.getElementById("message");
    var sendButton = document.getElementById("send-button");
    var chatContainer = document.getElementById("chat-container");
    var inputBox = document.querySelector(".input-box");
    var thinkingMessage = null;
    var chatOpen = false; // Track chat visibility

    // Toggle chat visibility
    function toggleChat() {
        if (!chatOpen) {
            chatContainer.style.height = "450px";
            chatBox.style.display = "block";
            inputBox.style.display = "flex";
        } else {
            chatContainer.style.height = "60px";
            chatBox.style.display = "none";
            inputBox.style.display = "none";
        }
        chatOpen = !chatOpen;
    }

    // Attach event listener to chat header
    document.querySelector(".chat-header").addEventListener("click", toggleChat);

    // Function to add a message to the chat
    function addMessage(message, isUser = false) {
        var messageDiv = document.createElement("div");
        messageDiv.className = isUser ? "user-message" : "bot-message";
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Handle sending messages
    sendButton.addEventListener("click", function () {
        var message = inputField.value.trim();
        if (message) {
            addMessage(message, true);
            socket.emit("message", { message: message });
            inputField.value = "";
        }
    });

    // Handle Enter key
    inputField.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendButton.click();
        }
    });

    // Handle incoming messages
    socket.on("bot_response", function (data) {
        if (data.isComplete) {
            // Message is complete
            return;
        }

        // Get or create the bot message div
        let messageDiv = chatBox.querySelector('.bot-message:last-child');
        if (!messageDiv) {
            messageDiv = document.createElement("div");
            messageDiv.className = "bot-message";
            chatBox.appendChild(messageDiv);
        }

        // Add the new chunk
        messageDiv.textContent += data.response;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
});