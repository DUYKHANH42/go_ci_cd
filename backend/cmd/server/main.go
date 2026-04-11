package main

import (
	"fmt"
	"log"

	"github.com/demo-diary/diary-management/internal/delivery/http/handler"
	"github.com/demo-diary/diary-management/internal/delivery/http/router"
	"github.com/demo-diary/diary-management/internal/infrastructure/auth"
	"github.com/demo-diary/diary-management/internal/infrastructure/config"
	"github.com/demo-diary/diary-management/internal/infrastructure/database"
	repoImpl "github.com/demo-diary/diary-management/internal/repository"
	"github.com/demo-diary/diary-management/internal/usecase"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration (Singleton)
	cfg := config.GetConfig()

	// Set Gin mode
	gin.SetMode(cfg.Server.Mode)

	// Initialize database (Singleton)
	db := database.GetDB(&cfg.Database)
	defer database.CloseDB(db)

	// Initialize JWT manager
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret, cfg.JWT.Issuer, cfg.JWT.ExpireHour)

	// Initialize repositories (Dependency Injection)
	userRepo := repoImpl.NewUserRepository(db)
	diaryRepo := repoImpl.NewDiaryRepository(db)

	// Initialize use cases (Dependency Injection)
	userUseCase := usecase.NewUserUseCase(userRepo, jwtManager)
	diaryUseCase := usecase.NewDiaryUseCase(diaryRepo)

	// Initialize handlers (Dependency Injection)
	userHandler := handler.NewUserHandler(userUseCase)
	diaryHandler := handler.NewDiaryHandler(diaryUseCase)
	uploadHandler := handler.NewUploadHandler()

	// Setup router
	engine := gin.New()
	router.SetupRouter(engine, jwtManager, userHandler, diaryHandler, uploadHandler)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("🚀 Server starting on port %s", cfg.Server.Port)
	log.Printf("📝 Diary Management API - Clean Architecture")
	log.Printf("📖 API docs: http://localhost:%s/health", cfg.Server.Port)

	if err := engine.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
