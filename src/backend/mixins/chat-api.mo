import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/chat";
import Common "../types/common";
import ChatLib "../lib/chat";

mixin (
  chats : Map.Map<Common.SessionId, [Types.Chat]>,
  folders : Map.Map<Common.SessionId, [Types.Folder]>,
  nextChatId : { var next : Nat },
  nextFolderId : { var next : Nat },
) {
  /// Create a new chat for the given anonymous session.
  public shared ({ caller }) func createChat(sessionId : Common.SessionId, title : Text) : async Types.Chat {
    ignore caller;
    let id = nextChatId.next;
    nextChatId.next := id + 1;
    let chat = ChatLib.newChat(id, title, Time.now());
    let existing = switch (chats.get(sessionId)) { case (?c) c; case null [] };
    chats.add(sessionId, existing.concat([chat]));
    chat;
  };

  /// List all chats belonging to the given session.
  public shared ({ caller }) func listChats(sessionId : Common.SessionId) : async [Types.Chat] {
    ignore caller;
    switch (chats.get(sessionId)) { case (?c) c; case null [] };
  };

  /// Get a single chat by id (must belong to the given session).
  public shared ({ caller }) func getChat(sessionId : Common.SessionId, id : Nat) : async ?Types.Chat {
    ignore caller;
    let list = switch (chats.get(sessionId)) { case (?c) c; case null [] };
    list.find(func(c) { c.id == id });
  };

  /// Update a chat: rename, move folder, and/or toggle pinned.
  public shared ({ caller }) func updateChat(sessionId : Common.SessionId, id : Nat, title : ?Text, folder : ??Nat, pinned : ?Bool) : async ?Types.Chat {
    ignore caller;
    let list = switch (chats.get(sessionId)) { case (?c) c; case null [] };
    let found = list.find(func(c) { c.id == id });
    switch (found) {
      case null null;
      case (?chat) {
        let renamed = switch (title) {
          case null chat;
          case (?t) ChatLib.rename(chat, t);
        };
        let moved = switch (folder) {
          case null renamed;
          case (?f) ChatLib.moveToFolder(renamed, f);
        };
        let final = switch (pinned) {
          case null moved;
          case (?p) ChatLib.setPinned(moved, p);
        };
        let updated = { final with updatedAt = Time.now() };
        let newList = list.map(
          func(c) { if (c.id == id) updated else c }
        );
        chats.add(sessionId, newList);
        ?updated;
      };
    };
  };

  /// Delete a chat by id (must belong to the given session).
  public shared ({ caller }) func deleteChat(sessionId : Common.SessionId, id : Nat) : async Bool {
    ignore caller;
    let list = switch (chats.get(sessionId)) { case (?c) c; case null [] };
    let existed = list.find(func(c) { c.id == id }) != null;
    if (existed) {
      let newList = list.filter(func(c) { c.id != id });
      chats.add(sessionId, newList);
    };
    existed;
  };

  /// Append a message to a chat. No real AI integration — the frontend
  /// simulates assistant responses; this endpoint just stores the message.
  public shared ({ caller }) func addMessage(sessionId : Common.SessionId, chatId : Nat, message : Types.Message) : async ?Types.Chat {
    ignore caller;
    let list = switch (chats.get(sessionId)) { case (?c) c; case null [] };
    let found = list.find(func(c) { c.id == chatId });
    switch (found) {
      case null null;
      case (?chat) {
        let updated = ChatLib.addMessage(chat, message);
        let newList = list.map(
          func(c) { if (c.id == chatId) updated else c }
        );
        chats.add(sessionId, newList);
        ?updated;
      };
    };
  };

  /// Create a new folder for the given session.
  public shared ({ caller }) func createFolder(sessionId : Common.SessionId, name : Text) : async Types.Folder {
    ignore caller;
    let id = nextFolderId.next;
    nextFolderId.next := id + 1;
    let folder = ChatLib.newFolder(id, name, Time.now());
    let existing = switch (folders.get(sessionId)) { case (?f) f; case null [] };
    folders.add(sessionId, existing.concat([folder]));
    folder;
  };

  /// List all folders belonging to the given session.
  public shared ({ caller }) func listFolders(sessionId : Common.SessionId) : async [Types.Folder] {
    ignore caller;
    switch (folders.get(sessionId)) { case (?f) f; case null [] };
  };

  /// Rename a folder (must belong to the given session).
  public shared ({ caller }) func renameFolder(sessionId : Common.SessionId, id : Nat, name : Text) : async ?Types.Folder {
    ignore caller;
    let list = switch (folders.get(sessionId)) { case (?f) f; case null [] };
    let found = list.find(func(f) { f.id == id });
    switch (found) {
      case null null;
      case (?folder) {
        let updated = ChatLib.renameFolder(folder, name);
        let newList = list.map(
          func(f) { if (f.id == id) updated else f }
        );
        folders.add(sessionId, newList);
        ?updated;
      };
    };
  };

  /// Delete a folder (must belong to the given session). Chats in the
  /// folder are unassigned (folder set to null) but not deleted.
  public shared ({ caller }) func deleteFolder(sessionId : Common.SessionId, id : Nat) : async Bool {
    ignore caller;
    let folderList = switch (folders.get(sessionId)) { case (?f) f; case null [] };
    let existed = folderList.find(func(f) { f.id == id }) != null;
    if (existed) {
      let newFolders = folderList.filter(func(f) { f.id != id });
      folders.add(sessionId, newFolders);
      // Unassign any chats that were in this folder.
      let chatList = switch (chats.get(sessionId)) { case (?c) c; case null [] };
      let newChats = chatList.map(
        func(c) { if (c.folder == ?id) ChatLib.moveToFolder(c, null) else c }
      );
      chats.add(sessionId, newChats);
    };
    existed;
  };
};
