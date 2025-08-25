import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService', () => {
  let service: ChatService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    const createMessageDto = {
      text: 'Hello, world!',
      userId: 'user-id',
      userName: 'Test User',
      roomId: 'room-id',
    };

    const mockMessage = {
      id: 'message-id',
      text: 'Hello, world!',
      userName: 'Test User',
      userId: 'user-id',
      roomId: 'room-id',
      createdAt: new Date(),
    };

    it('should create a message successfully', async () => {
      // Arrange
      mockPrismaService.message.create.mockResolvedValue(mockMessage);

      // Act
      const result = await service.createMessage(createMessageDto);

      // Assert
      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: {
          text: createMessageDto.text,
          userId: createMessageDto.userId,
          userName: createMessageDto.userName,
          roomId: createMessageDto.roomId,
        },
        select: {
          id: true,
          text: true,
          userName: true,
          userId: true,
          roomId: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockMessage);
    });

    it('should handle message creation with special characters', async () => {
      // Arrange
      const messageWithSpecialChars = {
        ...createMessageDto,
        text: 'Hello! @#$%^&*()_+-=[]{}|;:,.<>?',
      };
      const mockMessageWithSpecialChars = {
        ...mockMessage,
        text: messageWithSpecialChars.text,
      };
      mockPrismaService.message.create.mockResolvedValue(
        mockMessageWithSpecialChars,
      );

      // Act
      const result = await service.createMessage(messageWithSpecialChars);

      // Assert
      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: {
          text: messageWithSpecialChars.text,
          userId: messageWithSpecialChars.userId,
          userName: messageWithSpecialChars.userName,
          roomId: messageWithSpecialChars.roomId,
        },
        select: {
          id: true,
          text: true,
          userName: true,
          userId: true,
          roomId: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockMessageWithSpecialChars);
    });
  });

  describe('getRecentMessages', () => {
    const roomId = 'room-id';
    const limit = 50;

    const mockMessages = [
      {
        id: 'message-1',
        text: 'First message',
        userName: 'User 1',
        userId: 'user-1',
        roomId: 'room-id',
        createdAt: new Date('2025-01-01T10:00:00Z'),
      },
      {
        id: 'message-2',
        text: 'Second message',
        userName: 'User 2',
        userId: 'user-2',
        roomId: 'room-id',
        createdAt: new Date('2025-01-01T11:00:00Z'),
      },
      {
        id: 'message-3',
        text: 'Third message',
        userName: 'User 3',
        userId: 'user-3',
        roomId: 'room-id',
        createdAt: new Date('2025-01-01T12:00:00Z'),
      },
    ];

    it('should return recent messages for a room with default limit', async () => {
      // Arrange
      mockPrismaService.message.findMany.mockResolvedValue(mockMessages);

      // Act
      const result = await service.getRecentMessages(roomId);

      // Assert
      expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
        where: {
          roomId: roomId,
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          text: true,
          userName: true,
          userId: true,
          roomId: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockMessages.reverse());
    });

    it('should return recent messages with custom limit', async () => {
      // Arrange
      const customLimit = 10;
      mockPrismaService.message.findMany.mockResolvedValue(
        mockMessages.slice(0, 2),
      );

      // Act
      const result = await service.getRecentMessages(roomId, customLimit);

      // Assert
      expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
        where: {
          roomId: roomId,
        },
        take: customLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          text: true,
          userName: true,
          userId: true,
          roomId: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockMessages.slice(0, 2).reverse());
    });

    it('should return empty array when no messages exist', async () => {
      // Arrange
      mockPrismaService.message.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getRecentMessages(roomId);

      // Assert
      expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
        where: {
          roomId: roomId,
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          text: true,
          userName: true,
          userId: true,
          roomId: true,
          createdAt: true,
        },
      });
      expect(result).toEqual([]);
    });

    it('should filter messages by roomId correctly', async () => {
      // Arrange
      const differentRoomId = 'different-room-id';
      mockPrismaService.message.findMany.mockResolvedValue([]);

      // Act
      await service.getRecentMessages(differentRoomId);

      // Assert
      expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
        where: {
          roomId: differentRoomId,
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          text: true,
          userName: true,
          userId: true,
          roomId: true,
          createdAt: true,
        },
      });
    });
  });
});
