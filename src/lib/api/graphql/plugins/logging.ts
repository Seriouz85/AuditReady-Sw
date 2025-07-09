import { ApolloServerPlugin } from '@apollo/server';

export const loggingPlugin: ApolloServerPlugin = {
  requestDidStart() {
    return {
      didResolveOperation(requestContext) {
        console.log(`GraphQL Operation: ${requestContext.request.operationName || 'Anonymous'}`);
      },
      didEncounterErrors(requestContext) {
        console.error('GraphQL Errors:', requestContext.errors);
      },
    };
  },
};