import Map "mo:core/Map";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import Common "types/common";
import ChatTypes "types/chat";
import ActivityTypes "types/activity";
import DocumentTypes "types/document";
import ToolTypes "types/tools";
import SearchTypes "types/search";
import ChatApi "mixins/chat-api";
import ActivityApi "mixins/activity-api";
import DocumentApi "mixins/document-api";
import ToolsApi "mixins/tools-api";
import SearchApi "mixins/search-api";

actor {
  /// Per-session chat conversations, keyed by anonymous session id.
  let chats : Map.Map<Common.SessionId, [ChatTypes.Chat]>;

  /// Per-session chat folders, keyed by anonymous session id.
  let folders : Map.Map<Common.SessionId, [ChatTypes.Folder]>;

  /// Per-session activity log, keyed by anonymous session id.
  let activity : Map.Map<Common.SessionId, [ActivityTypes.ActivityEntry]>;

  /// Per-session documents, keyed by anonymous session id.
  let documents : Map.Map<Common.SessionId, [DocumentTypes.DocumentRecord]>;

  /// Per-session tool-usage records, keyed by anonymous session id.
  let toolUsage : Map.Map<Common.SessionId, [ToolTypes.ToolUsage]>;

  /// Per-session search history, keyed by anonymous session id.
  let searchHistory : Map.Map<Common.SessionId, [SearchTypes.SearchRecord]>;

  /// Global next-chat-id counter (monotonic across all sessions).
  let nextChatId : { var next : Nat };

  /// Global next-folder-id counter (monotonic across all sessions).
  let nextFolderId : { var next : Nat };

  /// Global next-activity-id counter (monotonic across all sessions).
  let nextActivityId : { var next : Nat };

  /// Global next-document-id counter (monotonic across all sessions).
  let nextDocumentId : { var next : Nat };

  /// Global next-tool-usage-id counter (monotonic across all sessions).
  let nextToolUsageId : { var next : Nat };

  /// Global next-search-id counter (monotonic across all sessions).
  let nextSearchId : { var next : Nat };

  include MixinViews();
  include ChatApi(chats, folders, nextChatId, nextFolderId);
  include ActivityApi(activity, nextActivityId);
  include DocumentApi(documents, nextDocumentId);
  include ToolsApi(toolUsage, nextToolUsageId);
  include SearchApi(searchHistory, nextSearchId);
};
