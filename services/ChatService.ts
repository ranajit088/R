
/**
 * Generates a consistent unique ID for a chat room between two users
 * by sorting their UIDs and joining them.
 */
export const getChatRoomId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join('_');
};

/**
 * Firestore Security Rules Recommendation:
 * 
 * match /chatRooms/{roomId} {
 *   allow read, write: if request.auth != null && 
 *     request.auth.uid in resource.data.participants;
 *   
 *   match /messages/{messageId} {
 *     allow read, write: if request.auth != null && 
 *       get(/databases/$(database)/documents/chatRooms/$(roomId)).data.participants.hasAny([request.auth.uid]);
 *   }
 * }
 */

export const ChatService = {
  getChatRoomId,
  
  /**
   * Simulated function to check/create chat room
   */
  async ensureChatRoomExists(myId: string, theirId: string) {
    const roomId = getChatRoomId(myId, theirId);
    const rooms = JSON.parse(localStorage.getItem('simulated_firestore_rooms') || '[]');
    
    const existingRoom = rooms.find((r: any) => r.id === roomId);
    if (!existingRoom) {
      const newRoom = {
        id: roomId,
        participants: [myId, theirId],
        createdAt: Date.now(),
        lastMessage: '',
        lastMessageTimestamp: Date.now()
      };
      localStorage.setItem('simulated_firestore_rooms', JSON.stringify([...rooms, newRoom]));
      return newRoom;
    }
    return existingRoom;
  }
};
