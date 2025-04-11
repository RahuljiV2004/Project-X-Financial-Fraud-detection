import React, { useState, useRef, useEffect } from 'react';
import '../styles/chatbot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message and auto-hide
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      text: "Hello there! I'm FRAUDET 👋\nHow can I help you stay safe with your money or data?",
      sender: 'bot'
    };
    setMessages([welcomeMessage]);

    // Auto-hide chat after 6 seconds
    const hideTimeout = setTimeout(() => {
      setIsOpen(false);
    }, 6000);

    return () => clearTimeout(hideTimeout);
  }, []);

  const getFradetResponse = async (userMsg) => {
    const systemPrompt = "You are FRAUDET, a helpful AI who assists people, especially elderly users, with financial safety tips and doubts. Only reply to financial and data safety-related questions. Keep replies neat and clear and give procedures if asked";

    try {
      setIsLoading(true);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": 'Bearer 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',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMsg }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error getting response:', error);
      return "I apologize, but I'm having trouble connecting to my services right now. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessageText = inputMessage.trim();
    setInputMessage('');

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user'
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);

    // Get and add bot response
    try {
      setIsLoading(true);
      const botResponse = await getFradetResponse(userMessageText);
      const newBotMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble connecting to my services right now. Please try again later.",
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className="chat-icon"
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? 'none' : 'flex' }}
        aria-label="Toggle chat"
      >
        💬
      </button>

      <div className="chatbot" style={{ display: isOpen ? 'flex' : 'none' }}>
        <div className="chat-header">
          <h3>FRAUDET</h3>
          <button 
            className="close-button"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        <div className="chat-messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender}`}
            >
              <strong>{message.sender === 'bot' ? 'FRAUDET' : 'You'}</strong>
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="message bot loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about finance/safety..."
            aria-label="Chat message"
            disabled={isLoading}
          />
          <button type="submit" aria-label="Send message" disabled={isLoading}>
            Send
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatBot;