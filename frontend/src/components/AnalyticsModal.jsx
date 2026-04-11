import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { diaryService } from '../services/diary';

const MOOD_COLORS = {
  happy: '#8ebf90', // Muted green
  neutral: '#c9c2b3', // Muted beige/gray
  sad: '#88a4c4', // Muted blue
  excited: '#e3b474', // Muted orange/gold
  anxious: '#d18671', // Muted terracotta
  angry: '#c46666', // Muted red
  calm: '#8ecfb9' // Muted teal
};

const MOOD_LABELS = {
  happy: 'Vui vẻ',
  neutral: 'Bình thường',
  sad: 'Buồn',
  excited: 'Hào hứng',
  anxious: 'Lo âu',
  angry: 'Giận dữ',
  calm: 'Điềm tĩnh'
};

const AnalyticsModal = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await diaryService.getStatistics();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = stats?.mood_distribution
    ? Object.entries(stats.mood_distribution).map(([mood, count]) => ({
        name: MOOD_LABELS[mood] || mood,
        mood: mood,
        count: count
      })).sort((a, b) => b.count - a.count)
    : [];

  const maxCount = chartData.length > 0 ? Math.max(...chartData.map(d => d.count)) : 0;

  return (
    <div className="ks-modal" onClick={onClose}>
      <div 
        className="ks-vintage-paper" 
        onClick={e => e.stopPropagation()}
      >
        <button className="ks-icon-btn ks-vintage-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Băng keo dán (washi tape) */}
        <div className="ks-washi-tape ks-washi-tape--top"></div>

        <h2 className="ks-vintage-title">Nhìn Lại Cảm Xúc</h2>

        {isLoading ? (
          <div className="ks-vintage-loading">Chờ một lát mực chưa ráo...</div>
        ) : (
          <div className="ks-vintage-content">
            <div className="ks-vintage-summary">
              <span className="ks-vintage-number">{stats?.total_entries || 0}</span>
              <span className="ks-vintage-text">Trang nhật ký đã lưu giữ</span>
            </div>

            {chartData.length > 0 ? (
              <div className="ks-vintage-bars">
                {chartData.map((entry, index) => (
                  <div key={index} className="ks-vintage-bar-row">
                    <span className="ks-vintage-bar-label">{entry.name}</span>
                    <div className="ks-vintage-bar-track">
                      <div 
                        className="ks-vintage-bar-fill" 
                        style={{ 
                          width: `${(entry.count / maxCount) * 100}%`,
                          backgroundColor: MOOD_COLORS[entry.mood] || '#ccc'
                        }}
                      ></div>
                    </div>
                    <span className="ks-vintage-bar-value">{entry.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ks-vintage-empty">
                Chưa có nét mực nào được ghi lại.
              </div>
            )}
            
            <div className="ks-vintage-footer">
              - Thống kê sinh động của The Keepsake -
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsModal;
