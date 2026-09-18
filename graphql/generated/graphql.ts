/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Board = {
  __typename: 'Board';
  board_type: BoardType;
  calendarStatus: Maybe<CalendarStatus>;
  created_at: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  isShared: Scalars['Boolean']['output'];
  items: Array<Item>;
  myPermission: Maybe<PermissionLevel>;
  name: Scalars['String']['output'];
  role: Maybe<Scalars['String']['output']>;
  shareToken: Maybe<Scalars['String']['output']>;
  shares: Array<BoardShare>;
  updated_at: Scalars['String']['output'];
};

export type BoardShare = {
  __typename: 'BoardShare';
  board: Board;
  board_id: Scalars['ID']['output'];
  created_at: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  permission_level: PermissionLevel;
  shared_by_user_id: Scalars['String']['output'];
  shared_with_user_email: Maybe<Scalars['String']['output']>;
  shared_with_user_id: Scalars['String']['output'];
  shared_with_user_name: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['String']['output'];
};

export enum BoardType {
  Checklist = 'CHECKLIST',
  Events = 'EVENTS',
  NoticeBoard = 'NOTICE_BOARD'
}

export type CalendarStatus = {
  __typename: 'CalendarStatus';
  calendarId: Maybe<Scalars['String']['output']>;
  calendarName: Maybe<Scalars['String']['output']>;
  isConnected: Scalars['Boolean']['output'];
  lastSyncAt: Maybe<Scalars['String']['output']>;
  syncRangeDays: Scalars['Int']['output'];
};

