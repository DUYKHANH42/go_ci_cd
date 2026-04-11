package router

import (
	"github.com/demo-diary/diary-management/internal/delivery/http/handler"
	"github.com/demo-diary/diary-management/internal/delivery/http/middleware"
	"github.com/demo-diary/diary-management/internal/infrastructure/auth"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures all routes for the application
func SetupRouter(
	engine *gin.Engine,
	jwtManager *auth.JWTManager,
	userHandler *handler.UserHandler,
	diaryHandler *handler.DiaryHandler,
	uploadHandler *handler.UploadHandler,
) {
	// Static route for serving uploaded images
	engine.Static("/uploads", "./uploads")

	// Global middleware
	engine.Use(middleware.CORSMiddleware())
	engine.Use(middleware.LoggerMiddleware())
	engine.Use(gin.Recovery())

	// Health check
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "diary-management",
		})
	})

	// API v1 routes
	v1 := engine.Group("/api/v1")
	{
		// Auth routes (public)
		authGroup := v1.Group("/auth")
		{
			authGroup.POST("/register", userHandler.Register)
			authGroup.POST("/login", userHandler.Login)

			// Protected auth routes
			authProtected := authGroup.Group("")
			authProtected.Use(middleware.AuthMiddleware(jwtManager))
			{
				authProtected.GET("/profile", userHandler.GetProfile)
			}
		}

		// Diary routes (protected)
		diaryGroup := v1.Group("/diaries")
		diaryGroup.Use(middleware.AuthMiddleware(jwtManager))
		{
			diaryGroup.POST("", diaryHandler.Create)
			diaryGroup.GET("", diaryHandler.GetAll)
			diaryGroup.GET("/search", diaryHandler.Search)
			diaryGroup.GET("/statistics", diaryHandler.GetStatistics)
			diaryGroup.GET("/:id", diaryHandler.GetByID)
			diaryGroup.PUT("/:id", diaryHandler.Update)
			diaryGroup.DELETE("/:id", diaryHandler.Delete)
		}

		// Upload routes (protected)
		uploadGroup := v1.Group("/upload")
		uploadGroup.Use(middleware.AuthMiddleware(jwtManager))
		{
			uploadGroup.POST("", uploadHandler.UploadImage)
		}
	}
}
