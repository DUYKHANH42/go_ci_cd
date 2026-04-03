package usecase

import (
	"context"

	domainErrors "github.com/demo-diary/diary-management/internal/domain/errors"
	"github.com/demo-diary/diary-management/internal/domain/entity"
	domainRepo "github.com/demo-diary/diary-management/internal/domain/repository"
	"github.com/demo-diary/diary-management/internal/usecase/dto"
)

// DiaryUseCase defines the interface for diary business logic
type DiaryUseCase interface {
	Create(ctx context.Context, userID uint, req dto.CreateDiaryRequest) (*dto.DiaryResponse, error)
	Update(ctx context.Context, userID uint, diaryID uint, req dto.UpdateDiaryRequest) (*dto.DiaryResponse, error)
	Delete(ctx context.Context, userID uint, diaryID uint) error
	GetByID(ctx context.Context, userID uint, diaryID uint) (*dto.DiaryResponse, error)
	GetByUserID(ctx context.Context, userID uint, page, pageSize int) (*dto.DiaryListResponse, error)
	Search(ctx context.Context, userID uint, filter dto.DiaryFilterRequest) (*dto.DiaryListResponse, error)
}

// diaryUseCaseImpl implements DiaryUseCase
type diaryUseCaseImpl struct {
	diaryRepo domainRepo.DiaryRepository
}

// NewDiaryUseCase creates a new DiaryUseCase (Dependency Injection)
func NewDiaryUseCase(diaryRepo domainRepo.DiaryRepository) DiaryUseCase {
	return &diaryUseCaseImpl{
		diaryRepo: diaryRepo,
	}
}

// Create creates a new diary entry
func (uc *diaryUseCaseImpl) Create(ctx context.Context, userID uint, req dto.CreateDiaryRequest) (*dto.DiaryResponse, error) {
	isPrivate := true
	if req.IsPrivate != nil {
		isPrivate = *req.IsPrivate
	}

	// Use Factory Method to create entity with validation
	diary, err := entity.NewDiary(userID, req.Title, req.Content, req.Mood, req.Tags, isPrivate)
	if err != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrValidation, err.Error(), 400)
	}

	if err := uc.diaryRepo.Create(ctx, diary); err != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi khi tạo nhật ký", 500)
	}

	response := dto.ToDiaryResponse(diary)
	return &response, nil
}

// Update updates an existing diary entry
func (uc *diaryUseCaseImpl) Update(ctx context.Context, userID uint, diaryID uint, req dto.UpdateDiaryRequest) (*dto.DiaryResponse, error) {
	// Find the diary
	diary, err := uc.diaryRepo.FindByID(ctx, diaryID)
	if err != nil {
		if domainErrors.IsNotFound(err) {
			return nil, domainErrors.NewAppError(domainErrors.ErrNotFound, "Không tìm thấy nhật ký", 404)
		}
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi hệ thống", 500)
	}

	// Check ownership
	if diary.UserID != userID {
		return nil, domainErrors.NewAppError(domainErrors.ErrForbidden, "Bạn không có quyền chỉnh sửa nhật ký này", 403)
	}

	// Apply updates (partial update)
	if req.Title != nil {
		diary.Title = *req.Title
	}
	if req.Content != nil {
		diary.Content = *req.Content
	}
	if req.Mood != nil {
		if !entity.ValidMoods[*req.Mood] {
			return nil, domainErrors.NewAppError(domainErrors.ErrValidation, "Mood không hợp lệ", 400)
		}
		diary.Mood = *req.Mood
	}
	if req.Tags != nil {
		diary.Tags = *req.Tags
	}
	if req.IsPrivate != nil {
		diary.IsPrivate = *req.IsPrivate
	}

	if err := uc.diaryRepo.Update(ctx, diary); err != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi khi cập nhật nhật ký", 500)
	}

	response := dto.ToDiaryResponse(diary)
	return &response, nil
}

// Delete deletes a diary entry
func (uc *diaryUseCaseImpl) Delete(ctx context.Context, userID uint, diaryID uint) error {
	// Check ownership first
	diary, err := uc.diaryRepo.FindByID(ctx, diaryID)
	if err != nil {
		if domainErrors.IsNotFound(err) {
			return domainErrors.NewAppError(domainErrors.ErrNotFound, "Không tìm thấy nhật ký", 404)
		}
		return domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi hệ thống", 500)
	}

	if diary.UserID != userID {
		return domainErrors.NewAppError(domainErrors.ErrForbidden, "Bạn không có quyền xóa nhật ký này", 403)
	}

	if err := uc.diaryRepo.Delete(ctx, diaryID, userID); err != nil {
		return domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi khi xóa nhật ký", 500)
	}

	return nil
}

// GetByID gets a diary entry by ID
func (uc *diaryUseCaseImpl) GetByID(ctx context.Context, userID uint, diaryID uint) (*dto.DiaryResponse, error) {
	diary, err := uc.diaryRepo.FindByID(ctx, diaryID)
	if err != nil {
		if domainErrors.IsNotFound(err) {
			return nil, domainErrors.NewAppError(domainErrors.ErrNotFound, "Không tìm thấy nhật ký", 404)
		}
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi hệ thống", 500)
	}

	// Check ownership (private entries only visible to owner)
	if diary.UserID != userID && diary.IsPrivate {
		return nil, domainErrors.NewAppError(domainErrors.ErrForbidden, "Bạn không có quyền xem nhật ký này", 403)
	}

	response := dto.ToDiaryResponse(diary)
	return &response, nil
}

// GetByUserID gets all diary entries for a user with pagination
func (uc *diaryUseCaseImpl) GetByUserID(ctx context.Context, userID uint, page, pageSize int) (*dto.DiaryListResponse, error) {
	result, err := uc.diaryRepo.FindByUserID(ctx, userID, page, pageSize)
	if err != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi khi lấy danh sách nhật ký", 500)
	}

	response := dto.ToDiaryListResponse(result.Diaries, result.Total, result.Page, result.PageSize, result.TotalPages)
	return &response, nil
}

// Search searches diary entries with filters (Strategy Pattern - filter strategy applied in repository)
func (uc *diaryUseCaseImpl) Search(ctx context.Context, userID uint, filter dto.DiaryFilterRequest) (*dto.DiaryListResponse, error) {
	repoFilter := domainRepo.DiaryFilter{
		UserID:    userID,
		Keyword:   filter.Keyword,
		Mood:      entity.Mood(filter.Mood),
		Tags:      filter.Tags,
		StartDate: filter.StartDate,
		EndDate:   filter.EndDate,
		Page:      filter.Page,
		PageSize:  filter.PageSize,
	}

	result, err := uc.diaryRepo.Search(ctx, repoFilter)
	if err != nil {
		return nil, domainErrors.NewAppError(domainErrors.ErrInternal, "Lỗi khi tìm kiếm nhật ký", 500)
	}

	response := dto.ToDiaryListResponse(result.Diaries, result.Total, result.Page, result.PageSize, result.TotalPages)
	return &response, nil
}
