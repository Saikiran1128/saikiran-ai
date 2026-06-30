import Map "mo:core/Map";
import Principal "mo:core/Principal";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import Types "types/chat";
import ChatApi "mixins/chat-api";

actor {
  /// Per-user chat conversations, keyed by owner principal.
  let chats : Map.Map<Principal, [Types.Chat]>;

  /// Per-user chat folders, keyed by owner principal.
  let folders : Map.Map<Principal, [Types.Folder]>;

  /// Global next-chat-id counter (monotonic across all users).
  let nextChatId : { var next : Nat };

  /// Global next-folder-id counter (monotonic across all users).
  let nextFolderId : { var next : Nat };

  include MixinViews();
  include ChatApi(chats, folders, nextChatId, nextFolderId);
};
