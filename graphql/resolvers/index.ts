import { userResolvers } from './user.resolver';
import { boardResolvers } from './board.resolver';
import { itemResolvers } from './item.resolver';

export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...boardResolvers.Query,
        ...itemResolvers.Query,
    },
    Mutation: {
        ...userResolvers.Mutation,
        // ...boardResolvers.Mutation,
        ...itemResolvers.Mutation,
    },
    User: userResolvers.User,
    Board: boardResolvers.Board,
    // Post: boardResolvers.Post,
    // Item: itemResolvers.Item,
};