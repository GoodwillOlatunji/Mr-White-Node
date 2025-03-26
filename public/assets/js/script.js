var chatOpen = false;
var chatHistory = [];

// Connect to the Socket.IO server
let port = 5000;
let ip = "127.0.0.1";
var socket = io(`http://${ip}:${port}`);

// Initial setup when page loads
window.onload = function () {
    restoreChatHistory();
    
    socket.on('connect', function () {
        console.log('Connected to server');
    });

    let currentBotMessage = null;

    // Add scroll functionality to chat box
    const chatBox = document.querySelector(".messages");
    chatBox.style.maxHeight = "100%"; // You can adjust this value
    chatBox.style.overflowY = "auto";
    chatBox.style.overflowX = "hidden";

    // Handle incoming messages
    socket.on("bot_response", function (data) {
        if (data.isComplete) {
            currentBotMessage = null;
            return;
        }

        // Get or create the bot message div
        if (!currentBotMessage) {
            // Create new message bubble for new response
            currentBotMessage = appendMessage(data.response, "from-bot", "bot-message", true);
        } else {
            // Append to existing message bubble
            currentBotMessage.textContent += data.response;
        }

        // Ensure scroll to bottom
        var chatBox = document.querySelector(".messages");
        chatBox.scrollTop = chatBox.scrollHeight;
    });
};

// Toggle chat window
function toggleChat() {
    const chatBox = document.getElementById("chat-box");
    const chatToggle = document.getElementById("chat-toggle");

    if (!chatOpen) {
        chatBox.style.display = "flex";
        chatToggle.style.display = "none";
        // Trigger reflow
        chatBox.offsetHeight;
        chatBox.classList.add("visible", "slide-up-animation");
    } else {
        chatBox.classList.remove("visible", "slide-up-animation");
        setTimeout(() => {
            chatBox.style.display = "none";
            chatToggle.style.display = "block";
        }, 300);
    }
    chatOpen = !chatOpen;
}

// Minimize chat window
document.getElementById("minimize-chat").addEventListener("click", function() {
    const chatBox = document.getElementById("chat-box");
    const isMaximized = chatBox.classList.contains("maximized");
    
    if (isMaximized) {
        chatBox.classList.remove("maximized");
        setTimeout(() => {
            chatBox.classList.add("minimized");
        }, 100);
    } else {
        chatBox.classList.toggle("minimized");
    }
});

// Maximize chat window
document.getElementById("maximize-chat").addEventListener("click", function() {
    const chatBox = document.getElementById("chat-box");
    const isMinimized = chatBox.classList.contains("minimized");
    
    if (isMinimized) {
        chatBox.classList.remove("minimized");
        setTimeout(() => {
            chatBox.classList.add("maximized");
        }, 300);
    } else {
        chatBox.classList.toggle("maximized");
    }
});

// Close chat window
document.getElementById("close-chat").addEventListener("click", function() {
    const chatBox = document.getElementById("chat-box");
    const chatToggle = document.getElementById("chat-toggle");
    
    chatBox.classList.remove("maximized", "minimized", "visible", "slide-up-animation");
    
    // Add fade out effect
    chatBox.style.opacity = "0";
    
    // Wait for fade out before hiding
    setTimeout(() => {
        chatBox.style.display = "none";
        chatBox.style.opacity = "1";
        chatToggle.style.display = "block";
    }, 300);
    
    chatOpen = false;
});

// Send message
function sendMessage(event) {
    event.preventDefault();
    var input = document.getElementById("message");
    var message = input.value.trim();

    if (message === "") return;

    // Add user message
    appendMessage(message, "from-user", "user-message");
    
    // Show thinking animation
    showThinkingMessage();

    // Send message to server via socket
    socket.emit("message", { message: message });

    input.value = ""; // Clear the input field
}

// Add event listener for Enter key
document.getElementById("message").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage(event);
    }
});

// Append message to chat
function appendMessage(text, messageClass, containerClass, isBot = false) {
    var chatBox = document.querySelector(".messages");
    removeThinkingMessage();

    var messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container", containerClass);

    var messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    var messageDiv = document.createElement("div");
    messageDiv.classList.add("message", messageClass);
    messageDiv.textContent = text;

    messageWrapper.appendChild(messageDiv);
    messageContainer.appendChild(messageWrapper);
    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;

    saveChatHistory();
    return messageDiv;
}

// Show thinking animation
function showThinkingMessage() {
    var chatBox = document.querySelector(".messages");
    var messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container", "bot-message", "thinking-container");

    var messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    var thinkingMessage = document.createElement("div");
    thinkingMessage.classList.add("thinking-message");
    thinkingMessage.innerHTML = `<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>`;

    messageWrapper.appendChild(thinkingMessage);
    messageContainer.appendChild(messageWrapper);
    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Remove thinking animation
function removeThinkingMessage() {
    var thinkingContainer = document.querySelector(".thinking-container");
    if (thinkingContainer) {
        thinkingContainer.remove();
    }
}

// Stub functions for chat history (you may want to implement these properly)
function restoreChatHistory() {
    // Implement chat history restoration if needed
}

function saveChatHistory() {
    // Implement chat history saving if needed
}

// Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    // Elements to animate
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Create the Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Add animation class when element is in view
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Only animate once (optional - remove if you want repeat animations)
                observer.unobserve(entry.target);
            }
        });
    }, {
        // Options
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Offset the trigger point
    });
    
    // Observe all elements with animate-on-scroll class
    animatedElements.forEach(element => {
        observer.observe(element);
    });
});

// Handle navigation bar changes on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

// Type writer effect for the landing page text
document.addEventListener('DOMContentLoaded', () => {
    const landingText = document.querySelector('.landing-text h1');
    if (landingText) {
        setTimeout(() => {
            landingText.classList.add('typewriter-effect');
        }, 500);
    }
});