package middleware

import (
    "github.com/go-playground/validator/v10"
    "github.com/gin-gonic/gin"
    "github.com/demo-diary/diary-management/pkg/response"
)

var validate = validator.New()

// ValidateStruct validates a struct using go-playground/validator and returns a Gin response on error.
func ValidateStruct(c *gin.Context, v interface{}) bool {
    if err := validate.Struct(v); err != nil {
        response.BadRequest(c, "Tham số không hợp lệ", err.Error())
        return false
    }
    return true
}
