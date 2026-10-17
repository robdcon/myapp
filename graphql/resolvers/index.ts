import { userResolvers } from './user.resolver';
import { boardResolvers } from './board.resolver';
import { itemResolvers } from './item.resolver';
import { boardShareResolvers } from './board-share.resolver';
import { calendarResolvers } from './calendar.resolver';
import { categoryResolvers } from './category.resolver';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...boardResolvers.Query,
    ...itemResolvers.Query,
    ...boardShareResolvers.Query,
    ...calendarResolvers.Query,
    ...categoryResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...boardResolvers.Mutation,
    ...itemResolvers.Mutation,
    ...boardShareResolvers.Mutation,
    ...calendarResolvers.Mutation,
    ...categoryResolvers.Mutation,
  },
  User: userResolvers.User,
  Board: {
    ...boardResolvers.Board,
    ...boardShareResolvers.Board,
    ...calendarResolvers.Board,
    ...categoryResolvers.Board,
  },
  BoardShare: boardShareResolvers.BoardShare,
  // Post: boardResolvers.Post,
  // Item: itemResolvers.Item,
};
