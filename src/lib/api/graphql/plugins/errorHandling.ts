import { ApolloServerPlugin } from '@apollo/server';
import { reportError } from '@/lib/monitoring/sentry';

export const errorHandlingPlugin: ApolloServerPlugin = {
  requestDidStart() {
    return {
      didEncounterErrors(requestContext) {
        // Report errors to monitoring service
        for (const error of requestContext.errors) {
          // Don't report validation or syntax errors
          if (error.extensions?.code === 'GRAPHQL_VALIDATION_FAILED' || 
              error.extensions?.code === 'GRAPHQL_PARSE_FAILED') {
            continue;
          }
          
          reportError(error, {
            operation: requestContext.request.operationName,
            variables: requestContext.request.variables,
            user_id: requestContext.contextValue?.user?.id,
          });
        }
      },
    };
  },
};