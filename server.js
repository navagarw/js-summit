var express = require('express');
var express_graphql = require('express-graphql');
var {find, filter} = require('lodash');
var {makeExecutableSchema} = require('graphql-tools');
// GraphQL schema
const typeDefs = `
  type Author {
    id: Int!
    name: String
    posts: [Post] # the list of Posts by this author
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }

  # the schema allows the following query:
  type Query {
    post(id: Int!): Post
    posts: [Post]
    getAuthor(id: Int!): Author
  }

  # this schema allows the following mutation:
  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }
`;

const authors = [
  {id: 1, name: 'Tom Coleman'},
  {id: 2, name: 'Sashko Stubailo'},
  {id: 3, name: 'Mikhail Novikov'},
];

const posts = [
  {id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2},
  {id: 2, authorId: 2, title: 'Welcome to Apollo', votes: 3},
  {id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1},
  {id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7},
];

var getPost = function (root, {id}) { 
  return posts.filter(post => post.id === id)[0];
};

const resolvers = {
  Query: {
    posts: () => posts,
    post: getPost,
    getAuthor: (_, {id}) => find(authors, {id: id}),
  },
  Mutation: {
    upvotePost: (_, {postId}) => {
      const post = find(posts, {id: postId});
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post.votes += 1;
      return post;
    },
  },
  Author: {
    posts: (author) => filter(posts, {authorId: author.id}),
  },
  Post: {
    author: (post) => find(authors, {id: post.authorId}),
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
  schema: schema,
  graphiql: true
}));
app.listen(8000, () => console.log('Express GraphQL Server Now Running On localhost:8000/graphql'));


// query {
//   getAuthor(id: 2){
//     name
//     posts {
//       title
//       author {
//         name # this will be the same as the name above
//       }
//     }
//   }
// }


// query PostsAndUser {
//   post(id:1){
//     id
//     title
//     author {
//       name
//     }
//   }
// }


// query PostsAndUser {
//   post(id:1){
//     id
//     title
//     votes
//     author {
//       id
//       name
//       posts {
//         id
//         title
//       }
//     }
//   }
// }


// mutation {
//   upvotePost(postId: 1) {
//     id
//     title
//     votes
//   }
// }
