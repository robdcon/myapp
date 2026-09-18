/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetBoardShares($boardId: ID!) {\n    boardShares(boardId: $boardId) {\n      id\n      board_id\n      shared_with_user_id\n      shared_with_user_email\n      shared_with_user_name\n      shared_by_user_id\n      permission_level\n      created_at\n      updated_at\n    }\n  }\n": typeof types.GetBoardSharesDocument,
    "\n  query GetSharedBoards {\n    sharedBoards {\n      id\n      name\n      board_type\n      description\n      created_at\n      myPermission\n      isShared\n    }\n  }\n": typeof types.GetSharedBoardsDocument,
    "\n  mutation ShareBoard($boardId: ID!, $email: String!, $permission: PermissionLevel!) {\n    shareBoard(boardId: $boardId, email: $email, permission: $permission) {\n      id\n      board_id\n      shared_with_user_id\n      shared_with_user_email\n      shared_with_user_name\n      permission_level\n      created_at\n    }\n  }\n": typeof types.ShareBoardDocument,
    "\n  mutation UpdateBoardShare($shareId: ID!, $permission: PermissionLevel!) {\n    updateBoardShare(shareId: $shareId, permission: $permission) {\n      id\n      permission_level\n      updated_at\n    }\n  }\n": typeof types.UpdateBoardShareDocument,
    "\n  mutation RemoveBoardShare($shareId: ID!) {\n    removeBoardShare(shareId: $shareId)\n  }\n": typeof types.RemoveBoardShareDocument,
    "\n  mutation GenerateShareLink($boardId: ID!) {\n    generateShareLink(boardId: $boardId)\n  }\n": typeof types.GenerateShareLinkDocument,
    "\n  mutation RevokeShareLink($boardId: ID!) {\n    revokeShareLink(boardId: $boardId)\n  }\n": typeof types.RevokeShareLinkDocument,
    "\n  query GetBoard($id: ID!) {\n    board(id: $id) {\n      id\n      name\n      board_type\n      description\n      items {\n        id\n        name\n        details\n        is_checked\n        category\n        google_event_id\n        event_start_time\n        event_end_time\n        event_description\n        google_calendar_link\n      }\n    }\n  }\n": typeof types.GetBoardDocument,
    "\n  query MyBoards {\n    myBoards {\n      id\n      name\n      created_at\n      board_type\n    }\n  }\n": typeof types.MyBoardsDocument,
    "\n  mutation CreateBoard($name: String!, $board_type: BoardType!, $description: String) {\n    createBoard(name: $name, board_type: $board_type, description: $description) {\n      id\n      name\n      board_type\n      description\n      created_at\n    }\n  }\n": typeof types.CreateBoardDocument,
    "\n  mutation UpdateBoard($id: ID!, $name: String, $description: String) {\n    updateBoard(id: $id, name: $name, description: $description) {\n      id\n      name\n      description\n      updated_at\n    }\n  }\n": typeof types.UpdateBoardDocument,
    "\n  mutation DeleteBoard($id: ID!) {\n    deleteBoard(id: $id)\n  }\n": typeof types.DeleteBoardDocument,
    "\n  query CalendarSyncStatus($boardId: ID!) {\n    calendarSyncStatus(boardId: $boardId) {\n      isConnected\n      calendarId\n      calendarName\n      lastSyncAt\n      syncRangeDays\n    }\n  }\n": typeof types.CalendarSyncStatusDocument,
    "\n  query AvailableCalendars($boardId: ID!) {\n    availableCalendars(boardId: $boardId) {\n      id\n      name\n      description\n      primary\n    }\n  }\n": typeof types.AvailableCalendarsDocument,
    "\n  mutation SelectBoardCalendar(\n    $boardId: ID!\n    $calendarId: String!\n    $calendarName: String!\n  ) {\n    selectBoardCalendar(\n      boardId: $boardId\n      calendarId: $calendarId\n      calendarName: $calendarName\n    )\n  }\n": typeof types.SelectBoardCalendarDocument,
    "\n  mutation SyncBoardCalendar($boardId: ID!) {\n    syncBoardCalendar(boardId: $boardId) {\n      success\n      message\n      itemsCreated\n      itemsUpdated\n      itemsDeleted\n    }\n  }\n": typeof types.SyncBoardCalendarDocument,
    "\n  mutation DisconnectBoardCalendar($boardId: ID!) {\n    disconnectBoardCalendar(boardId: $boardId)\n  }\n": typeof types.DisconnectBoardCalendarDocument,
    "\n  mutation UpdateCalendarSyncRange($boardId: ID!, $days: Int!) {\n    updateCalendarSyncRange(boardId: $boardId, days: $days)\n  }\n": typeof types.UpdateCalendarSyncRangeDocument,
    "\n  query GetItem($id: ID!) {\n    item(id: $id) {\n      id\n      name\n      details\n      is_checked\n      category\n      board_id\n      created_at\n      updated_at\n    }\n  }\n": typeof types.GetItemDocument,
    "\n  mutation CreateItem($boardId: ID!, $name: String!, $details: String, $category: String) {\n    createItem(boardId: $boardId, name: $name, details: $details, category: $category) {\n      id\n      name\n      details\n      is_checked\n      category\n    }\n  }\n": typeof types.CreateItemDocument,
    "\n  mutation UpdateItem($itemId: ID!, $name: String, $details: String, $category: String) {\n    updateItem(itemId: $itemId, name: $name, details: $details, category: $category) {\n      id\n      name\n      details\n      is_checked\n      category\n    }\n  }\n": typeof types.UpdateItemDocument,
    "\n  mutation ToggleItemCheck($itemId: ID!) {\n    toggleItemCheck(itemId: $itemId) {\n      id\n      is_checked\n    }\n  }\n": typeof types.ToggleItemCheckDocument,
    "\n  mutation DeleteItem($itemId: ID!) {\n    deleteItem(itemId: $itemId)\n  }\n": typeof types.DeleteItemDocument,
};
const documents: Documents = {
    "\n  query GetBoardShares($boardId: ID!) {\n    boardShares(boardId: $boardId) {\n      id\n      board_id\n      shared_with_user_id\n      shared_with_user_email\n      shared_with_user_name\n      shared_by_user_id\n      permission_level\n      created_at\n      updated_at\n    }\n  }\n": types.GetBoardSharesDocument,
    "\n  query GetSharedBoards {\n    sharedBoards {\n      id\n      name\n      board_type\n      description\n      created_at\n      myPermission\n      isShared\n    }\n  }\n": types.GetSharedBoardsDocument,
    "\n  mutation ShareBoard($boardId: ID!, $email: String!, $permission: PermissionLevel!) {\n    shareBoard(boardId: $boardId, email: $email, permission: $permission) {\n      id\n      board_id\n      shared_with_user_id\n      shared_with_user_email\n      shared_with_user_name\n      permission_level\n      created_at\n    }\n  }\n": types.ShareBoardDocument,
    "\n  mutation UpdateBoardShare($shareId: ID!, $permission: PermissionLevel!) {\n    updateBoardShare(shareId: $shareId, permission: $permission) {\n      id\n      permission_level\n      updated_at\n    }\n  }\n": types.UpdateBoardShareDocument,
    "\n  mutation RemoveBoardShare($shareId: ID!) {\n    removeBoardShare(shareId: $shareId)\n  }\n": types.RemoveBoardShareDocument,
    "\n  mutation GenerateShareLink($boardId: ID!) {\n    generateShareLink(boardId: $boardId)\n  }\n": types.GenerateShareLinkDocument,
    "\n  mutation RevokeShareLink($boardId: ID!) {\n    revokeShareLink(boardId: $boardId)\n  }\n": types.RevokeShareLinkDocument,
    "\n  query GetBoard($id: ID!) {\n    board(id: $id) {\n      id\n      name\n      board_type\n      description\n      items {\n        id\n        name\n        details\n        is_checked\n        category\n        google_event_id\n        event_start_time\n        event_end_time\n        event_description\n        google_calendar_link\n      }\n    }\n  }\n": types.GetBoardDocument,
    "\n  query MyBoards {\n    myBoards {\n      id\n      name\n      created_at\n      board_type\n    }\n  }\n": types.MyBoardsDocument,
    "\n  mutation CreateBoard($name: String!, $board_type: BoardType!, $description: String) {\n    createBoard(name: $name, board_type: $board_type, description: $description) {\n      id\n      name\n      board_type\n      description\n      created_at\n    }\n  }\n": types.CreateBoardDocument,
    "\n  mutation UpdateBoard($id: ID!, $name: String, $description: String) {\n    updateBoard(id: $id, name: $name, description: $description) {\n      id\n      name\n      description\n      updated_at\n    }\n  }\n": types.UpdateBoardDocument,
    "\n  mutation DeleteBoard($id: ID!) {\n    deleteBoard(id: $id)\n  }\n": types.DeleteBoardDocument,
    "\n  query CalendarSyncStatus($boardId: ID!) {\n    calendarSyncStatus(boardId: $boardId) {\n      isConnected\n      calendarId\n      calendarName\n      lastSyncAt\n      syncRangeDays\n    }\n  }\n": types.CalendarSyncStatusDocument,
    "\n  query AvailableCalendars($boardId: ID!) {\n    availableCalendars(boardId: $boardId) {\n      id\n      name\n      description\n      primary\n    }\n  }\n": types.AvailableCalendarsDocument,
    "\n  mutation SelectBoardCalendar(\n    $boardId: ID!\n    $calendarId: String!\n    $calendarName: String!\n  ) {\n    selectBoardCalendar(\n      boardId: $boardId\n      calendarId: $calendarId\n      calendarName: $calendarName\n    )\n  }\n": types.SelectBoardCalendarDocument,
    "\n  mutation SyncBoardCalendar($boardId: ID!) {\n    syncBoardCalendar(boardId: $boardId) {\n      success\n      message\n      itemsCreated\n      itemsUpdated\n      itemsDeleted\n    }\n  }\n": types.SyncBoardCalendarDocument,
    "\n  mutation DisconnectBoardCalendar($boardId: ID!) {\n    disconnectBoardCalendar(boardId: $boardId)\n  }\n": types.DisconnectBoardCalendarDocument,
    "\n  mutation UpdateCalendarSyncRange($boardId: ID!, $days: Int!) {\n    updateCalendarSyncRange(boardId: $boardId, days: $days)\n  }\n": types.UpdateCalendarSyncRangeDocument,
    "\n  query GetItem($id: ID!) {\n    item(id: $id) {\n      id\n      name\n      details\n      is_checked\n      category\n      board_id\n      created_at\n      updated_at\n    }\n  }\n": types.GetItemDocument,
    "\n  mutation CreateItem($boardId: ID!, $name: String!, $details: String, $category: String) {\n    createItem(boardId: $boardId, name: $name, details: $details, category: $category) {\n      id\n      name\n      details\n      is_checked\n      category\n    }\n  }\n": types.CreateItemDocument,
    "\n  mutation UpdateItem($itemId: ID!, $name: String, $details: String, $category: String) {\n    updateItem(itemId: $itemId, name: $name, details: $details, category: $category) {\n      id\n      name\n      details\n      is_checked\n      category\n    }\n  }\n": types.UpdateItemDocument,
    "\n  mutation ToggleItemCheck($itemId: ID!) {\n    toggleItemCheck(itemId: $itemId) {\n      id\n      is_checked\n    }\n  }\n": types.ToggleItemCheckDocument,
    "\n  mutation DeleteItem($itemId: ID!) {\n    deleteItem(itemId: $itemId)\n  }\n": types.DeleteItemDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetBoardShares($boardId: ID!) {\n    boardShares(boardId: $boardId) {\n      id\n      board_id\n      shared_with_user_id\n      shared_with_user_email\n      shared_with_user_name\n      shared_by_user_id\n      permission_level\n      created_at\n      updated_at\n    }\n  }\n"): (typeof documents)["\n  query GetBoardShares($boardId: ID!) {\n    boardShares(boardId: $boardId) {\n      id\n      board_id\n      shared_with_user_id\n      shared_with_user_email\n      shared_with_user_name\n      shared_by_user_id\n      permission_level\n      created_at\n      updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetSharedBoards {\n    sharedBoards {\n      id\n      name\n      board_type\n      description\n      created_at\n      myPermission\n      isShared\n    }\n  }\n"): (typeof documents)["\n  query GetSharedBoards {\n    sharedBoards {\n      id\n      name\n      board_type\n      description\n      created_at\n      myPermission\n      isShared\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ShareBoard($boardId: ID!, $email: String!, $permission: PermissionLevel!) {\n    shareBoard(boardId: $boardId, email: $email, permission: $permission) {\n      id\n      board_id\n      shared_with_user_id\n      shared_with_user_email\n      shared_with_user_name\n      permission_level\n      created_at\n    }\n  }\n"): (typeof documents)["\n  mutation ShareBoard($boardId: ID!, $email: String!, $permission: PermissionLevel!) {\n    shareBoard(boardId: $boardId, email: $email, permission: $permission) {\n      id\n      board_id\n      shared_with_user_id\n      shared_with_user_email\n      shared_with_user_name\n      permission_level\n      created_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateBoardShare($shareId: ID!, $permission: PermissionLevel!) {\n    updateBoardShare(shareId: $shareId, permission: $permission) {\n      id\n      permission_level\n      updated_at\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateBoardShare($shareId: ID!, $permission: PermissionLevel!) {\n    updateBoardShare(shareId: $shareId, permission: $permission) {\n      id\n      permission_level\n      updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RemoveBoardShare($shareId: ID!) {\n    removeBoardShare(shareId: $shareId)\n  }\n"): (typeof documents)["\n  mutation RemoveBoardShare($shareId: ID!) {\n    removeBoardShare(shareId: $shareId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation GenerateShareLink($boardId: ID!) {\n    generateShareLink(boardId: $boardId)\n  }\n"): (typeof documents)["\n  mutation GenerateShareLink($boardId: ID!) {\n    generateShareLink(boardId: $boardId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RevokeShareLink($boardId: ID!) {\n    revokeShareLink(boardId: $boardId)\n  }\n"): (typeof documents)["\n  mutation RevokeShareLink($boardId: ID!) {\n    revokeShareLink(boardId: $boardId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetBoard($id: ID!) {\n    board(id: $id) {\n      id\n      name\n      board_type\n      description\n      items {\n        id\n        name\n        details\n        is_checked\n        category\n        google_event_id\n        event_start_time\n        event_end_time\n        event_description\n        google_calendar_link\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetBoard($id: ID!) {\n    board(id: $id) {\n      id\n      name\n      board_type\n      description\n      items {\n        id\n        name\n        details\n        is_checked\n        category\n        google_event_id\n        event_start_time\n        event_end_time\n        event_description\n        google_calendar_link\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyBoards {\n    myBoards {\n      id\n      name\n      created_at\n      board_type\n    }\n  }\n"): (typeof documents)["\n  query MyBoards {\n    myBoards {\n      id\n      name\n      created_at\n      board_type\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateBoard($name: String!, $board_type: BoardType!, $description: String) {\n    createBoard(name: $name, board_type: $board_type, description: $description) {\n      id\n      name\n      board_type\n      description\n      created_at\n    }\n  }\n"): (typeof documents)["\n  mutation CreateBoard($name: String!, $board_type: BoardType!, $description: String) {\n    createBoard(name: $name, board_type: $board_type, description: $description) {\n      id\n      name\n      board_type\n      description\n      created_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateBoard($id: ID!, $name: String, $description: String) {\n    updateBoard(id: $id, name: $name, description: $description) {\n      id\n      name\n      description\n      updated_at\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateBoard($id: ID!, $name: String, $description: String) {\n    updateBoard(id: $id, name: $name, description: $description) {\n      id\n      name\n      description\n      updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteBoard($id: ID!) {\n    deleteBoard(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteBoard($id: ID!) {\n    deleteBoard(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CalendarSyncStatus($boardId: ID!) {\n    calendarSyncStatus(boardId: $boardId) {\n      isConnected\n      calendarId\n      calendarName\n      lastSyncAt\n      syncRangeDays\n    }\n  }\n"): (typeof documents)["\n  query CalendarSyncStatus($boardId: ID!) {\n    calendarSyncStatus(boardId: $boardId) {\n      isConnected\n      calendarId\n      calendarName\n      lastSyncAt\n      syncRangeDays\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query AvailableCalendars($boardId: ID!) {\n    availableCalendars(boardId: $boardId) {\n      id\n      name\n      description\n      primary\n    }\n  }\n"): (typeof documents)["\n  query AvailableCalendars($boardId: ID!) {\n    availableCalendars(boardId: $boardId) {\n      id\n      name\n      description\n      primary\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SelectBoardCalendar(\n    $boardId: ID!\n    $calendarId: String!\n    $calendarName: String!\n  ) {\n    selectBoardCalendar(\n      boardId: $boardId\n      calendarId: $calendarId\n      calendarName: $calendarName\n    )\n  }\n"): (typeof documents)["\n  mutation SelectBoardCalendar(\n    $boardId: ID!\n    $calendarId: String!\n    $calendarName: String!\n  ) {\n    selectBoardCalendar(\n      boardId: $boardId\n      calendarId: $calendarId\n      calendarName: $calendarName\n    )\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SyncBoardCalendar($boardId: ID!) {\n    syncBoardCalendar(boardId: $boardId) {\n      success\n      message\n      itemsCreated\n      itemsUpdated\n      itemsDeleted\n    }\n  }\n"): (typeof documents)["\n  mutation SyncBoardCalendar($boardId: ID!) {\n    syncBoardCalendar(boardId: $boardId) {\n      success\n      message\n      itemsCreated\n      itemsUpdated\n      itemsDeleted\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DisconnectBoardCalendar($boardId: ID!) {\n    disconnectBoardCalendar(boardId: $boardId)\n  }\n"): (typeof documents)["\n  mutation DisconnectBoardCalendar($boardId: ID!) {\n    disconnectBoardCalendar(boardId: $boardId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateCalendarSyncRange($boardId: ID!, $days: Int!) {\n    updateCalendarSyncRange(boardId: $boardId, days: $days)\n  }\n"): (typeof documents)["\n  mutation UpdateCalendarSyncRange($boardId: ID!, $days: Int!) {\n    updateCalendarSyncRange(boardId: $boardId, days: $days)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetItem($id: ID!) {\n    item(id: $id) {\n      id\n      name\n      details\n      is_checked\n      category\n      board_id\n      created_at\n      updated_at\n    }\n  }\n"): (typeof documents)["\n  query GetItem($id: ID!) {\n    item(id: $id) {\n      id\n      name\n      details\n      is_checked\n      category\n      board_id\n      created_at\n      updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateItem($boardId: ID!, $name: String!, $details: String, $category: String) {\n    createItem(boardId: $boardId, name: $name, details: $details, category: $category) {\n      id\n      name\n      details\n      is_checked\n      category\n    }\n  }\n"): (typeof documents)["\n  mutation CreateItem($boardId: ID!, $name: String!, $details: String, $category: String) {\n    createItem(boardId: $boardId, name: $name, details: $details, category: $category) {\n      id\n      name\n      details\n      is_checked\n      category\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateItem($itemId: ID!, $name: String, $details: String, $category: String) {\n    updateItem(itemId: $itemId, name: $name, details: $details, category: $category) {\n      id\n      name\n      details\n      is_checked\n      category\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateItem($itemId: ID!, $name: String, $details: String, $category: String) {\n    updateItem(itemId: $itemId, name: $name, details: $details, category: $category) {\n      id\n      name\n      details\n      is_checked\n      category\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ToggleItemCheck($itemId: ID!) {\n    toggleItemCheck(itemId: $itemId) {\n      id\n      is_checked\n    }\n  }\n"): (typeof documents)["\n  mutation ToggleItemCheck($itemId: ID!) {\n    toggleItemCheck(itemId: $itemId) {\n      id\n      is_checked\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteItem($itemId: ID!) {\n    deleteItem(itemId: $itemId)\n  }\n"): (typeof documents)["\n  mutation DeleteItem($itemId: ID!) {\n    deleteItem(itemId: $itemId)\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;