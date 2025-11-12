import { db } from '@/lib/db';
import { friends, friendRequests, rankings, players } from '@/drizzle/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import { ErrorCode, type RankingType } from '@/types';

const MAX_FRIENDS = 50;

/**
 * Get player's friends list
 */
export async function getPlayerFriends(playerId: string) {
  const friendsList = await db
    .select({
      friendshipId: friends.id,
      friendId: friends.friendId,
      friendshipPoints: friends.friendshipPoints,
      lastInteraction: friends.lastInteraction,
      createdAt: friends.createdAt,
      username: players.username,
      level: players.level,
      iconUrl: players.iconUrl,
      lastLoginDate: players.lastLoginDate,
    })
    .from(friends)
    .innerJoin(players, eq(friends.friendId, players.id))
    .where(eq(friends.playerId, playerId));

  return friendsList;
}

/**
 * Get pending friend requests (received)
 */
export async function getPendingFriendRequests(playerId: string) {
  const requests = await db
    .select({
      requestId: friendRequests.id,
      senderId: friendRequests.senderId,
      status: friendRequests.status,
      createdAt: friendRequests.createdAt,
      username: players.username,
      level: players.level,
      iconUrl: players.iconUrl,
    })
    .from(friendRequests)
    .innerJoin(players, eq(friendRequests.senderId, players.id))
    .where(
      and(
        eq(friendRequests.receiverId, playerId),
        eq(friendRequests.status, 'pending')
      )
    );

  return requests;
}

/**
 * Get sent friend requests
 */
export async function getSentFriendRequests(playerId: string) {
  const requests = await db
    .select({
      requestId: friendRequests.id,
      receiverId: friendRequests.receiverId,
      status: friendRequests.status,
      createdAt: friendRequests.createdAt,
      username: players.username,
      level: players.level,
      iconUrl: players.iconUrl,
    })
    .from(friendRequests)
    .innerJoin(players, eq(friendRequests.receiverId, players.id))
    .where(
      and(
        eq(friendRequests.senderId, playerId),
        eq(friendRequests.status, 'pending')
      )
    );

  return requests;
}

/**
 * Send friend request
 */
export async function sendFriendRequest(senderId: string, receiverId: string) {
  // Cannot send request to self
  if (senderId === receiverId) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Cannot send friend request to yourself',
    };
  }

  // Check if receiver exists
  const [receiver] = await db
    .select()
    .from(players)
    .where(eq(players.id, receiverId))
    .limit(1);

  if (!receiver) {
    throw {
      code: ErrorCode.PLAYER_NOT_FOUND,
      message: 'Player not found',
    };
  }

  // Check if already friends
  const existingFriendship = await db
    .select()
    .from(friends)
    .where(
      or(
        and(eq(friends.playerId, senderId), eq(friends.friendId, receiverId)),
        and(eq(friends.playerId, receiverId), eq(friends.friendId, senderId))
      )
    )
    .limit(1);

  if (existingFriendship.length > 0) {
    throw {
      code: ErrorCode.ALREADY_FRIENDS,
      message: 'Already friends with this player',
    };
  }

  // Check if pending request already exists
  const existingRequest = await db
    .select()
    .from(friendRequests)
    .where(
      or(
        and(
          eq(friendRequests.senderId, senderId),
          eq(friendRequests.receiverId, receiverId),
          eq(friendRequests.status, 'pending')
        ),
        and(
          eq(friendRequests.senderId, receiverId),
          eq(friendRequests.receiverId, senderId),
          eq(friendRequests.status, 'pending')
        )
      )
    )
    .limit(1);

  if (existingRequest.length > 0) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Friend request already pending',
    };
  }

  // Check friend limit for sender
  const senderFriends = await getPlayerFriends(senderId);
  if (senderFriends.length >= MAX_FRIENDS) {
    throw {
      code: ErrorCode.FRIEND_LIMIT_REACHED,
      message: `Maximum ${MAX_FRIENDS} friends allowed`,
    };
  }

  // Create friend request
  const [request] = await db
    .insert(friendRequests)
    .values({
      senderId,
      receiverId,
      status: 'pending',
    })
    .returning();

  return request;
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(playerId: string, requestId: string) {
  // Get request
  const [request] = await db
    .select()
    .from(friendRequests)
    .where(eq(friendRequests.id, requestId))
    .limit(1);

  if (!request) {
    throw {
      code: ErrorCode.FRIEND_REQUEST_NOT_FOUND,
      message: 'Friend request not found',
    };
  }

  // Verify receiver
  if (request.receiverId !== playerId) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Not authorized to accept this request',
    };
  }

  // Check if request is still pending
  if (request.status !== 'pending') {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Friend request already processed',
    };
  }

  // Check friend limit for both players
  const [receiverFriends, senderFriends] = await Promise.all([
    getPlayerFriends(request.receiverId),
    getPlayerFriends(request.senderId),
  ]);

  if (receiverFriends.length >= MAX_FRIENDS) {
    throw {
      code: ErrorCode.FRIEND_LIMIT_REACHED,
      message: `Maximum ${MAX_FRIENDS} friends allowed`,
    };
  }

  if (senderFriends.length >= MAX_FRIENDS) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Sender has reached friend limit',
    };
  }

  // Update request status
  await db
    .update(friendRequests)
    .set({
      status: 'accepted',
      respondedAt: new Date(),
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

  return { success: true };
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(
  playerId: string,
  requestId: string
) {
  // Get request
  const [request] = await db
    .select()
    .from(friendRequests)
    .where(eq(friendRequests.id, requestId))
    .limit(1);

  if (!request) {
    throw {
      code: ErrorCode.FRIEND_REQUEST_NOT_FOUND,
      message: 'Friend request not found',
    };
  }

  // Verify receiver
  if (request.receiverId !== playerId) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Not authorized to reject this request',
    };
  }

  // Update request status
  await db
    .update(friendRequests)
    .set({
      status: 'rejected',
      respondedAt: new Date(),
    })
    .where(eq(friendRequests.id, requestId));

  return { success: true };
}

