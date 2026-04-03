package entity

import (
	"errors"
	"regexp"
	"time"
)

// User represents the user entity in the domain layer
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;size:100;not null"`
	Password  string    `json:"-" gorm:"not null"`
	FullName  string    `json:"full_name" gorm:"size:100"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name for GORM
func (User) TableName() string {
	return "users"
}

// Validation errors
var (
	ErrInvalidUsername = errors.New("username must be between 3 and 50 characters")
	ErrInvalidEmail    = errors.New("invalid email format")
	ErrInvalidPassword = errors.New("password must be at least 6 characters")
	ErrInvalidFullName = errors.New("full name must not exceed 100 characters")
)

// emailRegex is a simple regex for email validation
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// NewUser is a Factory Method to create a new User with validation
func NewUser(username, email, password, fullName string) (*User, error) {
	if len(username) < 3 || len(username) > 50 {
		return nil, ErrInvalidUsername
	}

	if !emailRegex.MatchString(email) {
		return nil, ErrInvalidEmail
	}

	if len(password) < 6 {
		return nil, ErrInvalidPassword
	}

	if len(fullName) > 100 {
		return nil, ErrInvalidFullName
	}

	return &User{
		Username:  username,
		Email:     email,
		Password:  password,
		FullName:  fullName,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}
