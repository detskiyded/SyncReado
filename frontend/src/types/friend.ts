interface FriendUser {
  id: string;
  email: string;
}

interface FriendRequest {
  id: string;
  requester: FriendUser;
  addressee: FriendUser;
}

export type {FriendUser, FriendRequest}