import { ApolloConfig, ApolloBaseContext } from '@ioc:Zakodium/Apollo/Server';

interface ApolloContext extends ApolloBaseContext {
  // Define here what will be available in the GraphQL context
}

const apolloConfig: ApolloConfig<ApolloContext> = {
  schemas: 'app/Schemas',
  resolvers: 'app/Resolvers',
  path: '/graphql',
  apolloServer: {
    context({ ctx }) {
      return { ctx };
    },
  },
  executableSchema: {
    inheritResolversFromInterfaces: true,
  },
  enablePlayground: true,
};

export default apolloConfig;
