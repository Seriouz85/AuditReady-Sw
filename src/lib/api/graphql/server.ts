import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { supabase } from '@/lib/supabase';
import { rateLimitMiddleware } from '@/lib/security/rateLimit';
import { loggingPlugin } from './plugins/logging';
import { performancePlugin } from './plugins/performance';
import { errorHandlingPlugin } from './plugins/errorHandling';

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Express app
const app = express();

// Apply middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(json({ limit: '50mb' }));
app.use('/graphql', rateLimitMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Create HTTP server
const httpServer = createServer(app);

// Create WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Create GraphQL WebSocket server
// eslint-disable-next-line react-hooks/rules-of-hooks
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx) => {
      // Authenticate WebSocket connections
      const token = ctx.connectionParams?.authorization?.replace('Bearer ', '');
      if (!token) {
        throw new Error('Missing auth token');
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        throw new Error('Invalid auth token');
      }

      return { user, supabase };
    },
    onConnect: async (ctx) => {
      console.log('Client connected to WebSocket');
    },
    onDisconnect: async (ctx) => {
      console.log('Client disconnected from WebSocket');
    },
  },
  wsServer
);

// Create Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    // Drain HTTP server on shutdown
    ApolloServerPluginDrainHttpServer({ httpServer }),
    
    // Shutdown WebSocket server
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
    
    // Landing page for development
    ApolloServerPluginLandingPageLocalDefault({
      embed: true,
      includeCookies: true,
    }),
    
    // Custom plugins
    loggingPlugin,
    performancePlugin,
    errorHandlingPlugin,
  ],
  
  // Context function for regular HTTP requests
  context: async ({ req }) => {
    // Get auth token from headers
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    
    // Verify user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    return {
      user: error ? null : user,
      supabase,
      req,
    };
  },
  
  // Enable introspection in development
  introspection: process.env.NODE_ENV !== 'production',
  
  // Format errors
  formatError: (formattedError, error) => {
    // Log errors to monitoring service
    console.error('GraphQL Error:', error);
    
    // Remove sensitive information in production
    if (process.env.NODE_ENV === 'production') {
      delete formattedError.extensions?.exception;
    }
    
    return formattedError;
  },
});

// Start server function
export async function startGraphQLServer(port = 4000) {
  // Start Apollo Server
  await server.start();
  
  // Apply Apollo middleware
  server.applyMiddleware({ app, path: '/graphql' });
  
  // Start HTTP server
  return new Promise((resolve) => {
    httpServer.listen(port, () => {
      console.log(`🚀 GraphQL Server ready at http://localhost:${port}/graphql`);
      console.log(`🚀 GraphQL Subscriptions ready at ws://localhost:${port}/graphql`);
      resolve(httpServer);
    });
  });
}

// Export for use in other modules
export { server, httpServer, app };