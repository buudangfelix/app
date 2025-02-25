import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite"
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.howard.four-musketeers",
  projectId: "677a4b6c0008a8f08524",
  databaseId: "677a4be9001368613e54",
  usersCollectionId: "677a4bf8001fdb9c943b",
  weaponsCollectionId: "677a4cca00125ce56fd5",
  cartCollectionId: "677a4d710024ce71c891",
  ordersCollectionId: "678ddffd00390614d4aa",
  viewsCollectionId: "677db59a00136a842218",
  commentsCollectionId: "6785b184002c32997ce8",
  ratingsCollectionId: "67a0ea52000ae0d50078",
  storageId: "677bd95b0015e5bbf5a0",
  searchHistoryCollectionId: "67a94a0e002c57ddba83",
  viewHistoryCollectionId: "67b2b3850009ec54736d"
}

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  usersCollectionId,
  weaponsCollectionId,
  cartCollectionId,
  ordersCollectionId,
  viewsCollectionId,
  commentsCollectionId,
  ratingsCollectionId,
  storageId,
  searchHistoryCollectionId,
  viewHistoryCollectionId
} = config

const client = new Client();

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export async function createUser(username, email, password) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) throw Error;

    const avatar = avatars.getInitials(username);

    const newUser = await databases.createDocument(
      databaseId,
      usersCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        username: username,
        email: email,
        avatar: avatar
      }
    );

    return newUser;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function signOut() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    )
    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function getAllWeapons() {
  try {
    const weapons = await databases.listDocuments(
      databaseId,
      weaponsCollectionId,
      [Query.orderAsc("$createdAt")]
    )
    return weapons.documents;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function getWeapon(weaponId) {
  try {
    const weapon = await databases.listDocuments(
      databaseId,
      weaponsCollectionId,
      [Query.equal("$id", weaponId)]
    )
    return weapon.documents[0]
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function addItemsToCart(weaponId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;

    const record = await databases.listDocuments(
      databaseId,
      cartCollectionId,
      [Query.equal("users", currentUser.$id), Query.equal("weapons", weaponId)]
    )
    if (record.documents.length === 0) {
      await databases.createDocument(
        databaseId,
        cartCollectionId,
        ID.unique(),
        {
          users: currentUser.$id,
          weapons: weaponId,
          quantity: 1
        }
      )
    } else {
      await databases.updateDocument(
        databaseId,
        cartCollectionId,
        record.documents[0].$id,
        {
          users: currentUser.$id,
          weapons: weaponId,
          quantity: record.documents[0].quantity + 1
        }
      )
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function getAllCartItems() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;

    const items = await databases.listDocuments(
      databaseId,
      cartCollectionId,
      [Query.equal("users", currentUser.$id), Query.orderDesc("$createdAt")]
    );
    return items.documents;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function modifyCartItem(weaponId, quantity) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;

    const record = await databases.listDocuments(
      databaseId,
      cartCollectionId,
      [Query.equal("users", currentUser.$id), Query.equal("weapons", weaponId)]
    )

    if (quantity > 0) {
      await databases.updateDocument(
        databaseId,
        cartCollectionId,
        record.documents[0].$id,
        {
          users: currentUser.$id,
          weapons: weaponId,
          quantity: quantity
        }
      )
    } else {
      await databases.deleteDocument(
        databaseId,
        cartCollectionId,
        record.documents[0].$id
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function clearCartItems() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;

    const items = await databases.listDocuments(
      databaseId,
      cartCollectionId,
      [Query.equal("users", currentUser.$id)]
    );
    if (!items.documents.length) return;

    const deletePromises = items.documents.map(async document => {
      await databases.deleteDocument(
        databaseId,
        cartCollectionId,
        document.$id
      )
    });
    await Promise.all(deletePromises);
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

export async function addToOrder(weaponIds, quantities, amount) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;
    const order = await databases.createDocument(
      databaseId,
      ordersCollectionId,
      ID.unique(),
      {
        users: currentUser.$id,
        weapons: weaponIds,
        quantities: quantities,
        amount: amount
      }
    )
    return order;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

export async function getAllOrders() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;
    const weapons = await getAllWeapons();
    const orders = await databases.listDocuments(
      databaseId,
      ordersCollectionId,
      [Query.equal("users", currentUser.$id), Query.orderDesc("$createdAt")]
    );
    return orders.documents;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

export async function getFilePreview(fileId) {
  let fileUrl;

  try {
    fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, "top", 100);
    if (!fileUrl) throw Error;
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export async function uploadFile(file) {
  if (!file) return;

  const { fileName, mimeType, fileSize, uri } = file;
  const asset = { name: fileName, type: mimeType, size: fileSize, uri: uri };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );
    const fileUrl = await getFilePreview(uploadedFile.$id);
    return fileUrl;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function modifyProfile(username, oldPassword, newPassword, avatar, isNewAvatarPicked) {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    if (username !== currentAccount.name) {
      await account.updateName(username);
    }

    if (newPassword !== "" && oldPassword != "") {
      await account.updatePassword(newPassword, oldPassword);
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;

    const avatarUrl = avatar && isNewAvatarPicked ? await uploadFile(avatar) : currentUser.avatar;

    const newUser = await databases.updateDocument(
      databaseId,
      usersCollectionId,
      currentUser.$id,
      {
        username: username,
        avatar: avatarUrl
      }
    );

    return newUser;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function modifyViews(weaponId) {
  try {
    const record = await databases.listDocuments(
      databaseId,
      viewsCollectionId,
      [Query.equal("weapons", weaponId)]
    );
    if (record.documents.length === 0) {
      await databases.createDocument(
        databaseId,
        viewsCollectionId,
        ID.unique(),
        {
          weapons: weaponId,
          views: 1
        }
      );
    } else {
      await databases.updateDocument(
        databaseId,
        viewsCollectionId,
        record.documents[0].$id,
        {
          weapons: weaponId,
          views: record.documents[0].views + 1
        }
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function getTrendingItems() {
  try {
    const result = await databases.listDocuments(
      databaseId,
      viewsCollectionId,
      [Query.orderDesc("views"), Query.limit(5)]
    )
    return result.documents;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function getAllComments(weaponId) {
  try {
    const comments = await databases.listDocuments(
      databaseId,
      commentsCollectionId,
      [Query.equal("weapons", weaponId), Query.orderDesc("$createdAt")]
    )
    return comments.documents;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function addComments(weaponId, comment) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;

    const result = await databases.createDocument(
      databaseId,
      commentsCollectionId,
      ID.unique(),
      {
        users: currentUser.$id,
        weapons: weaponId,
        comment: comment
      }
    );
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export async function getAllRatings(weaponId){
  try{
    const ratings = await databases.listDocuments(
      databaseId, 
      ratingsCollectionId,
      [Query.equal("weapons", weaponId), Query.orderDesc("$createdAt")]
    )
    return ratings.documents;
  }
  catch(error){
    console.error(error);
    throw new Error(error);
  }
}


export async function addStarRating(weaponId, rating){
  try {
    const currentUser = await getCurrentUser();
    if(!currentUser) throw Error;
    const result = await databases.createDocument(
      databaseId,
      ratingsCollectionId,
      ID.unique(),
      {
        users: currentUser.$id,
        weapons: weaponId,
        rating: rating
      }
    );
    return result;
  }
  catch(error){
    console.error(error);
    throw new Error(error);
  }

}


export async function getAllCommentsAndRatings(weaponId) {
  try {
    const [comments, ratings] = await Promise.all([
      getAllComments(weaponId),
      getAllRatings(weaponId)
    ]);

    // Convert Appwrite timestamp to Date object
    const getTimeFromString = (timeStr) => new Date(timeStr).getTime();

    // Create a map of ratings by user
    const ratingsMap = new Map();
    ratings.forEach((rating) => {
      if (rating.users?.$id && rating.$createdAt) {
        // Group ratings by user ID
        if (!ratingsMap.has(rating.users.$id)) {
          ratingsMap.set(rating.users.$id, []);
        }
        ratingsMap.get(rating.users.$id).push({
          timestamp: getTimeFromString(rating.$createdAt),
          rating: rating.rating,
          ratingId: rating.$id,  // Add the rating ID
          created: rating.$createdAt
        });
      }
    });

    // Merge ratings into comments with time window matching
    const mergedData = comments.map((comment) => {
      if (!comment.users?.$id || !comment.$createdAt) {
        return { ...comment, rating: null, ratingId: null };
      }

      const userRatings = ratingsMap.get(comment.users.$id) || [];
      const commentTime = getTimeFromString(comment.$createdAt);
      
      // Find the closest rating within 5 seconds (5000 milliseconds)
      const TIME_WINDOW = 5000; // 5 seconds
      const matchedRating = userRatings.find(rating => {
        const timeDiff = Math.abs(rating.timestamp - commentTime);
        return timeDiff <= TIME_WINDOW;
      });

      return {
        ...comment,
        rating: matchedRating ? matchedRating.rating : null,
        ratingId: matchedRating ? matchedRating.ratingId : null,  // Add the rating ID
        ratingCreated: matchedRating ? matchedRating.created : null
      };
    });

    return mergedData;

  } catch (error) {
    console.error("Error in getAllCommentsAndRatings:", error);
    throw new Error(`Failed to fetch comments and ratings: ${error.message}`);
  }
}

export async function hasUserReviewed(weaponId){
  try{
    const currentUser = await getCurrentUser();
    if(!currentUser) throw Error;
    const result = await databases.listDocuments(
      databaseId,
      ratingsCollectionId,
      [Query.equal("weapons", weaponId), Query.equal("users", currentUser.$id)]
    )
    return result.documents.length > 0;
  }
  catch(error){
    console.error(error);
    throw new Error(error);
  }
}

export async function editComment(commentId, newComment) {   
  try {     
    const currentUser = await getCurrentUser();     
    if (!currentUser) throw new Error("User not authenticated");  

    // Get the comment by its unique ID
    const record = await databases.getDocument(
      databaseId,
      commentsCollectionId,
      commentId
    ); 

    // Check if users is an object with $id or just a plain ID
    const recordUserId = typeof record.users === 'object' && record.users.$id 
      ? record.users.$id 
      : record.users;

    if (recordUserId !== currentUser.$id) {
      throw new Error("You are not authorized to edit this comment");
    }

    // Update the comment
    await databases.updateDocument(
      databaseId,
      commentsCollectionId,
      commentId,
      { 
        comment: newComment 
      }
    );
  } catch (error) {     
    console.error(error);     
    throw error;   
  } 
}

export async function editStarRating(ratingId, newRating) {   
  try {     
    const currentUser = await getCurrentUser();     
    if (!currentUser) throw new Error("User not authenticated");  

    // Get the rating by its unique ID
    const record = await databases.getDocument(
      databaseId,
      ratingsCollectionId,
      ratingId
    ); 

    // Check if users is an object with $id or just a plain ID
    const recordUserId = typeof record.users === 'object' && record.users.$id 
      ? record.users.$id 
      : record.users;

    if (recordUserId !== currentUser.$id) {
      throw new Error("You are not authorized to edit this rating");
    }

    // Update the rating
    await databases.updateDocument(
      databaseId,
      ratingsCollectionId,
      ratingId,
      { 
        rating: newRating 
      }
    );
  } catch (error) {     
    console.error(error);     
    throw error;   
  } 
}

export async function deleteReview(weaponId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    // Get all comments for this user and weapon, sorted by creation date
    const commentRecords = await databases.listDocuments(
      databaseId,
      commentsCollectionId,
      [
        Query.equal("users", currentUser.$id),
        Query.equal("weapons", weaponId),
        Query.orderDesc("$createdAt")  // Get most recent first
      ]
    );

    // Get all ratings for this user and weapon, sorted by creation date
    const ratingRecords = await databases.listDocuments(
      databaseId,
      ratingsCollectionId,
      [
        Query.equal("users", currentUser.$id),
        Query.equal("weapons", weaponId),
        Query.orderDesc("$createdAt")  // Get most recent first
      ]
    );

    // Delete the most recent comment if it exists
    if (commentRecords.documents.length > 0) {
      await databases.deleteDocument(
        databaseId,
        commentsCollectionId,
        commentRecords.documents[0].$id
      );
    }

    // Delete the most recent rating if it exists
    if (ratingRecords.documents.length > 0) {
      await databases.deleteDocument(
        databaseId,
        ratingsCollectionId,
        ratingRecords.documents[0].$id
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to delete review");
  }
}


export async function searchWeapon(query) {
  try {
    const normalisedQuery = query.trim().toLowerCase();
    if (!normalisedQuery) throw new Error("Empty search query");

    const weapons = await databases.listDocuments(
      databaseId,
      weaponsCollectionId,
      [
        Query.or([
          Query.search("weapon_name", normalisedQuery),
          Query.contains("weapon_name", normalisedQuery),
          Query.search("weapon_type", normalisedQuery),
        ])
      ]
    );

    if (!weapons.documents.length) throw new Error("Something went wrong");

    return weapons.documents;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function saveSearchQuery(query) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;
    const searchHistory = await databases.listDocuments(
      databaseId,
      searchHistoryCollectionId,
      [Query.equal("users", currentUser.$id), Query.equal("query", query.trim().toLowerCase())]
    );
    if (searchHistory.documents.length === 0) {
      await databases.createDocument(
        databaseId,
        searchHistoryCollectionId,
        ID.unique(),
        {
          users: currentUser.$id,
          query: query,
          searchCount: 1
        }
      ); 
    } else if (searchHistory.documents.length > 0) { 
      await databases.updateDocument(
        databaseId,
        searchHistoryCollectionId,
        searchHistory.documents[0].$id,
        {
          query: query,
          searchCount: searchHistory.documents[0].searchCount + 1
        }
      );
    }
    return searchHistory;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}



export async function getSearchHistory() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;
    const response = await databases.listDocuments(
      databaseId,
      searchHistoryCollectionId,
      [
        Query.equal("users", currentUser.$id),
        Query.orderDesc("$updatedAt"),
        Query.limit(5)
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching recent searches:", error);
    return [];
  }
}

export async function deleteSearchQuery(queryId) {
  try {
    await databases.deleteDocument(databaseId, searchHistoryCollectionId, queryId);
    return true;
  } catch (error) {
    console.error("Error deleting search query:", error);
    return false;
  }
}

export async function saveViewHistory(weaponId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not logged in");

    const viewHistory = await databases.listDocuments(
      databaseId,
      viewHistoryCollectionId,
      [Query.equal("users", currentUser.$id), Query.equal("weapons", weaponId)]
    );

    if (viewHistory.documents.length === 0) {
      await databases.createDocument(
        databaseId,
        viewHistoryCollectionId,
        ID.unique(),
        {
          users: currentUser.$id,
          weapons: weaponId,
          viewCount: 1
        }
      );
    } else {
      await databases.updateDocument(
        databaseId,
        viewHistoryCollectionId,
        viewHistory.documents[0].$id,
        {
          weapons: weaponId,
          viewCount: viewHistory.documents[0].viewCount + 1
        }
      );
    }

  } catch (error) {
    console.error("Error saving view history:", error);
    throw new Error(error.message);
  }
}

export async function getViewHistory() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;
    const response = await databases.listDocuments(
      databaseId,
      viewHistoryCollectionId,
      [
        Query.equal("users", currentUser.$id),
        Query.orderDesc("$updatedAt"),
        Query.limit(11)
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching recent views:", error);
    return [];
  }
}