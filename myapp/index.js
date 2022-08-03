const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const app = express();
app.use(express.json());

const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http:/localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initialiseDBAndServer();

//Get all Books

app.get("/books/", async (request, response) => {
  const getBooksQuery = `SELECT * FROM book ORDER BY book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//GET single Books

app.get("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const getSingleBook = `SELECT * FROM book WHERE book_id = ${bookId};`;
  const book = await db.get(getSingleBook);
  response.send(book);
});

//POST book

app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `INSERT INTO book ( title,author_Id,rating,rating_Count,review_Count,description,pages,date_Of_Publication,edition_Language,price,online_Stores)
         VALUES (
             "${title}",${authorId},${rating},${ratingCount},${reviewCount},"${description}",${pages},"${dateOfPublication}","${editionLanguage}",${price},"${onlineStores}"
         )`;
  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send({ bookId: bookId });
});

app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
        UPDATE
        book
        SET
        title='${title}',
        author_id=${authorId},
        rating=${rating},
        rating_count=${ratingCount},
        review_count=${reviewCount},
        description='${description}',
        pages=${pages},
        date_of_publication='${dateOfPublication}',
        edition_language='${editionLanguage}',
        price= ${price},
        online_stores='${onlineStores}'
        WHERE
        book_id = ${bookId};`;
  await db.run(updateBookQuery);
  response.send("Updated Successful");
});

app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  response.send("Book Deleted Successfully");
});

app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBooksQuery = `SELECT * FROM book WHERE author_id = ${authorId}`;
  const authors = await db.all(getAuthorBooksQuery);
  response.send(authors);
});
