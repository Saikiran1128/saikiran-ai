module {
  /// Message role: user, assistant, or system.
  public type Role = { #user; #assistant; #systemMsg };

  /// AI model identifier (simulated — no real provider calls in this version).
  public type Model = {
    #gpt;
    #gemini;
    #claude;
    #deepseek;
    #llama;
    #qwen;
    #mistral;
    #ollama;
  };

  /// AI mode the chat is running under.
  public type Mode = {
    #normal;
    #knowledgeBase;
    #internetSearch;
    #youtubeSearch;
    #codingAssistant;
    #emailAssistant;
    #documentAssistant;
    #imageAnalysis;
    #research;
  };

  /// A single message in a chat conversation.
  public type Message = {
    role : Role;
    content : Text;
    model : ?Model;
    mode : ?Mode;
    timestamp : Int;
  };

  /// A chat conversation owned by a single user principal.
  public type Chat = {
    id : Nat;
    title : Text;
    folder : ?Nat;
    pinned : Bool;
    createdAt : Int;
    updatedAt : Int;
    messages : [Message];
  };

  /// A folder grouping chats for a user.
  public type Folder = {
    id : Nat;
    name : Text;
    createdAt : Int;
  };
};
