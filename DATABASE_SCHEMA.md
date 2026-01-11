
# SocialConnect Firestore Database Schema

This document outlines the recommended structure for your Firebase project to support a high-performance social media experience.

## 1. Users Collection (`users`)
**Path:** `/users/{uid}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String | Unique Identifier (matches Auth UID) |
| `name` | String | Full display name |
| `email` | String | User's email address |
| `profilePic` | String | URL to Firebase Storage image |
| `bio` | String | Short user biography |
| `city` | String | Current location |
| `createdAt` | Timestamp | Server timestamp of registration |

### Followers Sub-collection
**Path:** `/users/{uid}/followers/{followerUid}`
- Document ID is the UID of the person following this user.
- Empty document or `{ "timestamp": ServerTimestamp }`.

### Following Sub-collection
**Path:** `/users/{uid}/following/{followingUid}`
- Document ID is the UID of the person this user is following.
- Empty document or `{ "timestamp": ServerTimestamp }`.

---

## 2. Posts Collection (`posts`)
**Path:** `/posts/{postId}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `postId` | String | Unique ID for the post |
| `creatorId` | String | UID of the author |
| `creatorName` | String | Denormalized: Author's name for fast UI rendering |
| `creatorImage`| String | Denormalized: Author's profile pic URL |
| `content` | String | The text of the post |
| `imageUrl` | String | Optional: URL to post image |
| `likesCount` | Number | Counter (use Firestore Increments) |
| `commentsCount`| Number | Counter (use Firestore Increments) |
| `timestamp` | Timestamp | Server timestamp for sorting the feed |

### Likes Sub-collection
**Path:** `/posts/{postId}/likes/{uid}`
- Document ID is the UID of the user who liked the post.
- Allows for $O(1)$ lookup to check if current user liked the post.

### Comments Sub-collection
**Path:** `/posts/{postId}/comments/{commentId}`
- Fields: `uid`, `userName`, `userImage`, `text`, `timestamp`.

---

## 3. Best Practices for Social Feeds

### Scaling Likes/Comments
For very popular posts (celebrity status), use **Distributed Counters** if you expect more than 1 update per second to the `likesCount` field.

### Data Syncing
When a user updates their `profilePic`, you should run a **Cloud Function** that finds all posts by that `creatorId` and updates the `creatorImage` field in the `posts` collection to keep the UI consistent.

### Security Rules Hint
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{post} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.creatorId == request.auth.uid;
    }
  }
}
```
