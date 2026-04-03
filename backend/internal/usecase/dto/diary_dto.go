package dto

import (
	"time"

	"github.com/demo-diary/diary-management/internal/domain/entity"
)

// CreateDiaryRequest represents the request to create a diary
type CreateDiaryRequest struct {
	Title     string      `json:"title" binding:"required,min=1,max=200"`
	Content   string      `json:"content" binding:"required"`
	Mood      entity.Mood `json:"mood"`
	Tags      string      `json:"tags" binding:"max=500"`
	IsPrivate *bool       `json:"is_private"`
}

// UpdateDiaryRequest represents the request to update a diary
type UpdateDiaryRequest struct {
	Title     *string      `json:"title" binding:"omitempty,min=1,max=200"`
	Content   *string      `json:"content"`
	Mood      *entity.Mood `json:"mood"`
	Tags      *string      `json:"tags" binding:"omitempty,max=500"`
	IsPrivate *bool        `json:"is_private"`
}

// DiaryResponse represents a single diary response DTO
type DiaryResponse struct {
	ID        uint        `json:"id"`
	UserID    uint        `json:"user_id"`
	Title     string      `json:"title"`
	Content   string      `json:"content"`
	Mood      entity.Mood `json:"mood"`
	Tags      string      `json:"tags"`
	IsPrivate bool        `json:"is_private"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

// DiaryListResponse represents a paginated list of diaries
type DiaryListResponse struct {
	Diaries    []DiaryResponse `json:"diaries"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}

// DiaryFilterRequest represents the search/filter request
type DiaryFilterRequest struct {
	Keyword   string `form:"keyword"`
	Mood      string `form:"mood"`
	Tags      string `form:"tags"`
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
	Page      int    `form:"page"`
	PageSize  int    `form:"page_size"`
}

// ToDiaryResponse converts an entity to a response DTO
func ToDiaryResponse(diary *entity.Diary) DiaryResponse {
	return DiaryResponse{
		ID:        diary.ID,
		UserID:    diary.UserID,
		Title:     diary.Title,
		Content:   diary.Content,
		Mood:      diary.Mood,
		Tags:      diary.Tags,
		IsPrivate: diary.IsPrivate,
		CreatedAt: diary.CreatedAt,
		UpdatedAt: diary.UpdatedAt,
	}
}

// ToDiaryListResponse converts a list of entities to a list response DTO
func ToDiaryListResponse(diaries []entity.Diary, total int64, page, pageSize, totalPages int) DiaryListResponse {
	responses := make([]DiaryResponse, len(diaries))
	for i, d := range diaries {
		responses[i] = ToDiaryResponse(&d)
	}
	return DiaryListResponse{
		Diaries:    responses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
