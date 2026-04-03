package errors

import "errors"

// Domain-level errors
var (
	ErrNotFound      = errors.New("resource not found")
	ErrDuplicate     = errors.New("resource already exists")
	ErrUnauthorized  = errors.New("unauthorized access")
	ErrForbidden     = errors.New("forbidden access")
	ErrValidation    = errors.New("validation error")
	ErrInternal      = errors.New("internal server error")
	ErrInvalidInput  = errors.New("invalid input")
	ErrTokenExpired  = errors.New("token has expired")
	ErrTokenInvalid  = errors.New("invalid token")
)

// AppError is a custom error type that wraps domain errors with context
type AppError struct {
	Err     error
	Message string
	Code    int
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	return e.Err.Error()
}

// Unwrap returns the wrapped error
func (e *AppError) Unwrap() error {
	return e.Err
}

// NewAppError creates a new AppError
func NewAppError(err error, message string, code int) *AppError {
	return &AppError{
		Err:     err,
		Message: message,
		Code:    code,
	}
}

// IsNotFound checks if the error is a not found error
func IsNotFound(err error) bool {
	return errors.Is(err, ErrNotFound)
}

// IsDuplicate checks if the error is a duplicate error
func IsDuplicate(err error) bool {
	return errors.Is(err, ErrDuplicate)
}

// IsUnauthorized checks if the error is an unauthorized error
func IsUnauthorized(err error) bool {
	return errors.Is(err, ErrUnauthorized)
}
