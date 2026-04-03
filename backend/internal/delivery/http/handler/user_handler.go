package handler

import (
	"errors"
	"net/http"

	"github.com/demo-diary/diary-management/internal/delivery/http/middleware"
	domainErrors "github.com/demo-diary/diary-management/internal/domain/errors"
	"github.com/demo-diary/diary-management/internal/usecase"
	"github.com/demo-diary/diary-management/internal/usecase/dto"
	"github.com/demo-diary/diary-management/pkg/response"
	"github.com/gin-gonic/gin"
)

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	userUseCase usecase.UserUseCase
}

// NewUserHandler creates a new UserHandler (Dependency Injection)
func NewUserHandler(userUseCase usecase.UserUseCase) *UserHandler {
	return &UserHandler{
		userUseCase: userUseCase,
	}
}

// Register handles user registration
// @Summary Register a new user
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "Register Request"
// @Success 201 {object} response.Response
// @Router /api/v1/auth/register [post]
func (h *UserHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ", err.Error())
		return
	}

	user, err := h.userUseCase.Register(c.Request.Context(), req)
	if err != nil {
		handleError(c, err)
		return
	}

	response.Created(c, "Đăng ký tài khoản thành công", user)
}

// Login handles user login
// @Summary Login
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login Request"
// @Success 200 {object} response.Response
// @Router /api/v1/auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ", err.Error())
		return
	}

	loginResponse, err := h.userUseCase.Login(c.Request.Context(), req)
	if err != nil {
		handleError(c, err)
		return
	}

	response.OK(c, "Đăng nhập thành công", loginResponse)
}

// GetProfile returns the current user's profile
// @Summary Get user profile
// @Tags Auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response
// @Router /api/v1/auth/profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		response.Unauthorized(c, "Không thể xác thực người dùng")
		return
	}

	user, err := h.userUseCase.GetProfile(c.Request.Context(), userID)
	if err != nil {
		handleError(c, err)
		return
	}

	response.OK(c, "Lấy thông tin thành công", user)
}

// handleError is a helper function to handle domain errors and send appropriate HTTP responses
func handleError(c *gin.Context, err error) {
	var appErr *domainErrors.AppError
	if errors.As(err, &appErr) {
		response.Error(c, appErr.Code, appErr.Message, nil)
		return
	}
	response.InternalServerError(c, "Lỗi hệ thống")
}

// HandleError exports the error handler for use by other handlers
func HandleError(c *gin.Context, err error) {
	var appErr *domainErrors.AppError
	if errors.As(err, &appErr) {
		switch appErr.Code {
		case http.StatusBadRequest:
			response.BadRequest(c, appErr.Message, nil)
		case http.StatusUnauthorized:
			response.Unauthorized(c, appErr.Message)
		case http.StatusForbidden:
			response.Forbidden(c, appErr.Message)
		case http.StatusNotFound:
			response.NotFound(c, appErr.Message)
		case http.StatusConflict:
			response.Error(c, http.StatusConflict, appErr.Message, nil)
		default:
			response.InternalServerError(c, appErr.Message)
		}
		return
	}
	response.InternalServerError(c, "Lỗi hệ thống")
}
