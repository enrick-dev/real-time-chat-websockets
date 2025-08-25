export interface CreateRoomRequest {
  name: string;
  maxUsers: number;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
}
