package entity

import (
	"errors"
	"time"
)

// Mood represents the mood enum for diary entries
type Mood string

const (
	MoodHappy   Mood = "happy"
	MoodSad     Mood = "sad"
	MoodNeutral Mood = "neutral"
	MoodExcited Mood = "excited"
	MoodAnxious Mood = "anxious"
	MoodAngry   Mood = "angry"
	MoodCalm    Mood = "calm"
)

// ValidMoods contains all valid mood values
var ValidMoods = map[Mood]bool{
	MoodHappy:   true,
	MoodSad:     true,
	MoodNeutral: true,
	MoodExcited: true,
	MoodAnxious: true,
	MoodAngry:   true,
	MoodCalm:    true,
}

// Diary represents a diary/journal entry entity
type Diary struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index;not null"`
	Title     string    `json:"title" gorm:"size:200;not null"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	Mood      Mood      `json:"mood" gorm:"size:20"`
	Tags      string    `json:"tags" gorm:"size:500"`
	IsPrivate bool      `json:"is_private" gorm:"default:true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// TableName specifies the table name for GORM
func (Diary) TableName() string {
	return "diaries"
}

// Diary validation errors
var (
	ErrInvalidTitle   = errors.New("title must be between 1 and 200 characters")
	ErrInvalidContent = errors.New("content must not be empty")
	ErrInvalidMood    = errors.New("invalid mood value")
	ErrInvalidTags    = errors.New("tags must not exceed 500 characters")
)

// NewDiary is a Factory Method to create a new Diary entry with validation
func NewDiary(userID uint, title, content string, mood Mood, tags string, isPrivate bool) (*Diary, error) {
	if len(title) < 1 || len(title) > 200 {
		return nil, ErrInvalidTitle
	}

	if len(content) == 0 {
		return nil, ErrInvalidContent
	}

	if mood != "" && !ValidMoods[mood] {
		return nil, ErrInvalidMood
	}

	if len(tags) > 500 {
		return nil, ErrInvalidTags
	}

	if mood == "" {
		mood = MoodNeutral
	}

	return &Diary{
		UserID:    userID,
		Title:     title,
		Content:   content,
		Mood:      mood,
		Tags:      tags,
		IsPrivate: isPrivate,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}
