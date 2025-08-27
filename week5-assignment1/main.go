package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Boarding struct {
	ID        string `json:"id"`
	PetName   string `json:"pet_name"`
	Species   string `json:"species"`
	OwnerName string `json:"owner_name"`
	Status    string `json:"status"` // pending, checked_in, checked_out
	Notes     string `json:"notes"`
}

var boardings = []Boarding{
	{ID: "B001", PetName: "Bingsu", Species: "dog", OwnerName: "Sonsukku", Status: "checked_in", Notes: "แพ้อาหารไก่"},
	{ID: "B002", PetName: "Mali", Species: "cat", OwnerName: "Jujihoon", Status: "pending", Notes: "ทรายแมวไม่มีกลิ่น"},
	{ID: "B003", PetName: "Lindy", Species: "dog", OwnerName: "bogummy", Status: "checked_out", Notes: "-"},
}

func getBoardings(c *gin.Context) {
	nameQuery := c.Query("name")

	if nameQuery != "" {
		filter := []Boarding{}
		for _, b := range boardings {
			if fmt.Sprint(b.PetName) == nameQuery {
				filter = append(filter, b)
			}
		}
		c.IndentedJSON(http.StatusOK, filter)
		return
	}
	c.IndentedJSON(http.StatusOK, boardings)
}

func getBoardingByID(c *gin.Context) {
	IDQuery := c.Query("id")

	if IDQuery != "" {
		filter := []Boarding{}
		for _, b := range boardings {
			if b.ID == IDQuery {
				filter = append(filter, b)
			}
		}
		c.IndentedJSON(http.StatusOK, filter)
		return
	}

	c.IndentedJSON(http.StatusNotFound, gin.H{
		"message": fmt.Sprintf("No boarding found with ID %s", IDQuery),
	})
}

func main() {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, gin.H{
			"message": "Pet Boarding system is running",
			"status":  "healthy",
		})
	})

	api := r.Group("/api/v1")
	{
		api.GET("/boarding", getBoardings)
		api.GET("/boardingbyid", getBoardingByID)
	}

	r.Run(":8080")
}
