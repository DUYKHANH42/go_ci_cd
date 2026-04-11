package handler

import (
	"strconv"

	"github.com/demo-diary/diary-management/internal/delivery/http/middleware"
	"github.com/demo-diary/diary-management/internal/usecase"
	"github.com/demo-diary/diary-management/internal/usecase/dto"
	"github.com/demo-diary/diary-management/pkg/response"
	"github.com/gin-gonic/gin"
)

// DiaryHandler handles diary-related HTTP requests
type DiaryHandler struct {
	diaryUseCase usecase.DiaryUseCase
}

// NewDiaryHandler creates a new DiaryHandler (Dependency Injection)
func NewDiaryHandler(diaryUseCase usecase.DiaryUseCase) *DiaryHandler {
	return &DiaryHandler{
		diaryUseCase: diaryUseCase,
	}
}

// Create handles creating a new diary entry
// @Summary Create a new diary entry
// @Tags Diaries
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateDiaryRequest true "Create Diary Request"
// @Success 201 {object} response.Response
// @Router /api/v1/diaries [post]
func (h *DiaryHandler) Create(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		response.Unauthorized(c, "Không thể xác thực người dùng")
		return
	}

	var req dto.CreateDiaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ", err.Error())
		return
	}

	diary, err := h.diaryUseCase.Create(c.Request.Context(), userID, req)
	if err != nil {
		HandleError(c, err)
		return
	}

	response.Created(c, "Tạo nhật ký thành công", diary)
}

// GetAll handles getting all diary entries for the current user
// @Summary Get all diary entries
// @Tags Diaries
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(10)
// @Success 200 {object} response.Response
// @Router /api/v1/diaries [get]
func (h *DiaryHandler) GetAll(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		response.Unauthorized(c, "Không thể xác thực người dùng")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	diaries, err := h.diaryUseCase.GetByUserID(c.Request.Context(), userID, page, pageSize)
	if err != nil {
		HandleError(c, err)
		return
	}

	response.OK(c, "Lấy danh sách nhật ký thành công", diaries)
}

// GetByID handles getting a diary entry by ID
// @Summary Get a diary entry by ID
// @Tags Diaries
// @Produce json
// @Security BearerAuth
// @Param id path int true "Diary ID"
// @Success 200 {object} response.Response
// @Router /api/v1/diaries/{id} [get]
func (h *DiaryHandler) GetByID(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		response.Unauthorized(c, "Không thể xác thực người dùng")
		return
	}

	diaryID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "ID nhật ký không hợp lệ", nil)
		return
	}

	diary, err := h.diaryUseCase.GetByID(c.Request.Context(), userID, uint(diaryID))
	if err != nil {
		HandleError(c, err)
		return
	}

	response.OK(c, "Lấy nhật ký thành công", diary)
}

// Update handles updating a diary entry
// @Summary Update a diary entry
// @Tags Diaries
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Diary ID"
// @Param request body dto.UpdateDiaryRequest true "Update Diary Request"
// @Success 200 {object} response.Response
// @Router /api/v1/diaries/{id} [put]
func (h *DiaryHandler) Update(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		response.Unauthorized(c, "Không thể xác thực người dùng")
		return
	}

	diaryID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "ID nhật ký không hợp lệ", nil)
		return
	}

	var req dto.UpdateDiaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ", err.Error())
		return
	}

	diary, err := h.diaryUseCase.Update(c.Request.Context(), userID, uint(diaryID), req)
	if err != nil {
		HandleError(c, err)
		return
	}

	response.OK(c, "Cập nhật nhật ký thành công", diary)
}

// Delete handles deleting a diary entry
// @Summary Delete a diary entry
// @Tags Diaries
// @Produce json
// @Security BearerAuth
// @Param id path int true "Diary ID"
// @Success 200 {object} response.Response
// @Router /api/v1/diaries/{id} [delete]
func (h *DiaryHandler) Delete(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		response.Unauthorized(c, "Không thể xác thực người dùng")
		return
	}

	diaryID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "ID nhật ký không hợp lệ", nil)
		return
	}

	if err := h.diaryUseCase.Delete(c.Request.Context(), userID, uint(diaryID)); err != nil {
		HandleError(c, err)
		return
	}

	response.OK(c, "Xóa nhật ký thành công", nil)
}

// Search handles searching diary entries
// @Summary Search diary entries
// @Tags Diaries
// @Produce json
// @Security BearerAuth
// @Param keyword query string false "Search keyword"
// @Param mood query string false "Mood filter"
// @Param tags query string false "Tags filter"
// @Param start_date query string false "Start date (YYYY-MM-DD)"
// @Param end_date query string false "End date (YYYY-MM-DD)"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} response.Response
// @Router /api/v1/diaries/search [get]
func (h *DiaryHandler) Search(c *gin.Context) {
    userID, ok := middleware.GetUserIDFromContext(c)
    if !ok {
        response.Unauthorized(c, "Không thể xác thực người dùng")
        return
    }

    var filter dto.DiaryFilterRequest
    if err := c.ShouldBindQuery(&filter); err != nil {
        response.BadRequest(c, "Tham số tìm kiếm không hợp lệ", err.Error())
        return
    }

    // Validate struct tags using middleware helper
    if !middleware.ValidateStruct(c, &filter) {
        return // response already sent
    }

    // Additional semantic validation (date format, range)
    if err := filter.Validate(); err != nil {
        response.BadRequest(c, "Tham số không hợp lệ", err.Error())
        return
    }

    diaries, err := h.diaryUseCase.Search(c.Request.Context(), userID, filter)
    if err != nil {
        HandleError(c, err)
        return
    }

    response.OK(c, "Tìm kiếm nhật ký thành công", diaries)
}

// GetStatistics handling mood entry analytics
// @Summary Get mood statistics
// @Tags Diaries
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response
// @Router /api/v1/diaries/statistics [get]
func (h *DiaryHandler) GetStatistics(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		response.Unauthorized(c, "Không thể xác thực người dùng")
		return
	}

	stats, err := h.diaryUseCase.GetStatistics(c.Request.Context(), userID)
	if err != nil {
		HandleError(c, err)
		return
	}

	response.OK(c, "Lấy thống kê thành công", stats)
}
