import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../../services/roomService';

export const CreateRoom: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [maxUsers, setMaxUsers] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError('Nome da sala é obrigatório');
      return;
    }

    if (maxUsers < 2 || maxUsers > 100) {
      setError('Limite de usuários deve estar entre 2 e 100');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const room = await roomService.createRoom({
        name: roomName.trim(),
        maxUsers,
      });

      navigate(`/chat/${room.slug}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao criar sala');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/rooms');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar Nova Sala
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Configure os detalhes da sua nova sala de chat
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="room-name" className="sr-only">
                Nome da Sala
              </label>
              <input
                id="room-name"
                name="roomName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nome da Sala"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="max-users" className="sr-only">
                Limite de Usuários
              </label>
              <input
                id="max-users"
                name="maxUsers"
                type="number"
                min="2"
                max="100"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Limite de Usuários"
                value={maxUsers}
                onChange={(e) => setMaxUsers(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Sala'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
