package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/demo-diary/diary-management/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UploadHandler handles file uploads
type UploadHandler struct{}

// NewUploadHandler creates a new upload handler
func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// UploadImage handles image uploads
// @Summary Upload an image
// @Tags Upload
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param file formData file true "Image file"
// @Success 200 {object} response.Response
// @Router /api/v1/upload [post]
func (h *UploadHandler) UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "Vui lòng chọn file hợp lệ", err.Error())
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		response.BadRequest(c, "File quá lớn (tối đa 5MB)", nil)
		return
	}

	// Validate file type
	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" && ext != ".webp" {
		response.BadRequest(c, "Định dạng file không hỗ trợ", nil)
		return
	}

	// Ensure uploads directory exists
	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.Mkdir(uploadDir, 0755)
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s_%d%s", uuid.New().String()[:8], time.Now().Unix(), ext)
	filepath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, filepath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Lỗi khi lưu file", err.Error())
		return
	}

	// Return public URL
	publicURL := "/uploads/" + filename
	response.OK(c, "Tải ảnh lên thành công", gin.H{"url": publicURL})
}
