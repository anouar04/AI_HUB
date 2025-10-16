import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const BroadcastMessageView: React.FC = () => {
  const { apiCall, addNotification } = useAppContext();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Message cannot be empty.');
      return;
    }

    setIsSending(true);
    try {
      // In a real application, you might want to add channel selection here
      await apiCall('/broadcast-message', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      addNotification('success', 'Broadcast message sent successfully!');
      setMessage('');
    } catch (error) {
      console.error('Failed to send broadcast message:', error);
      addNotification('error', 'Failed to send broadcast message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Send Broadcast Message</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4">
          <label htmlFor="broadcastMessage" className="block text-sm font-medium text-slate-700 mb-2">
            Message to send to all clients:
          </label>
          <textarea
            id="broadcastMessage"
            rows={6}
            className="w-full p-3 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Type your promotional message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
          ></textarea>
        </div>
        <button
          onClick={handleSendMessage}
          disabled={isSending || !message.trim()}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send to All Clients'}
        </button>
      </div>
    </div>
  );
};

export default BroadcastMessageView;