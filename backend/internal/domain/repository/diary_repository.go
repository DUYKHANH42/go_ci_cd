package repository

import (
	"context"

	"github.com/demo-diary/diary-management/internal/domain/entity"
)

// DiaryFilter defines filter options for querying diaries (DTO for query)
type DiaryFilter struct {
	UserID    uint
	Keyword   string
	Mood      entity.Mood
	Tags      string
	StartDate string
	EndDate   string
	Page      int
	PageSize  int
}

// DiaryListResult holds paginated results
type DiaryListResult struct {
	Diaries    []entity.Diary
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// DiaryRepository defines the interface for diary data access (Repository Pattern)
type DiaryRepository interface {
	Create(ctx context.Context, diary *entity.Diary) error
	Update(ctx context.Context, diary *entity.Diary) error
	Delete(ctx context.Context, id uint, userID uint) error
	FindByID(ctx context.Context, id uint) (*entity.Diary, error)
	FindByUserID(ctx context.Context, userID uint, page, pageSize int) (*DiaryListResult, error)
	Search(ctx context.Context, filter DiaryFilter) (*DiaryListResult, error)
}