export type CalendarSyncResult = {
  __typename: 'CalendarSyncResult';
  itemsCreated: Scalars['Int']['output'];
  itemsDeleted: Scalars['Int']['output'];
  itemsUpdated: Scalars['Int']['output'];
  message: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type GoogleCalendar = {
  __typename: 'GoogleCalendar';
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  primary: Scalars['Boolean']['output'];
};

export type Item = {
  __typename: 'Item';
  board_id: Scalars['ID']['output'];
  category: Maybe<Scalars['String']['output']>;
  created_at: Scalars['String']['output'];
  details: Maybe<Scalars['String']['output']>;
  event_description: Maybe<Scalars['String']['output']>;
  event_end_time: Maybe<Scalars['String']['output']>;
  event_start_time: Maybe<Scalars['String']['output']>;
  google_calendar_link: Maybe<Scalars['String']['output']>;
  google_event_id: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  is_checked: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};

export type Mutation = {
  __typename: 'Mutation';
  createBoard: Board;
  createItem: Item;
  createUser: User;
  deleteBoard: Scalars['Boolean']['output'];
  deleteItem: Scalars['Boolean']['output'];
  disconnectBoardCalendar: Scalars['Boolean']['output'];
  generateShareLink: Scalars['String']['output'];
  removeBoardShare: Scalars['Boolean']['output'];
  revokeShareLink: Scalars['Boolean']['output'];
  selectBoardCalendar: Scalars['Boolean']['output'];
  shareBoard: BoardShare;
  syncBoardCalendar: CalendarSyncResult;
  toggleItemCheck: Item;
  updateBoard: Board;
  updateBoardShare: BoardShare;
  updateCalendarSyncRange: Scalars['Boolean']['output'];
  updateItem: Item;
};


export type MutationCreateBoardArgs = {
  board_type: BoardType;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateItemArgs = {
  boardId: Scalars['ID']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationDeleteBoardArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteItemArgs = {
  itemId: Scalars['ID']['input'];
};


export type MutationDisconnectBoardCalendarArgs = {
  boardId: Scalars['ID']['input'];
};


export type MutationGenerateShareLinkArgs = {
  boardId: Scalars['ID']['input'];
};


export type MutationRemoveBoardShareArgs = {
  shareId: Scalars['ID']['input'];
};


export type MutationRevokeShareLinkArgs = {
  boardId: Scalars['ID']['input'];
};


export type MutationSelectBoardCalendarArgs = {
  boardId: Scalars['ID']['input'];
  calendarId: Scalars['String']['input'];
  calendarName: Scalars['String']['input'];
};


export type MutationShareBoardArgs = {
  boardId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
  permission: PermissionLevel;
};


export type MutationSyncBoardCalendarArgs = {
  boardId: Scalars['ID']['input'];
};


export type MutationToggleItemCheckArgs = {
  itemId: Scalars['ID']['input'];
};


export type MutationUpdateBoardArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateBoardShareArgs = {
  permission: PermissionLevel;
  shareId: Scalars['ID']['input'];
};


export type MutationUpdateCalendarSyncRangeArgs = {
  boardId: Scalars['ID']['input'];
  days: Scalars['Int']['input'];
};


export type MutationUpdateItemArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  itemId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export enum PermissionLevel {
  Admin = 'ADMIN',
  Edit = 'EDIT',
  View = 'VIEW'
}

export type Query = {
  __typename: 'Query';
  availableCalendars: Array<GoogleCalendar>;
  board: Maybe<Board>;
  boardShares: Array<BoardShare>;
  calendarSyncStatus: Maybe<CalendarStatus>;
  item: Maybe<Item>;
  items: Array<Item>;
  myBoards: Array<Board>;
  sharedBoards: Array<Board>;
  uncheckedItems: Array<Item>;
  user: Maybe<User>;
  users: Array<User>;
};


export type QueryAvailableCalendarsArgs = {
  boardId: Scalars['ID']['input'];
};


export type QueryBoardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBoardSharesArgs = {
  boardId: Scalars['ID']['input'];
};


export type QueryCalendarSyncStatusArgs = {
  boardId: Scalars['ID']['input'];
};


export type QueryItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryItemsArgs = {
  boardId: Scalars['ID']['input'];
};


export type QueryUncheckedItemsArgs = {
  boardId: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  email: Scalars['String']['input'];
};

export type User = {
  __typename: 'User';
  boards: Array<Board>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
};

export type GetBoardSharesQueryVariables = Exact<{
  boardId: Scalars['ID']['input'];
}>;


export type GetBoardSharesQuery = { boardShares: Array<{ __typename: 'BoardShare', id: string, board_id: string, shared_with_user_id: string, shared_with_user_email: string | null, shared_with_user_name: string | null, shared_by_user_id: string, permission_level: PermissionLevel, created_at: string, updated_at: string }> };

export type GetSharedBoardsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSharedBoardsQuery = { sharedBoards: Array<{ __typename: 'Board', id: string, name: string, board_type: BoardType, description: string | null, created_at: string, myPermission: PermissionLevel | null, isShared: boolean }> };

export type ShareBoardMutationVariables = Exact<{
  boardId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
  permission: PermissionLevel;
}>;


export type ShareBoardMutation = { shareBoard: { __typename: 'BoardShare', id: string, board_id: string, shared_with_user_id: string, shared_with_user_email: string | null, shared_with_user_name: string | null, permission_level: PermissionLevel, created_at: string } };

export type UpdateBoardShareMutationVariables = Exact<{
  shareId: Scalars['ID']['input'];
  permission: PermissionLevel;
}>;


export type UpdateBoardShareMutation = { updateBoardShare: { __typename: 'BoardShare', id: string, permission_level: PermissionLevel, updated_at: string } };

export type RemoveBoardShareMutationVariables = Exact<{
  shareId: Scalars['ID']['input'];
}>;


export type RemoveBoardShareMutation = { removeBoardShare: boolean };

export type GenerateShareLinkMutationVariables = Exact<{
  boardId: Scalars['ID']['input'];
}>;


export type GenerateShareLinkMutation = { generateShareLink: string };

export type RevokeShareLinkMutationVariables = Exact<{
  boardId: Scalars['ID']['input'];
}>;


export type RevokeShareLinkMutation = { revokeShareLink: boolean };

export type GetBoardQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetBoardQuery = { board: { __typename: 'Board', id: string, name: string, board_type: BoardType, description: string | null, items: Array<{ __typename: 'Item', id: string, name: string, details: string | null, is_checked: boolean, category: string | null, google_event_id: string | null, event_start_time: string | null, event_end_time: string | null, event_description: string | null, google_calendar_link: string | null }> } | null };

export type MyBoardsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyBoardsQuery = { myBoards: Array<{ __typename: 'Board', id: string, name: string, created_at: string, board_type: BoardType }> };

export type CreateBoardMutationVariables = Exact<{
  name: Scalars['String']['input'];
  board_type: BoardType;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateBoardMutation = { createBoard: { __typename: 'Board', id: string, name: string, board_type: BoardType, description: string | null, created_at: string } };

export type UpdateBoardMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateBoardMutation = { updateBoard: { __typename: 'Board', id: string, name: string, description: string | null, updated_at: string } };

export type DeleteBoardMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteBoardMutation = { deleteBoard: boolean };

export type CalendarSyncStatusQueryVariables = Exact<{
  boardId: Scalars['ID']['input'];
}>;


export type CalendarSyncStatusQuery = { calendarSyncStatus: { __typename: 'CalendarStatus', isConnected: boolean, calendarId: string | null, calendarName: string | null, lastSyncAt: string | null, syncRangeDays: number } | null };

export type AvailableCalendarsQueryVariables = Exact<{
  boardId: Scalars['ID']['input'];
}>;


export type AvailableCalendarsQuery = { availableCalendars: Array<{ __typename: 'GoogleCalendar', id: string, name: string, description: string | null, primary: boolean }> };

export type SelectBoardCalendarMutationVariables = Exact<{
  boardId: Scalars['ID']['input'];
  calendarId: Scalars['String']['input'];
  calendarName: Scalars['String']['input'];
}>;


export type SelectBoardCalendarMutation = { selectBoardCalendar: boolean };

export type SyncBoardCalendarMutationVariables = Exact<{
  boardId: Scalars['ID']['input'];
}>;


export type SyncBoardCalendarMutation = { syncBoardCalendar: { __typename: 'CalendarSyncResult', success: boolean, message: string | null, itemsCreated: number, itemsUpdated: number, itemsDeleted: number } };

export type DisconnectBoardCalendarMutationVariables = Exact<{
  boardId: Scalars['ID']['input'];
}>;


export type DisconnectBoardCalendarMutation = { disconnectBoardCalendar: boolean };

export type UpdateCalendarSyncRangeMutationVariables = Exact<{
  boardId: Scalars['ID']['input'];
  days: Scalars['Int']['input'];
}>;


export type UpdateCalendarSyncRangeMutation = { updateCalendarSyncRange: boolean };

export type GetItemQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetItemQuery = { item: { __typename: 'Item', id: string, name: string, details: string | null, is_checked: boolean, category: string | null, board_id: string, created_at: string, updated_at: string } | null };

export type CreateItemMutationVariables = Exact<{
  boardId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  details?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateItemMutation = { createItem: { __typename: 'Item', id: string, name: string, details: string | null, is_checked: boolean, category: string | null } };

export type UpdateItemMutationVariables = Exact<{
  itemId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateItemMutation = { updateItem: { __typename: 'Item', id: string, name: string, details: string | null, is_checked: boolean, category: string | null } };

export type ToggleItemCheckMutationVariables = Exact<{
  itemId: Scalars['ID']['input'];
}>;


export type ToggleItemCheckMutation = { toggleItemCheck: { __typename: 'Item', id: string, is_checked: boolean } };

export type DeleteItemMutationVariables = Exact<{
  itemId: Scalars['ID']['input'];
}>;


export type DeleteItemMutation = { deleteItem: boolean };


export const GetBoardSharesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBoardShares"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardShares"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"board_id"}},{"kind":"Field","name":{"kind":"Name","value":"shared_with_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"shared_with_user_email"}},{"kind":"Field","name":{"kind":"Name","value":"shared_with_user_name"}},{"kind":"Field","name":{"kind":"Name","value":"shared_by_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"permission_level"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<GetBoardSharesQuery, GetBoardSharesQueryVariables>;
export const GetSharedBoardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSharedBoards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sharedBoards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"board_type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"myPermission"}},{"kind":"Field","name":{"kind":"Name","value":"isShared"}}]}}]}}]} as unknown as DocumentNode<GetSharedBoardsQuery, GetSharedBoardsQueryVariables>;
export const ShareBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ShareBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"permission"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PermissionLevel"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shareBoard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"permission"},"value":{"kind":"Variable","name":{"kind":"Name","value":"permission"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"board_id"}},{"kind":"Field","name":{"kind":"Name","value":"shared_with_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"shared_with_user_email"}},{"kind":"Field","name":{"kind":"Name","value":"shared_with_user_name"}},{"kind":"Field","name":{"kind":"Name","value":"permission_level"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<ShareBoardMutation, ShareBoardMutationVariables>;
export const UpdateBoardShareDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBoardShare"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"shareId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"permission"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PermissionLevel"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBoardShare"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"shareId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"shareId"}}},{"kind":"Argument","name":{"kind":"Name","value":"permission"},"value":{"kind":"Variable","name":{"kind":"Name","value":"permission"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"permission_level"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<UpdateBoardShareMutation, UpdateBoardShareMutationVariables>;
export const RemoveBoardShareDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveBoardShare"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"shareId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeBoardShare"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"shareId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"shareId"}}}]}]}}]} as unknown as DocumentNode<RemoveBoardShareMutation, RemoveBoardShareMutationVariables>;
export const GenerateShareLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateShareLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateShareLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}}]}]}}]} as unknown as DocumentNode<GenerateShareLinkMutation, GenerateShareLinkMutationVariables>;
export const RevokeShareLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeShareLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeShareLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}}]}]}}]} as unknown as DocumentNode<RevokeShareLinkMutation, RevokeShareLinkMutationVariables>;
export const GetBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"board"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"board_type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"is_checked"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"google_event_id"}},{"kind":"Field","name":{"kind":"Name","value":"event_start_time"}},{"kind":"Field","name":{"kind":"Name","value":"event_end_time"}},{"kind":"Field","name":{"kind":"Name","value":"event_description"}},{"kind":"Field","name":{"kind":"Name","value":"google_calendar_link"}}]}}]}}]}}]} as unknown as DocumentNode<GetBoardQuery, GetBoardQueryVariables>;
export const MyBoardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyBoards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myBoards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"board_type"}}]}}]}}]} as unknown as DocumentNode<MyBoardsQuery, MyBoardsQueryVariables>;
export const CreateBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"board_type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BoardType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"description"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBoard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"board_type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"board_type"}}},{"kind":"Argument","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"description"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"board_type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<CreateBoardMutation, CreateBoardMutationVariables>;
export const UpdateBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"description"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBoard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"description"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<UpdateBoardMutation, UpdateBoardMutationVariables>;
export const DeleteBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteBoard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteBoardMutation, DeleteBoardMutationVariables>;
export const CalendarSyncStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CalendarSyncStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"calendarSyncStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isConnected"}},{"kind":"Field","name":{"kind":"Name","value":"calendarId"}},{"kind":"Field","name":{"kind":"Name","value":"calendarName"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncAt"}},{"kind":"Field","name":{"kind":"Name","value":"syncRangeDays"}}]}}]}}]} as unknown as DocumentNode<CalendarSyncStatusQuery, CalendarSyncStatusQueryVariables>;
export const AvailableCalendarsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AvailableCalendars"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableCalendars"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primary"}}]}}]}}]} as unknown as DocumentNode<AvailableCalendarsQuery, AvailableCalendarsQueryVariables>;
export const SelectBoardCalendarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SelectBoardCalendar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"calendarId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"calendarName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"selectBoardCalendar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"calendarId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"calendarId"}}},{"kind":"Argument","name":{"kind":"Name","value":"calendarName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"calendarName"}}}]}]}}]} as unknown as DocumentNode<SelectBoardCalendarMutation, SelectBoardCalendarMutationVariables>;
export const SyncBoardCalendarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncBoardCalendar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncBoardCalendar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"itemsCreated"}},{"kind":"Field","name":{"kind":"Name","value":"itemsUpdated"}},{"kind":"Field","name":{"kind":"Name","value":"itemsDeleted"}}]}}]}}]} as unknown as DocumentNode<SyncBoardCalendarMutation, SyncBoardCalendarMutationVariables>;
export const DisconnectBoardCalendarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DisconnectBoardCalendar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disconnectBoardCalendar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}}]}]}}]} as unknown as DocumentNode<DisconnectBoardCalendarMutation, DisconnectBoardCalendarMutationVariables>;
export const UpdateCalendarSyncRangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCalendarSyncRange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"days"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCalendarSyncRange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"days"},"value":{"kind":"Variable","name":{"kind":"Name","value":"days"}}}]}]}}]} as unknown as DocumentNode<UpdateCalendarSyncRangeMutation, UpdateCalendarSyncRangeMutationVariables>;
export const GetItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"is_checked"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"board_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<GetItemQuery, GetItemQueryVariables>;
export const CreateItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"details"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"details"},"value":{"kind":"Variable","name":{"kind":"Name","value":"details"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"is_checked"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]} as unknown as DocumentNode<CreateItemMutation, CreateItemMutationVariables>;
export const UpdateItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"details"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"details"},"value":{"kind":"Variable","name":{"kind":"Name","value":"details"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"is_checked"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]} as unknown as DocumentNode<UpdateItemMutation, UpdateItemMutationVariables>;
export const ToggleItemCheckDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleItemCheck"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleItemCheck"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"is_checked"}}]}}]}}]} as unknown as DocumentNode<ToggleItemCheckMutation, ToggleItemCheckMutationVariables>;
export const DeleteItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}]}]}}]} as unknown as DocumentNode<DeleteItemMutation, DeleteItemMutationVariables>;