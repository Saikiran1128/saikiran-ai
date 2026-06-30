import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  /// First migration: introduce stable state for the chat domain.
  /// OldActor is {} because this is the initial migration on fresh install.
  type OldActor = {};
  type NewActor = {
    chats : Map.Map<Principal, [Chat]>;
    folders : Map.Map<Principal, [Folder]>;
    nextChatId : { var next : Nat };
    nextFolderId : { var next : Nat };
  };

  /// Inlined chat types (migrations must be self-contained).
  type Role = { #user; #assistant; #systemMsg };
  type Model = {
    #gpt; #gemini; #claude; #deepseek; #llama; #qwen; #mistral; #ollama;
  };
  type Mode = {
    #normal; #knowledgeBase; #internetSearch; #youtubeSearch;
    #codingAssistant; #emailAssistant; #documentAssistant;
    #imageAnalysis; #research;
  };
  type Message = {
    role : Role;
    content : Text;
    model : ?Model;
    mode : ?Mode;
    timestamp : Int;
  };
  type Chat = {
    id : Nat;
    title : Text;
    folder : ?Nat;
    pinned : Bool;
    createdAt : Int;
    updatedAt : Int;
    messages : [Message];
  };
  type Folder = {
    id : Nat;
    name : Text;
    createdAt : Int;
  };

  public func migration(old : OldActor) : NewActor {
    {
      chats = Map.empty<Principal, [Chat]>();
      folders = Map.empty<Principal, [Folder]>();
      nextChatId = { var next = 0 };
      nextFolderId = { var next = 0 };
    };
  };
};
