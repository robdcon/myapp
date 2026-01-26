import { gql } from '@apollo/client';

// Queries
export const GET_BOARD_QUERY = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id
      name
      board_type
      description
      items {
        id
        name
        details
        is_checked
        category
        google_event_id
        event_start_time
        event_end_time
        event_description
        google_calendar_link
      }
    }
  }
`;

export const MY_BOARDS_QUERY = gql`
  query MyBoards {
    myBoards {
      id
      name
      created_at
      board_type
    }
  }
`;

// Mutations
export const CREATE_BOARD_MUTATION = gql`
  mutation CreateBoard($name: String!, $board_type: String!, $description: String) {
    createBoard(name: $name, board_type: $board_type, description: $description) {
      id
      name
      board_type
      description
      created_at
    }
  }
`;

export const UPDATE_BOARD_MUTATION = gql`
  mutation UpdateBoard($id: ID!, $name: String, $description: String) {
    updateBoard(id: $id, name: $name, description: $description) {
      id
      name
      description
      updated_at
    }
  }
`;

export const DELETE_BOARD_MUTATION = gql`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id)
  }
`;

// Calendar Queries
export const CALENDAR_STATUS_QUERY = gql`
  query CalendarSyncStatus($boardId: ID!) {
    calendarSyncStatus(boardId: $boardId) {
      isConnected
      calendarId
      calendarName
      lastSyncAt
      syncRangeDays
    }
  }
`;

export const AVAILABLE_CALENDARS_QUERY = gql`
  query AvailableCalendars($boardId: ID!) {
    availableCalendars(boardId: $boardId) {
      id
      name
      description
      primary
    }
  }
`;

// Calendar Mutations
export const SELECT_CALENDAR_MUTATION = gql`
  mutation SelectBoardCalendar(
    $boardId: ID!
    $calendarId: String!
    $calendarName: String!
  ) {
    selectBoardCalendar(
      boardId: $boardId
      calendarId: $calendarId
      calendarName: $calendarName
    )
  }
`;

export const SYNC_CALENDAR_MUTATION = gql`
  mutation SyncBoardCalendar($boardId: ID!) {
    syncBoardCalendar(boardId: $boardId) {
      success
      message
      itemsCreated
      itemsUpdated
      itemsDeleted
    }
  }
`;

export const DISCONNECT_CALENDAR_MUTATION = gql`
  mutation DisconnectBoardCalendar($boardId: ID!) {
    disconnectBoardCalendar(boardId: $boardId)
  }
`;

export const UPDATE_SYNC_RANGE_MUTATION = gql`
  mutation UpdateCalendarSyncRange($boardId: ID!, $days: Int!) {
    updateCalendarSyncRange(boardId: $boardId, days: $days)
  }
`;
