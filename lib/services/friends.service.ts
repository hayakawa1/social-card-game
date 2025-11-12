import { db } from '@/lib/db';
import { friends, friendRequests, players } from '@/drizzle/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import { ErrorCode, type FriendRequestStatus } from '@/types';
import { logger } from '@/lib/logger';

export interface FriendWithDetails {
  id: string;
  playerId: string;
  friendId: string;
  friendName: string;
  friendshipPoints: number;
  lastInteraction: Date;
  createdAt: Date;
}

export interface FriendRequestWithDetails {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: FriendRequestStatus;
  createdAt: Date;
  respondedAt?: Date;
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(
  senderId: string,
  receiverUsername: string
): Promise<FriendRequestWithDetails> {
  try {
    // Find receiver by username
    const receiver = await db.query.players.findFirst({
      where: eq(players.username, receiverUsername),
    });

    if (!receiver) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'ユーザーが見つかりません',
      };
    }

    if (receiver.id === senderId) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: '自分自身にフレンドリクエストを送ることはできません',
      };
    }

    // Check if already friends
    const existingFriendship = await db.query.friends.findFirst({
      where: or(
        and(eq(friends.playerId, senderId), eq(friends.friendId, receiver.id)),
        and(eq(friends.playerId, receiver.id), eq(friends.friendId, senderId))
      ),
    });

    if (existingFriendship) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'すでにフレンドです',
      };
    }

    // Check for existing pending request
    const existingRequest = await db.query.friendRequests.findFirst({
      where: and(
        or(
          and(
            eq(friendRequests.senderId, senderId),
            eq(friendRequests.receiverId, receiver.id)
          ),
          and(
            eq(friendRequests.senderId, receiver.id),
            eq(friendRequests.receiverId, senderId)
          )
        ),
        eq(friendRequests.status, 'pending')
      ),
    });

    if (existingRequest) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: '既にフレンドリクエストが送信されています',
      };
    }

    // Create friend request
    const [request] = await db
      .insert(friendRequests)
      .values({
        senderId,
        receiverId: receiver.id,
        status: 'pending',
      })
      .returning();

    const sender = await db.query.players.findFirst({
      where: eq(players.id, senderId),
    });

    logger.info('Friend request sent', {
      senderId,
      receiverId: receiver.id,
      requestId: request.id,
    });

    return {
      id: request.id,
      senderId: request.senderId,
      senderName: sender?.username || '',
      receiverId: request.receiverId,
      receiverName: receiver.username,
      status: request.status as FriendRequestStatus,
      createdAt: new Date(request.createdAt),
    };
  } catch (error) {
    logger.error('Failed to send friend request', error as Error, { senderId, receiverUsername });
    throw error;
  }
}

/**
 * Get friend requests for a user
 */
