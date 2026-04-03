package repository

import (
	"context"
	"errors"

	domainErrors "github.com/demo-diary/diary-management/internal/domain/errors"
	"github.com/demo-diary/diary-management/internal/domain/entity"
	domainRepo "github.com/demo-diary/diary-management/internal/domain/repository"
	"gorm.io/gorm"
)

// userRepositoryImpl implements the UserRepository interface
type userRepositoryImpl struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository (Dependency Injection via constructor)
func NewUserRepository(db *gorm.DB) domainRepo.UserRepository {
	return &userRepositoryImpl{db: db}
}

// Create saves a new user to the database
func (r *userRepositoryImpl) Create(ctx context.Context, user *entity.User) error {
	result := r.db.WithContext(ctx).Create(user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) || 
			isDuplicateError(result.Error) {
			return domainErrors.ErrDuplicate
		}
		return result.Error
	}
	return nil
}

// FindByID finds a user by their ID
func (r *userRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.User, error) {
	var user entity.User
	result := r.db.WithContext(ctx).First(&user, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, domainErrors.ErrNotFound
		}
		return nil, result.Error
	}
	return &user, nil
}

// FindByEmail finds a user by email
func (r *userRepositoryImpl) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user entity.User
	result := r.db.WithContext(ctx).Where("email = ?", email).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, domainErrors.ErrNotFound
		}
		return nil, result.Error
	}
	return &user, nil
}

// FindByUsername finds a user by username
func (r *userRepositoryImpl) FindByUsername(ctx context.Context, username string) (*entity.User, error) {
	var user entity.User
	result := r.db.WithContext(ctx).Where("username = ?", username).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, domainErrors.ErrNotFound
		}
		return nil, result.Error
	}
	return &user, nil
}

// Update updates a user record
func (r *userRepositoryImpl) Update(ctx context.Context, user *entity.User) error {
	result := r.db.WithContext(ctx).Save(user)
	return result.Error
}

// isDuplicateError checks if the error is a PostgreSQL duplicate key error
func isDuplicateError(err error) bool {
	return err != nil && (errors.Is(err, gorm.ErrDuplicatedKey) ||
		contains(err.Error(), "duplicate key") ||
		contains(err.Error(), "UNIQUE constraint"))
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && searchString(s, substr)
}

func searchString(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
