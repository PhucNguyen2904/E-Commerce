import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: 'Xin chào! Mình là trợ lý LuxeRetail, có thể giúp bạn tìm sản phẩm hoặc tra cứu đơn hàng. Bạn cần gì hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cuộn xuống tin nhắn cuối cùng mỗi khi messages thay đổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Đánh dấu đã đọc khi mở panel
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const togglePanel = () => setIsOpen(!isOpen);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const payload: any = { message: userMessage.content };
      if (conversationId) {
        payload.conversationId = conversationId;
      }

      const response = await apiClient.post('/chatbot/messages', payload);
      
      if (response.data && response.data.conversationId) {
        setConversationId(response.data.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.reply || 'Xin lỗi, không nhận được phản hồi phù hợp.',
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, mình đang gặp chút trục trặc, bạn thử lại sau nhé.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const parseMarkdownLinks = (text: string): ReactNode[] => {
    // Regex tìm chuỗi [Tên](Link)
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const elements: ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Push the text before the link
      if (match.index > lastIndex) {
        elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      
      // Push the link
      const [, title, url] = match;
      elements.push(
        <Link 
          key={`link-${match.index}`} 
          to={url}
          className="underline font-medium hover:opacity-80"
          onClick={() => setIsOpen(false)}
        >
          {title}
        </Link>
      );
      
      lastIndex = regex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < text.length) {
      elements.push(<span key={`text-end-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return elements.length > 0 ? elements : [text];
  };

  return (
    <>
      {/* Bubble Toggle */}
      <button
        onClick={togglePanel}
        className="fixed bottom-6 right-6 z-[100] flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-ambient hover:opacity-90 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30"
        aria-label="Mở hộp thoại trợ lý"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
        {!isOpen && hasUnread && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-surface-container-lowest rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed z-[90] flex flex-col bg-surface-container-lowest border border-outline-variant shadow-ambient transition-all duration-300 transform origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
          bottom-0 right-0 w-full h-full sm:bottom-24 sm:right-6 sm:w-[360px] sm:h-[480px] sm:rounded-lg overflow-hidden
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-white shrink-0 sm:rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <h3 className="font-semibold text-sm">Trợ lý LuxeRetail</h3>
          </div>
          <button onClick={togglePanel} className="sm:hidden p-1 hover:bg-white/10 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-lowest">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-surface-container-low text-on-surface rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? parseMarkdownLinks(msg.content) : msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="bg-surface-container-low px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-surface-container-lowest border-t border-outline-variant shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant text-on-surface"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
