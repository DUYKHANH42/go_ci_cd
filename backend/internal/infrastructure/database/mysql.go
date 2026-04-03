package database

import (
	"fmt"
	"log"
	"sync"

	"github.com/demo-diary/diary-management/internal/domain/entity"
	"github.com/demo-diary/diary-management/internal/infrastructure/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	dbInstance *gorm.DB
	dbOnce     sync.Once
)

// GetDB returns the singleton database instance (Singleton Pattern)
func GetDB(cfg *config.DatabaseConfig) *gorm.DB {
	dbOnce.Do(func() {
		var err error
		dbInstance, err = connectDB(cfg)
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}

		// Auto migrate
		if err := autoMigrate(dbInstance); err != nil {
			log.Fatalf("Failed to auto migrate: %v", err)
		}
	})
	return dbInstance
}

// connectDB establishes a connection to MySQL
func connectDB(cfg *config.DatabaseConfig) (*gorm.DB, error) {
	dsn := cfg.DSN()

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// Connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	log.Println("✅ Database connected successfully (MySQL)")
	return db, nil
}

// autoMigrate runs auto migration for all entities
func autoMigrate(db *gorm.DB) error {
	err := db.AutoMigrate(
		&entity.User{},
		&entity.Diary{},
	)
	if err != nil {
		return fmt.Errorf("auto migration failed: %w", err)
	}
	log.Println("✅ Database migration completed")
	return nil
}

// CloseDB closes the database connection
func CloseDB(db *gorm.DB) {
	sqlDB, err := db.DB()
	if err != nil {
		log.Printf("Error getting sql.DB: %v", err)
		return
	}
	if err := sqlDB.Close(); err != nil {
		log.Printf("Error closing database: %v", err)
	}
}
