import React, { useState, useEffect } from "react";
import { Jumbotron, Container, CardColumns, Card, Button } from "react-bootstrap";
import { useMutation, useQuery } from "@apollo/client";

import Auth from "../utils/auth";

import { REMOVE_BOOK } from "../utils/mutations";
import { GET_ME } from "../utils/queries";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
  const { loading, data, refetch } = useQuery(GET_ME);
  const savedBooks = data?.me?.savedBooks || [];

  const [deleteBook, { error }] = useMutation(REMOVE_BOOK);

  useEffect(() => {
    refetch();
  }, []);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const response = await deleteBook({ variables: { bookId } });
      console.log("response", response);

      if (error) {
        throw new Error("something went wrong!");
      }

      //const updatedUser = await response.data.deleteBook;
      //setUserData(updatedUser);
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Container>
          <h2>
            {savedBooks.length
              ? `Viewing ${savedBooks.length} saved ${
                  savedBooks.length === 1 ? "book" : "books"
                }:`
              : "You have no saved books!"}
          </h2>
          <CardColumns>
            {savedBooks.map((book) => {
              return (
                <Card key={book.bookId} border="dark">
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant="top"
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className="small">Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className="btn-block btn-danger"
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              );
            })}
          </CardColumns>
        </Container>
      )}
    </>
  );
};

export default SavedBooks;
