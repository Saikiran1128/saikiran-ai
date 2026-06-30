import Types "../types/chat";

module {
  public type Chat = Types.Chat;
  public type Folder = Types.Folder;
  public type Message = Types.Message;

  /// Create a new chat record.
  public func newChat(id : Nat, title : Text, now : Int) : Chat {
    {
      id;
      title;
      folder = null;
      pinned = false;
      createdAt = now;
      updatedAt = now;
      messages = [];
    };
  };

  /// Append a message to a chat and bump its updatedAt timestamp.
  public func addMessage(chat : Chat, message : Message) : Chat {
    {
      chat with
      updatedAt = message.timestamp;
      messages = chat.messages.concat([message]);
    };
  };

  /// Rename a chat.
  public func rename(chat : Chat, title : Text) : Chat {
    { chat with title };
  };

  /// Move a chat into a folder (pass null to remove from any folder).
  public func moveToFolder(chat : Chat, folderId : ?Nat) : Chat {
    { chat with folder = folderId };
  };

  /// Toggle the pinned flag on a chat.
  public func setPinned(chat : Chat, pinned : Bool) : Chat {
    { chat with pinned };
  };

  /// Create a new folder record.
  public func newFolder(id : Nat, name : Text, now : Int) : Folder {
    { id; name; createdAt = now };
  };

  /// Rename a folder.
  public func renameFolder(folder : Folder, name : Text) : Folder {
    { folder with name };
  };
};
