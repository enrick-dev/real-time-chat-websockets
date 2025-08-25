export interface Message {
  id: string;
  text: string;
  userName: string;
  createdAt: string;
}

export interface ChatEvent {
  userId: string;
  userName: string;
}
