const express = require('express');
const { authMiddleware } = require('./utils/auth')
const path = require('path')
// import ApolloServer
const { ApolloServer } = require('apollo-server-express')

const { typeDefs, resolvers} = require('./schemas')
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const startApolloSever = async (typeDefs, resolvers) => {
  await server.start()
  server.applyMiddleware({ app })
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')))
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    // log where we can go to test our gql api
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`)
  });
});

startApolloSever(typeDefs, resolvers)