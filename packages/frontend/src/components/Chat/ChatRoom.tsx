import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { authService } from '../../services/authService';
import type { User } from '../../services/authService';
import { roomService } from '../../services/roomService';
import type { Room } from '../../types/room';

interface Message {
  id: string;
  text: string;
  userName: string;
  userId: string;
  roomId: string;
  createdAt: string;
}

export const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { roomSlug } = useParams<{ roomSlug: string }>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    if (!roomSlug) {
      navigate('/rooms');
      return;
    }

    const loadData = async () => {
      try {
        const [userData, roomData] = await Promise.all([
          authService.getProfile(),
          roomService.getRoomBySlug(roomSlug),
        ]);

        setUser(userData);
        setRoom(roomData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Sala não encontrada');
        setLoading(false);
        return;
      }
    };

    loadData();

    const socketInstance = io('http://localhost:3000/chat', {
      auth: {
        token: token,
      },
    });

    const timeout = setTimeout(() => {
      console.log('Timeout de carregamento da sala');
      setLoading(false);
      setError('Timeout ao carregar a sala');
    }, 10000); // 10 segundos

    socketInstance.on('disconnect', () => {
      console.log('Desconectado do chat');
      setConnected(false);
      setHasJoinedRoom(false);
      clearTimeout(timeout);
    });

    socketInstance.on('connect', () => {
      console.log('Conectado ao chat');
      setConnected(true);

      if (!hasJoinedRoom) {
        socketInstance.emit('room:join', { roomSlug });
      }
    });

    socketInstance.on(
      'room:join',
      (data: { room: Room; messages: Message[] }) => {
        console.log('Entrou na sala:', data);
        setRoom(data.room);
        setMessages(data.messages);
        setLoading(false);
        setHasJoinedRoom(true);
        clearTimeout(timeout);
      },
    );

    socketInstance.on('message:new', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on(
      'user:joined',
      (data: { userId: string; userName: string }) => {
        console.log(`${data.userName} entrou no chat`);
      },
    );

    socketInstance.on(
      'user:left',
      (data: { userId: string; userName: string }) => {
        console.log(`${data.userName} saiu do chat`);
      },
    );

    socketInstance.on('error', (error: string) => {
      console.error('Erro no WebSocket:', error);
      setLoading(false);
      setHasJoinedRoom(false);
      if (error === 'Unauthorized') {
        authService.logout();
        navigate('/');
      }
    });

    setSocket(socketInstance);

    return () => {
      clearTimeout(timeout);
      socketInstance.disconnect();
    };
  }, [navigate, roomSlug]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !connected) return;

    socket.emit('message:send', { text: newMessage.trim() });
    setNewMessage('');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleBackToRooms = () => {
    navigate('/rooms');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando sala...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button
            onClick={handleBackToRooms}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Voltar para Salas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{room?.name}</h1>
          <div className="flex items-center mt-1 space-x-4">
            <div
              className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
            <span className="text-sm text-gray-500">Slug: {room?.slug}</span>
            <span className="text-sm text-gray-500">
              Limite: {room?.maxUsers} usuários
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Olá, {user?.name}</span>
          <button
            onClick={handleBackToRooms}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Voltar
          </button>
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
                <div
                  className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
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
