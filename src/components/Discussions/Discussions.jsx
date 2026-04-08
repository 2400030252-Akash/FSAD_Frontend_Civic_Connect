import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, Send, Search, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';
import { getInitial } from '../../utils/string';

const Discussions = () => {
  const { user } = useAuth();
  const { issues } = useIssues();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // 👉 helper to save chat message to your Node + MongoDB backend
  const saveMessageToDb = async (payload) => {
    try {
      const response = await fetch('http://localhost:5000/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setMessages((prev) => [...prev, savedMessage]);
        setNewMessage('');
        setError(null);
        return true;
      } else {
        const errorData = await response.json();
        setError(`Failed to send: ${errorData.message}`);
        return false;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Connection error. Is the backend server running?');
      return false;
    }
  };

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages for selected issue
  useEffect(() => {
    let interval;
    setError(null);
    if (selectedIssue) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/discussions/${selectedIssue.id}`);
          if (response.ok) {
            const data = await response.json();
            setMessages(data);
          } else {
            const errData = await response.json();
            console.error('Fetch error:', errData);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          setError('Could not connect to backend. Please ensure the server is running on port 5000.');
        }
      };

      fetchMessages();
      interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    } else {
      setMessages([]);
    }
    return () => clearInterval(interval);
  }, [selectedIssue]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedIssue || !user) return;

    setIsSending(true);
    const messageData = {
      issueId: selectedIssue.id,
      userId: user.id || user.email,
      userName: user.name || 'Anonymous',
      userRole: user.role || 'citizen',
      district: user.district || '',
      location: user.location || '',
      content: newMessage,
    };

    console.log('Sending message:', messageData);
    await saveMessageToDb(messageData);
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Community Discussions</h1>
        <p className="text-gray-600 mt-1">Connect with others and solve community problems together</p>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Side: Issue List */}
        <div className="w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No issues found matching your search.
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedIssue?.id === issue.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-primary-600 uppercase">{issue.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full status-${issue.status}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{issue.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{issue.description}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {selectedIssue ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">{selectedIssue.title}</h2>
                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                    <Users size={12} className="mr-1" />
                    Community Discussion Group
                  </p>
                </div>
                <button className="p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-white transition-colors">
                  <Info size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                    <div className="p-4 bg-white rounded-full shadow-sm">
                      <MessageSquare size={32} className="text-primary-500" />
                    </div>
                    <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwnMessage = msg.userId === (user?.id || user?.email);
                    return (
                      <div
                        key={msg._id || index}
                        className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${isOwnMessage
                            ? 'bg-primary-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none'
                            }`}
                        >
                          {!isOwnMessage && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-primary-600 uppercase">
                                {msg.userName}
                              </span>
                              {msg.district && (
                                <span className="text-[8px] text-gray-400 font-medium">
                                  ({msg.district})
                                </span>
                              )}
                              <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">
                                {msg.userRole}
                              </span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div
                            className={`text-[9px] mt-1 ${isOwnMessage ? 'text-primary-100' : 'text-gray-400'
                              }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex flex-col gap-2 bg-white">
                {error && (
                  <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 mb-2">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 bg-gray-50">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={40} className="text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Topic to Discuss</h2>
              <p className="max-w-xs mx-auto">
                Choose an issue from the list on the left to join the community conversation and collaborate on solutions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discussions;
