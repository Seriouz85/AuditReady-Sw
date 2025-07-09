import { ApolloServerPlugin } from '@apollo/server';

export const performancePlugin: ApolloServerPlugin = {
  requestDidStart() {
    const startTime = Date.now();
    
    return {
      willSendResponse(requestContext) {
        const duration = Date.now() - startTime;
        
        // Log slow queries (over 1 second)
        if (duration > 1000) {
          console.warn(`Slow GraphQL Query (${duration}ms):`, {
            operation: requestContext.request.operationName,
            query: requestContext.request.query?.substring(0, 200),
          });
        }
        
        // Add performance headers
        requestContext.response.http.headers.set('X-Response-Time', `${duration}ms`);
      },
    };
  },
};