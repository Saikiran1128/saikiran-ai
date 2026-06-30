import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/chat";
import ChatLib "../lib/chat";

mixin (
  chats : Map.Map<Principal, [Types.Chat]>,
  folders : Map.Map<Principal, [Types.Folder]>,
  nextChatId : { var next : Nat },
  nextFolderId : { var next : Nat },
) {
  /// Reject anonymous callers — every chat/folder is owned by a real principal.
  func requireCaller(caller : Principal) : Principal {
    if (caller.isAnonymous()) {
      Runtime.trap("anonymous caller not allowed");
    };
    caller;
  };

  /// Return this caller's chat list (empty if they have none yet).
  func userChats(caller : Principal) : [Types.Chat] {
    switch (chats.get(caller)) {
      case (?list) list;
      case null [];
    };
  };

  /// Return this caller's folder list (empty if they have none yet).
  func userFolders(caller : Principal) : [Types.Folder] {
    switch (folders.get(caller)) {
      case (?list) list;
      case null [];
    };
  };

  /// Persist a caller's chat list back into the map.
  func putChats(caller : Principal, list : [Types.Chat]) {
    chats.add(caller, list);
  };

  /// Persist a caller's folder list back into the map.
  func putFolders(caller : Principal, list : [Types.Folder]) {
    folders.add(caller, list);
  };

  /// Create a new chat for the caller.
  public shared ({ caller }) func createChat(title : Text) : async Types.Chat {
    let owner = requireCaller(caller);
    let id = nextChatId.next;
    nextChatId.next := id + 1;
    let chat = ChatLib.newChat(id, title, Time.now());
    putChats(owner, userChats(owner).concat([chat]));
    chat;
  };

  /// List all chats belonging to the caller.
  public shared ({ caller }) func listChats() : async [Types.Chat] {
    let owner = requireCaller(caller);
    userChats(owner);
  };

  /// Get a single chat by id (must belong to the caller).
  public shared ({ caller }) func getChat(id : Nat) : async ?Types.Chat {
    let owner = requireCaller(caller);
    userChats(owner).find<Types.Chat>(
      func(c) { c.id == id },
    );
  };

  /// Update a chat: rename, move folder, and/or toggle pinned.
  public shared ({ caller }) func updateChat(id : Nat, title : ?Text, folder : ??Nat, pinned : ?Bool) : async ?Types.Chat {
    let owner = requireCaller(caller);
    let list = userChats(owner);
    let found = list.find(
      func(c) { c.id == id },
    );
    switch (found) {
      case null null;
      case (?chat) {
        var updated = chat;
        switch (title) {
          case (?t) { updated := ChatLib.rename(updated, t) };
          case null {};
        };
        switch (folder) {
          case (?f) { updated := ChatLib.moveToFolder(updated, f) };
          case null {};
        };
        switch (pinned) {
          case (?p) { updated := ChatLib.setPinned(updated, p) };
          case null {};
        };
        let newList = list.map(
          func(c) { if (c.id == id) { updated } else { c } },
        );
        putChats(owner, newList);
        ?updated;
      };
    };
  };

  /// Delete a chat by id (must belong to the caller).
  public shared ({ caller }) func deleteChat(id : Nat) : async Bool {
    let owner = requireCaller(caller);
    let list = userChats(owner);
    let exists = list.any(
      func(c) { c.id == id },
    );
    if (exists) {
      putChats(
        owner,
        list.filter<Types.Chat>(
          func(c) { c.id != id },
        ),
      );
      true;
    } else {
      false;
    };
  };

  /// Append a message to a chat. No real AI integration — the frontend
  /// simulates assistant responses; this endpoint just stores the message.
  public shared ({ caller }) func addMessage(chatId : Nat, message : Types.Message) : async ?Types.Chat {
    let owner = requireCaller(caller);
    let list = userChats(owner);
    let found = list.find(
      func(c) { c.id == chatId },
    );
    switch (found) {
      case null null;
      case (?chat) {
        let updated = ChatLib.addMessage(chat, message);
        let newList = list.map(
          func(c) { if (c.id == chatId) { updated } else { c } },
        );
        putChats(owner, newList);
        ?updated;
      };
    };
  };

  /// Create a new folder for the caller.
  public shared ({ caller }) func createFolder(name : Text) : async Types.Folder {
    let owner = requireCaller(caller);
    let id = nextFolderId.next;
    nextFolderId.next := id + 1;
    let folder = ChatLib.newFolder(id, name, Time.now());
    putFolders(owner, userFolders(owner).concat([folder]));
    folder;
  };

  /// List all folders belonging to the caller.
  public shared ({ caller }) func listFolders() : async [Types.Folder] {
    let owner = requireCaller(caller);
    userFolders(owner);
  };

  /// Rename a folder (must belong to the caller).
  public shared ({ caller }) func renameFolder(id : Nat, name : Text) : async ?Types.Folder {
    let owner = requireCaller(caller);
    let list = userFolders(owner);
    let found = list.find(
      func(f) { f.id == id },
    );
    switch (found) {
      case null null;
      case (?folder) {
        let updated = ChatLib.renameFolder(folder, name);
        let newList = list.map(
          func(f) { if (f.id == id) { updated } else { f } },
        );
        putFolders(owner, newList);
        ?updated;
      };
    };
  };

  /// Delete a folder (must belong to the caller). Chats in the folder are
  /// unassigned (folder set to null) but not deleted.
  public shared ({ caller }) func deleteFolder(id : Nat) : async Bool {
    let owner = requireCaller(caller);
    let folderList = userFolders(owner);
    let exists = folderList.any(
      func(f) { f.id == id },
    );
    if (exists) {
      putFolders(
        owner,
        folderList.filter<Types.Folder>(
          func(f) { f.id != id },
        ),
      );
      // Unassign any chats that were in this folder.
      let chatList = userChats(owner);
      let anyAssigned = chatList.any(
        func(c) { c.folder == ?id },
      );
      if (anyAssigned) {
        putChats(
          owner,
          chatList.map<Types.Chat, Types.Chat>(
            func(c) {
              if (c.folder == ?id) { ChatLib.moveToFolder(c, null) } else { c };
            },
          ),
        );
      };
      true;
    } else {
      false;
    };
  };
};
