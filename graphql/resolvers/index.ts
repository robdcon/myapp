import { userResolvers } from './user.resolver';
import { boardResolvers } from './board.resolver';
import { itemResolvers } from './item.resolver';
import { boardShareResolvers } from './board-share.resolver';

export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...boardResolvers.Query,
        ...itemResolvers.Query,
        ...boardShareResolvers.Query,
    },
    Mutation: {
        ...userResolvers.Mutation,
        // ...boardResolvers.Mutation,
        ...itemResolvers.Mutation,
        ...boardShareResolvers.Mutation,
    },
    User: userResolvers.User,
    Board: {
        ...boardResolvers.Board,
        ...boardShareResolvers.Board,
    },
    BoardShare: boardShareResolvers.BoardShare,
    // Post: boardResolvers.Post,
    // Item: itemResolvers.Item,
};