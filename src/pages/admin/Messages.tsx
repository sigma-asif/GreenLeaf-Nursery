import { useEffect, useState } from 'react';
import { MessageSquare, Mail, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ContactMessage } from '../../lib/supabase';

interface MessagesProps {
  onNavigate: (page: string) => void;
}

export default function Messages({ onNavigate }: MessagesProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      loadMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', messageId);
      if (error) throw error;
      loadMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread') return !msg.is_read;
    if (filter === 'read') return msg.is_read;
    return true;
  });

  const handleMessageClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Contact Messages</h1>
        <div className="flex space-x-2">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-6 hover:bg-gray-50 transition cursor-pointer ${
                      selectedMessage?.id === message.id ? 'bg-green-50' : ''
                    } ${!message.is_read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${message.is_read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                          <Mail className={`h-5 w-5 ${message.is_read ? 'text-gray-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{message.name}</h3>
                          <p className="text-sm text-gray-600">{message.email}</p>
                        </div>
                      </div>
                      {!message.is_read && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 line-clamp-2 mb-2">{message.message}</p>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{new Date(message.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Message Details</h2>
                {selectedMessage.is_read && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <p className="text-gray-900 font-medium">{selectedMessage.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-green-600 hover:text-green-700 break-all"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received</label>
                  <p className="text-gray-900">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-line">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: Your message to GreenLeaf Nursery`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Mail className="h-5 w-5" />
                  <span>Reply via Email</span>
                </a>

                {!selectedMessage.is_read && (
                  <button
                    onClick={() => markAsRead(selectedMessage.id)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Mark as Read</span>
                  </button>
                )}

                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Message</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-center">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