export async function getFriendRequests(
  userId: string,
  type: 'sent' | 'received'
): Promise<FriendRequestWithDetails[]> {
  try {
    const requests = await db
      .select()
      .from(friendRequests)
      .where(
        and(
          type === 'sent'
            ? eq(friendRequests.senderId, userId)
            : eq(friendRequests.receiverId, userId),
          eq(friendRequests.status, 'pending')
        )
      )
      .orderBy(desc(friendRequests.createdAt));

    const requestsWithDetails: FriendRequestWithDetails[] = [];

    for (const request of requests) {
      const sender = await db.query.players.findFirst({
        where: eq(players.id, request.senderId),
      });
      const receiver = await db.query.players.findFirst({
        where: eq(players.id, request.receiverId),
      });

      if (sender && receiver) {
        requestsWithDetails.push({
          id: request.id,
          senderId: request.senderId,
          senderName: sender.username,
          receiverId: request.receiverId,
          receiverName: receiver.username,
          status: request.status as FriendRequestStatus,
          createdAt: new Date(request.createdAt),
          respondedAt: request.respondedAt ? new Date(request.respondedAt) : undefined,
        });
      }
    }

    return requestsWithDetails;
  } catch (error) {
    logger.error('Failed to get friend requests', error as Error, { userId, type });
    throw error;
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(
  userId: string,
  requestId: string
): Promise<void> {
  try {
    const request = await db.query.friendRequests.findFirst({
      where: eq(friendRequests.id, requestId),
    });

    if (!request) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'フレンドリクエストが見つかりません',
      };
    }

    if (request.receiverId !== userId) {
      throw {
        code: ErrorCode.UNAUTHORIZED,
        message: '権限がありません',
      };
    }

    if (request.status !== 'pending') {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'このリクエストは既に処理されています',
      };
    }

    // Update request status
    await db
      .update(friendRequests)
      .set({
        status: 'accepted',
        respondedAt: Date.now(),
      })
      .where(eq(friendRequests.id, requestId));

    // Create friendship (bidirectional)
    await db.insert(friends).values([
      {
        playerId: request.senderId,
        friendId: request.receiverId,
        friendshipPoints: 0,
      },
      {
        playerId: request.receiverId,
        friendId: request.senderId,
        friendshipPoints: 0,
      },
    ]);

    logger.info('Friend request accepted', {
      requestId,
      senderId: request.senderId,
      receiverId: request.receiverId,
    });
  } catch (error) {
    logger.error('Failed to accept friend request', error as Error, { userId, requestId });
    throw error;
  }
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(
  userId: string,
  requestId: string
): Promise<void> {
  try {
    const request = await db.query.friendRequests.findFirst({
      where: eq(friendRequests.id, requestId),
    });

    if (!request) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'フレンドリクエストが見つかりません',
      };
    }

    if (request.receiverId !== userId) {
      throw {
        code: ErrorCode.UNAUTHORIZED,
        message: '権限がありません',
      };
    }

    if (request.status !== 'pending') {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'このリクエストは既に処理されています',
      };
    }

    // Update request status
    await db
      .update(friendRequests)
      .set({
        status: 'rejected',
        respondedAt: Date.now(),
      })
      .where(eq(friendRequests.id, requestId));

    logger.info('Friend request rejected', {
      requestId,
      senderId: request.senderId,
      receiverId: request.receiverId,
    });
  } catch (error) {
    logger.error('Failed to reject friend request', error as Error, { userId, requestId });
    throw error;
  }
}

/**
 * Get friends list for a user
 */
export async function getFriends(userId: string): Promise<FriendWithDetails[]> {
  try {
    const friendships = await db
      .select()
      .from(friends)
      .where(eq(friends.playerId, userId))
      .orderBy(desc(friends.lastInteraction));

    const friendsWithDetails: FriendWithDetails[] = [];

    for (const friendship of friendships) {
      const friend = await db.query.players.findFirst({
        where: eq(players.id, friendship.friendId),
      });

      if (friend) {
        friendsWithDetails.push({
          id: friendship.id,
          playerId: friendship.playerId,
          friendId: friendship.friendId,
          friendName: friend.username,
          friendshipPoints: friendship.friendshipPoints,
          lastInteraction: new Date(friendship.lastInteraction),
          createdAt: new Date(friendship.createdAt),
        });
      }
    }

    return friendsWithDetails;
  } catch (error) {
    logger.error('Failed to get friends', error as Error, { userId });
    throw error;
  }
}

/**
 * Remove a friend
 */
export async function removeFriend(userId: string, friendshipId: string): Promise<void> {
  try {
    const friendship = await db.query.friends.findFirst({
      where: eq(friends.id, friendshipId),
    });

    if (!friendship) {
      throw {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'フレンドが見つかりません',
      };
    }

    if (friendship.playerId !== userId) {
      throw {
        code: ErrorCode.UNAUTHORIZED,
        message: '権限がありません',
      };
    }

    // Remove bidirectional friendship
    await db.delete(friends).where(
      or(
        and(
          eq(friends.playerId, friendship.playerId),
          eq(friends.friendId, friendship.friendId)
        ),
        and(
          eq(friends.playerId, friendship.friendId),
          eq(friends.friendId, friendship.playerId)
        )
      )
    );

    logger.info('Friend removed', {
      userId,
      friendshipId,
      friendId: friendship.friendId,
    });
  } catch (error) {
    logger.error('Failed to remove friend', error as Error, { userId, friendshipId });
    throw error;
  }
}

/**
 * Search for users by username
 */
export async function searchUsers(
  currentUserId: string,
  searchQuery: string
): Promise<Array<{ id: string; username: string; level: number }>> {
  try {
    if (searchQuery.length < 2) {
      return [];
    }

    const users = await db.query.players.findMany({
      where: sql`${players.username} LIKE ${'%' + searchQuery + '%'}`,
      limit: 10,
    });

    // Filter out current user
    return users
      .filter((user) => user.id !== currentUserId)
      .map((user) => ({
        id: user.id,
        username: user.username,
        level: user.level,
      }));
  } catch (error) {
    logger.error('Failed to search users', error as Error, { currentUserId, searchQuery });
    throw error;
  }
}
