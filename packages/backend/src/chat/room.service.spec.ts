import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RoomService', () => {
  let service: RoomService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    room: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    const createRoomDto = {
      name: 'Test Room',
      maxUsers: 10,
    };

    const mockRoom = {
      id: 'room-id',
      name: 'Test Room',
      slug: 'test-room',
      maxUsers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a room successfully', async () => {
      // Arrange
      mockPrismaService.room.findUnique.mockResolvedValue(null);
      mockPrismaService.room.create.mockResolvedValue(mockRoom);

      // Act
      const result = await service.createRoom(createRoomDto);

      // Assert
      expect(mockPrismaService.room.create).toHaveBeenCalledWith({
        data: {
          name: createRoomDto.name,
          slug: expect.any(String),
          maxUsers: createRoomDto.maxUsers,
        },
      });
      expect(result).toEqual(mockRoom);
    });

    it('should handle slug generation for room names with special characters', async () => {
      // Arrange
      const roomWithSpecialChars = {
        name: 'Test Room!@#$%^&*()',
        maxUsers: 5,
      };
      mockPrismaService.room.findUnique.mockResolvedValue(null);
      mockPrismaService.room.create.mockResolvedValue({
        ...mockRoom,
        name: roomWithSpecialChars.name,
        slug: 'test-room',
      });

      // Act
      const result = await service.createRoom(roomWithSpecialChars);

      // Assert
      expect(mockPrismaService.room.create).toHaveBeenCalledWith({
        data: {
          name: roomWithSpecialChars.name,
          slug: expect.any(String),
          maxUsers: roomWithSpecialChars.maxUsers,
        },
      });
      expect(result.slug).toBe('test-room');
    });
  });

  describe('getRoomBySlug', () => {
    const slug = 'test-room';
    const mockRoom = {
      id: 'room-id',
      name: 'Test Room',
      slug: 'test-room',
      maxUsers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return room if found', async () => {
      // Arrange
      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);

      // Act
      const result = await service.getRoomBySlug(slug);

      // Assert
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledWith({
        where: { slug },
      });
      expect(result).toEqual(mockRoom);
    });

    it('should throw NotFoundException if room not found', async () => {
      // Arrange
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getRoomBySlug(slug)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledWith({
        where: { slug },
      });
    });
  });

  describe('getAllRooms', () => {
    const mockRooms = [
      {
        id: 'room-1',
        name: 'Room 1',
        slug: 'room-1',
        maxUsers: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'room-2',
        name: 'Room 2',
        slug: 'room-2',
        maxUsers: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all rooms ordered by creation date desc', async () => {
      // Arrange
      mockPrismaService.room.findMany.mockResolvedValue(mockRooms);

      // Act
      const result = await service.getAllRooms();

      // Assert
      expect(mockPrismaService.room.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockRooms);
    });

    it('should return empty array if no rooms exist', async () => {
      // Arrange
      mockPrismaService.room.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getAllRooms();

      // Assert
      expect(mockPrismaService.room.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('getRoomById', () => {
    const roomId = 'room-id';
    const mockRoom = {
      id: 'room-id',
      name: 'Test Room',
      slug: 'test-room',
      maxUsers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return room if found', async () => {
      // Arrange
      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);

      // Act
      const result = await service.getRoomById(roomId);

      // Assert
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledWith({
        where: { id: roomId },
      });
      expect(result).toEqual(mockRoom);
    });

    it('should throw NotFoundException if room not found', async () => {
      // Arrange
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getRoomById(roomId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledWith({
        where: { id: roomId },
      });
    });
  });
});