/**
 * Remove friend
 */
export async function removeFriend(playerId: string, friendId: string) {
  // Delete friendship (bidirectional)
  await db
    .delete(friends)
    .where(
      or(
        and(eq(friends.playerId, playerId), eq(friends.friendId, friendId)),
        and(eq(friends.playerId, friendId), eq(friends.friendId, playerId))
      )
    );

  return { success: true };
}

/**
 * Use friend support card
 */
export async function useFriendSupport(playerId: string, friendId: string) {
  // Verify friendship
  const [friendship] = await db
    .select()
    .from(friends)
    .where(and(eq(friends.playerId, playerId), eq(friends.friendId, friendId)))
    .limit(1);

  if (!friendship) {
    throw {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Not friends with this player',
    };
  }

  // Add friendship points (to both players)
  const friendshipPoints = 10;

  await db
    .update(friends)
    .set({
      friendshipPoints: sql`${friends.friendshipPoints} + ${friendshipPoints}`,
      lastInteraction: new Date(),
    })
    .where(
      or(
        and(eq(friends.playerId, playerId), eq(friends.friendId, friendId)),
        and(eq(friends.playerId, friendId), eq(friends.friendId, playerId))
      )
    );

  return { friendshipPoints };
}

/**
 * Get ranking
 */
export async function getRanking(
  rankingType: RankingType,
  season: string,
  limit: number = 100
) {
  const rankingData = await db
    .select({
      rank: rankings.rank,
      playerId: rankings.playerId,
      score: rankings.score,
      username: players.username,
      level: players.level,
      iconUrl: players.iconUrl,
    })
    .from(rankings)
    .innerJoin(players, eq(rankings.playerId, players.id))
    .where(
      and(eq(rankings.rankingType, rankingType), eq(rankings.season, season))
    )
    .orderBy(rankings.rank)
    .limit(limit);

  return rankingData;
}

/**
 * Get player rank
 */
export async function getPlayerRank(
  playerId: string,
  rankingType: RankingType,
  season: string
) {
  const [rankData] = await db
    .select()
    .from(rankings)
    .where(
      and(
        eq(rankings.playerId, playerId),
        eq(rankings.rankingType, rankingType),
        eq(rankings.season, season)
      )
    )
    .limit(1);

  return rankData || null;
}

/**
 * Update player ranking score
 */
export async function updateRankingScore(
  playerId: string,
  rankingType: RankingType,
  season: string,
  scoreChange: number
) {
  // Get current rank or create new one
  let rankData = await getPlayerRank(playerId, rankingType, season);

  if (!rankData) {
    // Create new ranking entry
    [rankData] = await db
      .insert(rankings)
      .values({
        playerId,
        rankingType,
        season,
        score: Math.max(0, scoreChange),
        rank: 0,
      })
      .returning();
  } else {
    // Update score
    [rankData] = await db
      .update(rankings)
      .set({
        score: sql`${rankings.score} + ${scoreChange}`,
        updatedAt: new Date(),
      })
      .where(eq(rankings.id, rankData.id))
      .returning();
  }

  // Recalculate ranks for this season
  await recalculateRanks(rankingType, season);

  return rankData;
}

/**
 * Recalculate all ranks for a season
 */
async function recalculateRanks(rankingType: RankingType, season: string) {
  // Get all players sorted by score
  const allRankings = await db
    .select()
    .from(rankings)
    .where(
      and(eq(rankings.rankingType, rankingType), eq(rankings.season, season))
    )
    .orderBy(desc(rankings.score));

  // Update ranks
  for (let i = 0; i < allRankings.length; i++) {
    await db
      .update(rankings)
      .set({ rank: i + 1 })
      .where(eq(rankings.id, allRankings[i].id));
  }
}
