interface Room {
  id: string,
  name: string,
  inviteCode: string,
  bookId: string,
  creatorId: string,
  createdAt: string,

  // Опциональные поля, в запросе могут не быть
  book?: {title: string}
  creator?: {email: string}
  roomMembers?: RoomMember[]
  _count?: {roomMembers: number}
}

interface RoomMember {
  id: string,
  roomId: string,
  userId: string,
  joinedAt: string,

  user?: {email: string}
}

export type {Room, RoomMember}