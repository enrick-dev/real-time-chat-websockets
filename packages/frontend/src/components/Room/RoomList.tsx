import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import type { Room } from '../../types/room';

export const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await roomService.getAllRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error('Erro ao carregar salas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleRoomClick = (room: Room) => {
    navigate(`/chat/${room.slug}`);
  };

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando salas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Salas de Chat</h1>
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Criar Nova Sala
              </button>
            </div>
          </div>

          <div className="p-6">
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Nenhuma sala encontrada</p>
                <p className="text-gray-400 mt-2">Seja o primeiro a criar uma sala!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {room.name}
                    </h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Slug: {room.slug}</p>
                      <p>Limite: {room.maxUsers} usuários</p>
                      <p>Criada em: {new Date(room.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
