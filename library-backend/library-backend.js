const { ApolloServer, gql, UserInputError } = require('apollo-server')
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
  Book: {
    author: async (root) => {
      return await Author.findOne({ _id: root.author})
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      // create author if new
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author})
        await author.save()
      }

      const newBook = new Book({ ...args, author: author._id })

      try {
        await newBook.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      return newBook
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author){
        return null
      }

      author.born = args.setBornTo
      console.log(author)
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      return author 
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
