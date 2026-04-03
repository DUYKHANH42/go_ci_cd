package usecase

import (
	"context"

	domainErrors "github.com/demo-diary/diary-management/internal/domain/errors"
	"github.com/demo-diary/diary-management/internal/domain/entity"
	domainRepo "github.com/demo-diary/diary-management/internal/domain/repository"
	"github.com/demo-diary/diary-management/internal/infrastructure/auth"
	"github.com/demo-diary/diary-management/internal/usecase/dto"
	"golang.org/x/crypto/bcrypt"
)

// UserUseCase defines the interface for user business logic
type UserUseCase interface {
	Register(ctx context.Context, req dto.RegisterRequest) (*dto.UserResponse, error)
	Login(ctx context.Context, req dto.LoginRequest) (*dto.LoginResponse, error)
	GetProfile(ctx context.Context, userID uint) (*dto.UserResponse, error)
}

// userUseCaseImpl implements UserUseCase
type userUseCaseImpl struct {
	userRepo   domainRepo.UserRepository
	jwtManager *auth.JWTManager
}

// NewUserUseCase creates a new UserUseCase (Dependency Injection)
func NewUserUseCase(userRepo domainRepo.UserRepository, jwtManager *auth.JWTManager) UserUseCase {
	return &userUseCaseImpl{
		userRepo:   userRepo,
		jwtManager: jwtManager,
	}
}

// Register creates a new user account
func (uc *userUseCaseImpl) Register(ctx context.Context, req dto.RegisterRequest) (*dto.UserResponse, error) {
	// Check if email already exists
	existingUser, _ := uc.userRepo.FindByEmail(ctx, req.Email)
	if existingUser != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrDuplicate, "Email đã được sử dụng", 409)
	}

	// Check if username already exists
	existingUser, _ = uc.userRepo.FindByUsername(ctx, req.Username)
	if existingUser != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrDuplicate, "Username đã được sử dụng", 409)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi khi mã hóa mật khẩu", 500)
	}

	// Create user entity using Factory Method
	user, err := entity.NewUser(req.Username, req.Email, string(hashedPassword), req.FullName)
	if err != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrValidation, err.Error(), 400)
	}

	// Save to repository
	if err := uc.userRepo.Create(ctx, user); err != nil {
		if domainErrors.IsDuplicate(err) {
			return nil, domainErrors.NewAppError(domainErrors.ErrDuplicate, "Tài khoản đã tồn tại", 409)
		}
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi khi tạo tài khoản", 500)
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		FullName:  user.FullName,
		CreatedAt: user.CreatedAt,
	}, nil
}

// Login authenticates a user and returns a JWT token
func (uc *userUseCaseImpl) Login(ctx context.Context, req dto.LoginRequest) (*dto.LoginResponse, error) {
	// Find user by email
	user, err := uc.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		if domainErrors.IsNotFound(err) {
			return nil, domainErrors.NewAppError(domainErrors.ErrUnauthorized, "Email hoặc mật khẩu không đúng", 401)
		}
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi hệ thống", 500)
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrUnauthorized, "Email hoặc mật khẩu không đúng", 401)
	}

	// Generate JWT token
	token, err := uc.jwtManager.GenerateToken(user.ID, user.Username, user.Email)
	if err != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi khi tạo token", 500)
	}

	return &dto.LoginResponse{
		Token: token,
		User: dto.UserResponse{
			ID:        user.ID,
			Username:  user.Username,
			Email:     user.Email,
			FullName:  user.FullName,
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

// GetProfile returns the user profile
func (uc *userUseCaseImpl) GetProfile(ctx context.Context, userID uint) (*dto.UserResponse, error) {
	user, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil {
		if domainErrors.IsNotFound(err) {
			return nil, domainErrors.NewAppError(domainErrors.ErrNotFound, "Không tìm thấy người dùng", 404)
		}
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi hệ thống", 500)
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		FullName:  user.FullName,
		CreatedAt: user.CreatedAt,
	}, nil
}
