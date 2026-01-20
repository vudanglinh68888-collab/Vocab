
import React, { useState, useEffect } from 'react';
import { Contact } from '../types';

interface ChatListProps {
  onSelectContact: (contact: Contact) => void;
  activeId?: string;
  onShareInvite: () => void;
}

const INITIAL_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Gemini AI Assistant', avatar: 'https://cdn-icons-png.flaticon.com/512/2103/2103855.png', lastMessage: 'Chào bạn, tôi có thể giúp gì cho bạn?', isAI: true },
];

const ChatList: React.FC<ChatListProps> = ({ onSelectContact, activeId, onShareInvite }) => {
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('gemini_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    localStorage.setItem('gemini_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleAddContact = () => {
    if (!newEmail.includes('@')) return;
    
    // Check if user exists in "database" (localStorage)
    const allUsers = JSON.parse(localStorage.getItem('gemini_users') || '[]');
    const foundUser = allUsers.find((u: any) => u.email.toLowerCase() === newEmail.toLowerCase());

    const newContact: Contact = foundUser ? {
      id: foundUser.id,
      name: foundUser.name,
      avatar: foundUser.avatar,
      lastSeen: 'Vừa mới đăng ký',
      lastMessage: 'Bắt đầu cuộc trò chuyện...'
    } : {
      id: `ext_${Date.now()}`,
      name: newEmail.split('@')[0],
      avatar: `https://picsum.photos/seed/${newEmail}/200`,
      lastSeen: 'Ngoại tuyến',
      lastMessage: 'Người dùng này chưa đăng ký.'
    };

    if (!contacts.find(c => c.id === newContact.id)) {
      setContacts([newContact, ...contacts]);
    }
    onSelectContact(newContact);
    setShowAddModal(false);
    setNewEmail('');
  };

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Tin nhắn
            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">{contacts.length}</span>
          </h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm bạn bè..."
            className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 ring-blue-500/50 outline-none transition-all placeholder-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filtered.map(contact => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`
              w-full flex items-center gap-4 p-3 rounded-2xl transition-all
              ${activeId === contact.id ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-slate-800/50 border border-transparent'}
            `}
          >
            <div className="relative flex-shrink-0">
              <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-2xl object-cover bg-slate-800" />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-slate-900 rounded-full ${contact.isAI ? 'bg-purple-500' : 'bg-green-500'}`}>
                {contact.isAI && <div className="w-full h-full animate-pulse bg-white/30 rounded-full" />}
              </div>
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <div className="flex justify-between items-center mb-0.5">
                <span className={`font-semibold text-sm truncate ${contact.isAI ? 'text-purple-300' : 'text-slate-200'}`}>
                  {contact.name}
                </span>
                <span className="text-[10px] text-slate-500 flex-shrink-0">{contact.lastSeen}</span>
              </div>
              <p className="text-xs text-slate-400 truncate leading-relaxed">
                {contact.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full glass-effect rounded-2xl p-6 border border-white/10 shadow-2xl max-w-sm">
            <h3 className="text-lg font-bold mb-2">Tìm tài khoản khác</h3>
            <p className="text-xs text-slate-400 mb-4">Nhập địa chỉ Email Google của người bạn muốn nhắn tin.</p>
            <input 
              type="email" 
              placeholder="ví dụ: ban_be@gmail.com" 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm mb-4 outline-none focus:ring-2 ring-blue-500/50"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              autoFocus
            />
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleAddContact}
                className="w-full py-2.5 text-sm font-semibold bg-blue-600 rounded-lg text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
              >
                Bắt đầu Chat
              </button>
              <button 
                onClick={() => {
                  onShareInvite();
                  setShowAddModal(false);
                }}
                className="w-full py-2.5 text-sm font-semibold bg-slate-800 rounded-lg text-slate-200 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Chia sẻ link ứng dụng
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
