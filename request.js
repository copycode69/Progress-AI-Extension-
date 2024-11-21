document.getElementById('sendBtn').addEventListener('click', async function() {
    const userInput = document.getElementById('userInput').value;
    const chatbox = document.getElementById('chatbox');

    // Input validation
    if (!userInput.trim()) {
        alert('Please enter a message.');
        return;
    }

    const userMessage = document.createElement('div');
    userMessage.textContent = "You: " + userInput;
    chatbox.appendChild(userMessage);
    
    // Clear the input field
    document.getElementById('userInput').value = '';

    try {
        const response = await fetch('http://127.0.0.1:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userInput })
        });
  
        const data = await response.json();
        const botMessage = document.createElement('div');
        botMessage.textContent = "Bot: " + data.reply;
        chatbox.appendChild(botMessage);
  
    } catch (error) {
        const errorMessage = document.createElement('div');
        errorMessage.textContent = "Error: Could not connect to the server.";
        chatbox.appendChild(errorMessage);
        console.error('Error:', error);
    }
});
