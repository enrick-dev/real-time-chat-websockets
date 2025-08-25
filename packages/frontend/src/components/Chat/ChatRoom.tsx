import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { authService } from '../../services/authService';
import type { User } from '../../services/authService';

interface Message {
  id: string;
  text: string;
  userName: string;
  userId: string;
  createdAt: string;
}

export const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Carregar perfil do usuário
    const loadUser = async () => {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        authService.logout();
        navigate('/');
        return;
      }
    };

    loadUser();

    // Conectar ao WebSocket
    const socketInstance = io('http://localhost:3000/chat', {
      auth: {
        token: token,
      },
    });

    socketInstance.on('connect', () => {
      console.log('Conectado ao chat');
      setConnected(true);
      setLoading(false);
      
      // Request message list to trigger authentication and user joined event
      socketInstance.emit('message:list');
    });

    socketInstance.on('disconnect', () => {
      console.log('Desconectado do chat');
      setConnected(false);
    });

    socketInstance.on('message:list', (messagesList: Message[]) => {
      setMessages(messagesList);
    });

    socketInstance.on('message:new', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on('user:joined', (data: { userId: string; userName: string }) => {
      console.log(`${data.userName} entrou no chat`);
    });

    socketInstance.on('user:left', (data: { userId: string; userName: string }) => {
      console.log(`${data.userName} saiu do chat`);
    });

    socketInstance.on('error', (error: string) => {
      console.error('Erro no WebSocket:', error);
      if (error === 'Unauthorized') {
        authService.logout();
        navigate('/');
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !connected) return;

    console.log('newMessage', newMessage);

    socket.emit('message:send', { text: newMessage.trim() });
    setNewMessage('');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chat em Tempo Real</h1>
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Olá, {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.userId === user?.id;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {isOwnMessage ? 'Você' : message.userName}
                </div>
                <div className="text-sm">{message.text}</div>
                <div className={`text-xs mt-1 ${
                  isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};
