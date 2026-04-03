package config

import (
	"fmt"
	"sync"

	"github.com/spf13/viper"
)

// Config holds all application configuration (Singleton Pattern)
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Port string
	Mode string // debug, release, test
}

// DatabaseConfig holds MySQL connection configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

// JWTConfig holds JWT-related configuration
type JWTConfig struct {
	Secret     string
	ExpireHour int
	Issuer     string
}

var (
	configInstance *Config
	once           sync.Once
)

// GetConfig returns the singleton config instance (Singleton Pattern)
func GetConfig() *Config {
	once.Do(func() {
		configInstance = loadConfig()
	})
	return configInstance
}

// loadConfig loads configuration from environment variables or .env file
func loadConfig() *Config {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	// Set defaults
	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("SERVER_MODE", "debug")
	viper.SetDefault("DB_HOST", "127.0.0.1")
	viper.SetDefault("DB_PORT", "3306")
	viper.SetDefault("DB_USER", "root")
	viper.SetDefault("DB_PASSWORD", "")
	viper.SetDefault("DB_NAME", "diary_db")
	viper.SetDefault("JWT_SECRET", "your-secret-key-change-in-production")
	viper.SetDefault("JWT_EXPIRE_HOUR", 24)
	viper.SetDefault("JWT_ISSUER", "diary-management")

	// Read .env file (optional - won't error if not found)
	_ = viper.ReadInConfig()

	return &Config{
		Server: ServerConfig{
			Port: viper.GetString("SERVER_PORT"),
			Mode: viper.GetString("SERVER_MODE"),
		},
		Database: DatabaseConfig{
			Host:     viper.GetString("DB_HOST"),
			Port:     viper.GetString("DB_PORT"),
			User:     viper.GetString("DB_USER"),
			Password: viper.GetString("DB_PASSWORD"),
			DBName:   viper.GetString("DB_NAME"),
		},
		JWT: JWTConfig{
			Secret:     viper.GetString("JWT_SECRET"),
			ExpireHour: viper.GetInt("JWT_EXPIRE_HOUR"),
			Issuer:     viper.GetString("JWT_ISSUER"),
		},
	}
}

// DSN returns the MySQL connection string
func (c *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.User, c.Password, c.Host, c.Port, c.DBName,
	)
}
