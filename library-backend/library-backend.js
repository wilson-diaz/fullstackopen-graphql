const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
require('dotenv').config()

const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to mongodb'))
  .catch(() => console.log('error connecting to mongodb'))

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(
      author: String
      genre: String
    ): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const books = await Book.find({})

      const filteredAuth = !args.author 
        ? books
        : books.filter(b => b.author === args.author)

      return !args.genre
        ? filteredAuth
        : filteredAuth.filter(b => b.genres.some(val => val === args.genre))
    },
    allAuthors: async () => await Author.find({}) 
  },
  Author: {
    bookCount: (root) => {
      return Book.collection.count({ author: root._id }) // _id to match database format
    }
  },
  Mutation: {
    addBook: (root, args) => {
      const newBook = { ...args, id: uuid() }
      books = books.concat(newBook)

      if (!authors.some(a => a.name === args.author)) {
        authors = authors.concat({ name: args.author, id: uuid()})
      }

      return newBook
    },
    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name)
      if (!author){
        return null
      }

      const updatedAuthor = { ...author, born: args.setBornTo }
      authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
      return updatedAuthor
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
