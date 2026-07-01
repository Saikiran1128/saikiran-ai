import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  /// Second migration: rekey chat/folder storage from Principal to an
  /// anonymous session id (Text), and introduce stable Maps for the new
  /// domains (activity, documents, tool usage, search history) plus their
  /// id counters. Old per-Principal chat/folder data is discarded because
  /// there is no logged-in principal to map to a session id.
  type OldActor = {
    chats : Map.Map<Principal, [OldChat]>;
    folders : Map.Map<Principal, [OldFolder]>;
    nextChatId : { var next : Nat };
    nextFolderId : { var next : Nat };
  };

  type NewActor = {
    chats : Map.Map<Text, [NewChat]>;
    folders : Map.Map<Text, [NewFolder]>;
    activity : Map.Map<Text, [ActivityEntry]>;
    documents : Map.Map<Text, [DocumentRecord]>;
    toolUsage : Map.Map<Text, [ToolUsage]>;
    searchHistory : Map.Map<Text, [SearchRecord]>;
    nextChatId : { var next : Nat };
    nextFolderId : { var next : Nat };
    nextActivityId : { var next : Nat };
    nextDocumentId : { var next : Nat };
    nextToolUsageId : { var next : Nat };
    nextSearchId : { var next : Nat };
  };

  /// Inlined old chat/folder types (must match the previous migration's
  /// NewActor exactly — migrations are self-contained).
  type OldRole = { #user; #assistant; #systemMsg };
  type OldModel = {
    #gpt; #gemini; #claude; #deepseek; #llama; #qwen; #mistral; #ollama;
  };
  type OldMode = {
    #normal; #knowledgeBase; #internetSearch; #youtubeSearch;
    #codingAssistant; #emailAssistant; #documentAssistant;
    #imageAnalysis; #research;
  };
  type OldMessage = {
    role : OldRole;
    content : Text;
    model : ?OldModel;
    mode : ?OldMode;
    timestamp : Int;
  };
  type OldChat = {
    id : Nat;
    title : Text;
    folder : ?Nat;
    pinned : Bool;
    createdAt : Int;
    updatedAt : Int;
    messages : [OldMessage];
  };
  type OldFolder = {
    id : Nat;
    name : Text;
    createdAt : Int;
  };

  /// Inlined new types (chat/folder shapes are unchanged; new domain
  /// record types are introduced here).
  type NewRole = { #user; #assistant; #systemMsg };
  type NewModel = {
    #gpt; #gemini; #claude; #deepseek; #llama; #qwen; #mistral; #ollama;
  };
  type NewMode = {
    #normal; #knowledgeBase; #internetSearch; #youtubeSearch;
    #codingAssistant; #emailAssistant; #documentAssistant;
    #imageAnalysis; #research;
  };
  type NewMessage = {
    role : NewRole;
    content : Text;
    model : ?NewModel;
    mode : ?NewMode;
    timestamp : Int;
  };
  type NewChat = {
    id : Nat;
    title : Text;
    folder : ?Nat;
    pinned : Bool;
    createdAt : Int;
    updatedAt : Int;
    messages : [NewMessage];
  };
  type NewFolder = {
    id : Nat;
    name : Text;
    createdAt : Int;
  };
  type ActivityEntry = {
    id : Nat;
    timestamp : Int;
    activityType : Text;
    summary : Text;
    details : Text;
  };
  type DocumentRecord = {
    id : Nat;
    title : Text;
    content : Text;
    createdAt : Int;
    updatedAt : Int;
    fileType : Text;
  };
  type ToolUsage = {
    id : Nat;
    timestamp : Int;
    toolName : Text;
    inputSummary : Text;
    outputSummary : Text;
  };
  type SearchRecord = {
    id : Nat;
    timestamp : Int;
    queryText : Text;
    resultCount : Nat;
  };

  public func migration(old : OldActor) : NewActor {
    {
      // Old per-Principal chat/folder data is intentionally discarded:
      // there is no logged-in principal to map to an anonymous session id,
      // and the app now keys all storage by a frontend-generated session
      // key. Counters are preserved so existing ids remain unique.
      chats = Map.empty();
      folders = Map.empty();
      activity = Map.empty();
      documents = Map.empty();
      toolUsage = Map.empty();
      searchHistory = Map.empty();
      nextChatId = old.nextChatId;
      nextFolderId = old.nextFolderId;
      nextActivityId = { var next = 0 };
      nextDocumentId = { var next = 0 };
      nextToolUsageId = { var next = 0 };
      nextSearchId = { var next = 0 };
    };
  };
};
