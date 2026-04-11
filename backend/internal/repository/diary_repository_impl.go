package repository

import (
	"context"
	"errors"
	"math"

	domainErrors "github.com/demo-diary/diary-management/internal/domain/errors"
	"github.com/demo-diary/diary-management/internal/domain/entity"
	domainRepo "github.com/demo-diary/diary-management/internal/domain/repository"
	"gorm.io/gorm"
)

// diaryRepositoryImpl implements the DiaryRepository interface
type diaryRepositoryImpl struct {
	db *gorm.DB
}

// NewDiaryRepository creates a new diary repository (Dependency Injection)
func NewDiaryRepository(db *gorm.DB) domainRepo.DiaryRepository {
	return &diaryRepositoryImpl{db: db}
}

// Create saves a new diary entry
func (r *diaryRepositoryImpl) Create(ctx context.Context, diary *entity.Diary) error {
	result := r.db.WithContext(ctx).Create(diary)
	return result.Error
}

// Update updates an existing diary entry
func (r *diaryRepositoryImpl) Update(ctx context.Context, diary *entity.Diary) error {
	result := r.db.WithContext(ctx).Save(diary)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domainErrors.ErrNotFound
	}
	return nil
}

// Delete deletes a diary entry by ID and user ID
func (r *diaryRepositoryImpl) Delete(ctx context.Context, id uint, userID uint) error {
	result := r.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", id, userID).
		Delete(&entity.Diary{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domainErrors.ErrNotFound
	}
	return nil
}

// FindByID finds a diary entry by ID
func (r *diaryRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Diary, error) {
	var diary entity.Diary
	result := r.db.WithContext(ctx).First(&diary, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, domainErrors.ErrNotFound
		}
		return nil, result.Error
	}
	return &diary, nil
}

// FindByUserID finds all diary entries for a user with pagination
func (r *diaryRepositoryImpl) FindByUserID(ctx context.Context, userID uint, page, pageSize int) (*domainRepo.DiaryListResult, error) {
	page, pageSize = normalizePagination(page, pageSize)

	var total int64
	r.db.WithContext(ctx).
		Model(&entity.Diary{}).
		Where("user_id = ?", userID).
		Count(&total)

	var diaries []entity.Diary
	offset := (page - 1) * pageSize
	result := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&diaries)

	if result.Error != nil {
		return nil, result.Error
	}

	return &domainRepo.DiaryListResult{
		Diaries:    diaries,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(pageSize))),
	}, nil
}

// Search searches diary entries with filters (Builder Pattern for query construction)
func (r *diaryRepositoryImpl) Search(ctx context.Context, filter domainRepo.DiaryFilter) (*domainRepo.DiaryListResult, error) {
	filter.Page, filter.PageSize = normalizePagination(filter.Page, filter.PageSize)

	// Builder Pattern: Build query step by step
	query := r.db.WithContext(ctx).Model(&entity.Diary{})

	// Apply filters
	query = r.applyUserFilter(query, filter.UserID)
	query = r.applyKeywordFilter(query, filter.Keyword)
	query = r.applyMoodFilter(query, filter.Mood)
	query = r.applyTagsFilter(query, filter.Tags)
	query = r.applyDateFilter(query, filter.StartDate, filter.EndDate)

	// Count total
	var total int64
	query.Count(&total)

	// Apply pagination and ordering
	var diaries []entity.Diary
	offset := (filter.Page - 1) * filter.PageSize
	result := query.
		Order("created_at DESC").
		Offset(offset).
		Limit(filter.PageSize).
		Find(&diaries)

	if result.Error != nil {
		return nil, result.Error
	}

	return &domainRepo.DiaryListResult{
		Diaries:    diaries,
		Total:      total,
		Page:       filter.Page,
		PageSize:   filter.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filter.PageSize))),
	}, nil
}

// GetStatistics implements domainRepo.DiaryRepository
func (r *diaryRepositoryImpl) GetStatistics(ctx context.Context, userID uint) (int64, map[string]int, error) {
	var total int64
	if err := r.db.WithContext(ctx).Model(&entity.Diary{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return 0, nil, err
	}

	type MoodCount struct {
		Mood  string
		Count int
	}
	var results []MoodCount

	if err := r.db.WithContext(ctx).Model(&entity.Diary{}).
		Where("user_id = ?", userID).
		Select("mood, count(*) as count").
		Group("mood").
		Find(&results).Error; err != nil {
		return 0, nil, err
	}

	moodDistribution := make(map[string]int)
	for _, r := range results {
		if r.Mood != "" {
			moodDistribution[r.Mood] = r.Count
		}
	}

	return total, moodDistribution, nil
}

// Builder Pattern helper methods for query construction

func (r *diaryRepositoryImpl) applyUserFilter(query *gorm.DB, userID uint) *gorm.DB {
	if userID > 0 {
		return query.Where("user_id = ?", userID)
	}
	return query
}

func (r *diaryRepositoryImpl) applyKeywordFilter(query *gorm.DB, keyword string) *gorm.DB {
	if keyword != "" {
		like := "%" + keyword + "%"
		return query.Where("(title LIKE ? OR content LIKE ?)", like, like)
	}
	return query
}

func (r *diaryRepositoryImpl) applyMoodFilter(query *gorm.DB, mood entity.Mood) *gorm.DB {
	if mood != "" {
		return query.Where("mood = ?", mood)
	}
	return query
}

func (r *diaryRepositoryImpl) applyTagsFilter(query *gorm.DB, tags string) *gorm.DB {
	if tags != "" {
		like := "%" + tags + "%"
		return query.Where("tags LIKE ?", like)
	}
	return query
}

func (r *diaryRepositoryImpl) applyDateFilter(query *gorm.DB, startDate, endDate string) *gorm.DB {
	if startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("created_at <= ?", endDate+" 23:59:59")
	}
	return query
}

// normalizePagination ensures valid pagination values
func normalizePagination(page, pageSize int) (int, int) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	if pageSize > 100 {
		pageSize = 100
	}
	return page, pageSize
}
