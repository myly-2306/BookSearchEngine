const { Book, User } = require('../models');
const {AuthenticationError} = require('apollo-server-express');
const {signToken} = require('../utils/auth');

const resolvers = {
  Query: {
    // books: async () => {
    //   return Book.find().sort({ title: -1 });
    // },

    // book: async (parent, { bookId }) => {
    //   return Book.findOne({ bookId: bookId });
    // },

    // users: async () => {
    //   return User.find().sort({ username: -1 });
    // },
    // user: async (parent, { username }) => {
    //   return User.findOne({ username: username });
    // },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No profile with this email found!');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { username, bookId, authors, description, title, image, link }, context) => {
      if (context.user) {
        return Book.findOneAndUpdate(
          { username: context.user.username },
          {
            $addToSet: { savedBooks: { bookId, authors, description, title, image, link } },
          },
          {
            new: true,
            runValidators: true,
          }
        );
        return user;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    removeBook: async (parent, { bookId }, context) => {
      // if (context.user) {
      //   const bookRemoved = await Book.findOneAndDelete({ bookId: bookId });
      //   await Book.findOneAndUpdate(
      //     { bookId: context.user.bookId },
      //     { 
      //       $pull: {savedBooks: { bookRemoved.bookId, authors, description, title, image, link }}
      //     }
      //   );
      //   return bookRemoved;
      // }
      // throw new AuthenticationError('You need to be logged in!');
      if (context.user) {
        const book = await Book.findOneAndDelete({
          bookId,
        });

        const user = await User.findOneAndUpdate(
          { username: context.user.username },
          { $pull: { savedBooks: {bookId: bookId} } }
        );
        return user;
      }
      throw new AuthenticationError("You need to be logged in!");
    }
  },
};

module.exports = resolvers;
