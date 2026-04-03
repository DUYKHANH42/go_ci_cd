package repository

import (
	"context"

	"github.com/demo-diary/diary-management/internal/domain/entity"
)

// UserRepository defines the interface for user data access (Repository Pattern)
type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	FindByID(ctx context.Context, id uint) (*entity.User, error)
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	FindByUsername(ctx context.Context, username string) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
}
