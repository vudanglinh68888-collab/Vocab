
import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message } from '../types';

interface ChatWindowProps {
  contact: Contact;
  onClose: () => void;
  onCall: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, onClose, onCall }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: contact.id, text: `Chào bạn! Tôi là ${contact.name}.`, timestamp: new Date(), isMe: false },
    { id: 'm2', senderId: 'me', text: 'Chào, rất vui được gặp bạn!', timestamp: new Date(), isMe: true },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: input,
      timestamp: new Date(),
      isMe: true
    };
    
    setMessages([...messages, newMsg]);
    setInput('');

    // Echo reply simulation
    if (!contact.isAI) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          senderId: contact.id,
          text: 'Ok, tôi đã nhận được tin nhắn.',
          timestamp: new Date(),
          isMe: false
        }]);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="md:hidden text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <h3 className="font-bold text-slate-100 text-sm leading-tight">{contact.name}</h3>
            <span className="text-[11px] text-green-500 font-medium">Online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onCall}
            className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </button>
          <button className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {!msg.isMe && (
              <img src={contact.avatar} className="w-8 h-8 rounded-lg mt-auto mr-3 mb-1" alt="" />
            )}
            <div className={`
              max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative group
              ${msg.isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none'}
            `}>
              {msg.text}
              <div className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 ${msg.isMe ? 'right-0' : 'left-0'} text-slate-500 font-medium`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 bg-slate-900/50 backdrop-blur-md border-t border-slate-800">
        <div className="flex items-center gap-3 glass-effect p-1.5 rounded-2xl border border-white/5">
          <button className="p-2.5 text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
          <input 
            type="text" 
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0 outline-none placeholder-slate-600"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20"
          >
            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
