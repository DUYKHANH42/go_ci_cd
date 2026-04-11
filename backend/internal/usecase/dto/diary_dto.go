package dto

import (
	"errors"
	"strings"
	"time"

	"github.com/demo-diary/diary-management/internal/domain/entity"
)

// CreateDiaryRequest represents the request to create a diary
type CreateDiaryRequest struct {
	Title     string      `json:"title" binding:"required,min=1,max=200"`
	Content   string      `json:"content" binding:"required"`
	Mood      entity.Mood `json:"mood"`
	Tags      string      `json:"tags" binding:"max=500"`
	ImageURLs []string    `json:"image_urls" binding:"omitempty"`
	IsPrivate *bool       `json:"is_private"`
}

// UpdateDiaryRequest represents the request to update a diary
type UpdateDiaryRequest struct {
	Title     *string      `json:"title" binding:"omitempty,min=1,max=200"`
	Content   *string      `json:"content"`
	Mood      *entity.Mood `json:"mood"`
	Tags      *string      `json:"tags" binding:"omitempty,max=500"`
	ImageURLs []string     `json:"image_urls" binding:"omitempty"`
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
	ImageURLs []string    `json:"image_urls"`
	IsPrivate bool        `json:"is_private"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

// DiaryStatisticsResponse represents the mood analytics data
type DiaryStatisticsResponse struct {
	TotalEntries     int64          `json:"total_entries"`
	MoodDistribution map[string]int `json:"mood_distribution"`
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
	Keyword   string `form:"keyword"   binding:"omitempty,max=100"`
	Mood      string `form:"mood"      binding:"omitempty,oneof=happy sad neutral excited anxious angry calm"`
	Tags      string `form:"tags"      binding:"omitempty,max=100"`
	StartDate string `form:"start_date" binding:"omitempty"`
	EndDate   string `form:"end_date"   binding:"omitempty"`
	Page      int    `form:"page"      binding:"omitempty,min=1"`
	PageSize  int    `form:"page_size" binding:"omitempty,min=1,max=100"`
}

// Validate performs semantic validation beyond struct tags
func (f *DiaryFilterRequest) Validate() error {
	const layout = "2006-01-02"
	if f.StartDate != "" {
		if _, err := time.Parse(layout, f.StartDate); err != nil {
			return errors.New("start_date phải có định dạng YYYY-MM-DD")
		}
	}
	if f.EndDate != "" {
		if _, err := time.Parse(layout, f.EndDate); err != nil {
			return errors.New("end_date phải có định dạng YYYY-MM-DD")
		}
	}
	if f.StartDate != "" && f.EndDate != "" && f.StartDate > f.EndDate {
		return errors.New("start_date không được lớn hơn end_date")
	}
	return nil
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
		ImageURLs: func() []string {
			if diary.ImageURLs == "" {
				return []string{}
			}
			return strings.Split(diary.ImageURLs, ",")
		}(),
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
