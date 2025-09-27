package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

type Book struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Author    string    `json:"author"`
	ISBN      string    `json:"isbn"`
	Year      int       `json:"year"`
	Price     float64   `json:"price"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

var db *sql.DB

func initDB() {
	host := getEnv("DB_HOST", "localhost")
	name := getEnv("DB_NAME", "bookstore")
	user := getEnv("DB_USER", "bookstore_user")
	password := getEnv("DB_PASSWORD", "your_password")
	port := getEnv("DB_PORT", "5432")

	conSt := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, name)

	var err error
	db, err = sql.Open("postgres", conSt)
	if err != nil {
		log.Fatal("failed to open database: ", err)
	}

	// กำหนดจำนวน Connection สูงสุด
	db.SetMaxOpenConns(25)

	// กำหนดจำนวน Idle connection สูงสุด
	db.SetMaxIdleConns(20)

	// กำหนดอายุของ Connection
	db.SetConnMaxLifetime(5 * time.Minute)

	if err = db.Ping(); err != nil {
		log.Fatal("failed to connect database: ", err)
	}

	log.Println("successfully connected to database")
}

func getAllBooks(c *gin.Context) {
	rows, err := db.Query("SELECT id, title, author, isbn, year, price, created_at, updated_at FROM books")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.ISBN, &book.Year, &book.Price, &book.CreatedAt, &book.UpdatedAt)
		if err != nil {
			log.Println("scan error:", err)
			continue
		}
		books = append(books, book)
	}
	if books == nil {
		books = []Book{}
	}

	c.JSON(http.StatusOK, books)
}

func main() {
	initDB()
	defer db.Close()

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"message": "unhealthy",
				"error":   err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "healthy"})
	})

	api := r.Group("/api/v1")
	{
		api.GET("/books", getAllBooks)
		// api.GET("/books/:id", getBook)
		// api.POST("/books", createBook)
		// api.PUT("/books/:id", updateBook)
		// api.DELETE("/books/:id", deleteBook)
	}

	r.Run(":8080")
}
