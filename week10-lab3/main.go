// @title           BookStore API
// @version         1.0
// @description     This is the BookStore API server.
// @host            localhost:8080
// @BasePath        /api/v1

package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
	_ "week10-lab3/docs"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "github.com/swaggo/swag"
)

type ErrorResponse struct {
	Message string `json:"message"`
}

var db *sql.DB

type Book struct {
	ID         int       `json:"id"`
	Title      string    `json:"title"`
	Author     string    `json:"author"`
	ISBN       string    `json:"isbn"`
	Year       int       `json:"year"`
	Price      float64   `json:"price"`
	Created_At time.Time `json:"created_at"`
	Updated_At time.Time `json:"updated_at"`
}

func initDB() {
	var err error
	host := getEnv("DB_HOST", "")
	name := getEnv("DB_NAME", "")
	user := getEnv("DB_USER", "")
	password := getEnv("DB_PASSWORD", "")
	port := getEnv("DB_PORT", "")

	conSt := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, name)

	db, err = sql.Open("postgres", conSt)
	if err != nil {
		log.Fatal("Failed to open database.")
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(20)
	db.SetConnMaxLifetime(5 * time.Minute)

	err = db.Ping()
	if err != nil {
		log.Fatal("Failed to Ping.", err)
	}

	log.Println("Successfully connected to database!")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getHealth(c *gin.Context) {
	err := db.Ping()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"message": "Unhealthy", "error": err})
		return
	}
	c.JSON(200, gin.H{"message": "healthy"})
}

// @Summary     Get book by ID
// @Description Get details of a specific book by ID
// @Tags        Books
// @Accept      json
// @Produce     json
// @Param       id   path      int  true  "Book ID"
// @Success     200  {object}  Book
// @Failure     404  {object}  ErrorResponse
// @Failure     500  {object}  ErrorResponse
// @Router      /books/{id} [get]
func getBook(c *gin.Context) {
	id := c.Param("id")
	var book Book

	err := db.QueryRow("SELECT id, title, author, isbn, year, price, created_at, updated_at FROM books WHERE id = $1", id).
		Scan(&book.ID, &book.Title, &book.Author, &book.ISBN, &book.Year, &book.Price, &book.Created_At, &book.Updated_At)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, book)
}

// @Summary     Get new books
// @Description Get latest books ordered by created date
// @Tags        Books
// @Accept      json
// @Produce     json
// @Param       limit  query    int  false  "Number of books to return (default 5)"
// @Success     200   {array}   Book
// @Failure     500   {object}  ErrorResponse
// @Router      /books/new [get]
func getNewBooks(c *gin.Context) {
	rows, err := db.Query(`
        SELECT id, title, author, isbn, year, price, created_at, updated_at 
        FROM books 
        ORDER BY created_at DESC 
        LIMIT 5
    `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.ISBN, &book.Year, &book.Price, &book.Created_At, &book.Updated_At)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		books = append(books, book)
	}
	c.JSON(http.StatusOK, books)
}

// @Summary     Get all books
// @Description Get all books or filter by year
// @Tags        Books
// @Accept      json
// @Produce     json
// @Success     200  {array}  Book
// @Failure     500  {object}  ErrorResponse
// @Router      /books [get]
func getAllBooks(c *gin.Context) {
	var rows *sql.Rows
	var err error
	YearQ := c.Query("year")

	if YearQ == "" {
		rows, err = db.Query("SELECT id, title, author, isbn, year, price, created_at, updated_at FROM books")
	} else {
		rows, err = db.Query("SELECT id, title, author, isbn, year, price, created_at, updated_at FROM books WHERE year = $1", YearQ)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.ISBN, &book.Year, &book.Price, &book.Created_At, &book.Updated_At)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
		}
		books = append(books, book)
	}
	c.JSON(http.StatusOK, books)
}

// @Summary Create a new book
// @Description Create a new book entry
// @Tags Books
// @Accept json
// @Produce json
// @Param  book  body  Book  true  "Book Data"
// @Success 201  {object}  Book
// @Failure 400  {object}  ErrorResponse
// @Failure 500  {object}  ErrorResponse
// @Router  /books [post]
func createBook(c *gin.Context) {
	var newBook Book
	if err := c.ShouldBindJSON(&newBook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id int
	var created_At, updated_At time.Time

	err := db.QueryRow(`
		INSERT INTO books (title, author, isbn, year, price)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`, newBook.Title, newBook.Author, newBook.ISBN, newBook.Year, newBook.Price).
		Scan(&id, &created_At, &updated_At)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	newBook.ID = id
	newBook.Created_At = created_At
	newBook.Updated_At = updated_At

	c.JSON(http.StatusCreated, newBook)
}

// @Summary     Update a book by ID
// @Description Update book information by its ID
// @Tags        Books
// @Accept      json
// @Produce     json
// @Param       id    path      int   true  "Book ID"
// @Param       book  body      Book  true  "Updated Book Data"
// @Success     200   {object}  Book
// @Failure     400   {object}  ErrorResponse
// @Failure     404   {object}  ErrorResponse
// @Failure     500   {object}  ErrorResponse
// @Router      /books/{id} [put]
func updateBook(c *gin.Context) {
	id := c.Param("id")
	var updateBook Book
	var ID int

	if err := c.ShouldBindJSON(&updateBook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var updatedAt time.Time
	err := db.QueryRow(`
		UPDATE books
		SET title=$1, author=$2, isbn=$3, year=$4, price=$5
		WHERE id=$6
		RETURNING id, updated_at
	`, updateBook.Title, updateBook.Author, updateBook.ISBN, updateBook.Year, updateBook.Price, id).
		Scan(&ID, &updatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	updateBook.ID = ID
	updateBook.Updated_At = updatedAt
	c.JSON(http.StatusOK, updateBook)
}

// @Summary     Delete book by ID
// @Description Delete a specific book
// @Tags        Books
// @Param       id   path      int  true  "Book ID"
// @Success     200  {string}  string  "book deleted successfully"
// @Failure     404  {object}  ErrorResponse
// @Failure     500  {object}  ErrorResponse
// @Router      /books/{id} [delete]
func deleteBook(c *gin.Context) {
	id := c.Param("id")

	result, err := db.Exec("DELETE FROM books WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error message": err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error message": err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "book deleted successfully"})
}

func main() {
	initDB()
	defer db.Close()

	r := gin.Default()
	r.GET("/health", getHealth)

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	r.Use(cors.New(config))

	r.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api/v1")
	{
		api.GET("/books", getAllBooks)
		api.GET("/books/new", getNewBooks)
		api.GET("/books/:id", getBook)
		api.POST("/books", createBook)
		api.PUT("/books/:id", updateBook)
		api.DELETE("/books/:id", deleteBook)
	}

	r.Run(":8080")
}
