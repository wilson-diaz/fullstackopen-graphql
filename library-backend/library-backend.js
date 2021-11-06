const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const JWT_SECRET = process.env.JWT_SECRET

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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(
      author: String
      genre: String
    ): [Book!]!
    allAuthors: [Author!]!
    me: User
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
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
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
    allAuthors: async () => await Author.find({}),
    me: (root, args, { currentUser }) => currentUser // from context
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
    addBook: async (root, args, { currentUser }) => {
      // authenticate
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

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
    editAuthor: async (root, args, { currentUser }) => {
      // authenticate
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

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
    },
    createUser: (root, args) => {
      const user = new User({...args})
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== process.env.TEMP_SECRET) {
        throw new UserInputError('incorrect credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
