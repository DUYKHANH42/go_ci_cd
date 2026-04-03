import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { diaryService } from '../services/diary';

const DiaryModal = ({ isOpen, onClose, diaryToEdit, onSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: '',
    isPrivate: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate data if editing
  useEffect(() => {
    if (diaryToEdit) {
      setFormData({
        title: diaryToEdit.title || '',
        content: diaryToEdit.content || '',
        mood: diaryToEdit.mood || 'neutral',
        tags: diaryToEdit.tags || '',
        isPrivate: diaryToEdit.is_private === undefined ? true : diaryToEdit.is_private
      });
    } else {
      setFormData({
        title: '',
        content: '',
        mood: 'neutral',
        tags: '',
        isPrivate: true
      });
    }
  }, [diaryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (diaryToEdit) {
        await diaryService.update(diaryToEdit.id, {
          title: formData.title,
          content: formData.content,
          mood: formData.mood,
          tags: formData.tags,
          is_private: formData.isPrivate
        });
      } else {
        await diaryService.create(
          formData.title,
          formData.content,
          formData.mood,
          formData.isPrivate
        );
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhật ký');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="heading-md" style={{ marginBottom: 0 }}>
            {diaryToEdit ? 'Chỉnh sửa nhật ký' : 'Viết trang nhật ký mới'}
          </h2>
          <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-message mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tiêu đề</label>
            <input 
              type="text" 
              className="input-field" 
              name="title"
              placeholder="Hôm nay của bạn thế nào?" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nội dung</label>
            <textarea 
              className="input-field" 
              name="content"
              placeholder="Khởi đầu bằng một dòng suy tư..." 
              value={formData.content} 
              onChange={handleChange} 
              required
              style={{ minHeight: '180px', resize: 'vertical' }}
            />
          </div>
          
          <div className="flex gap-4 mb-4">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Tâm trạng</label>
              <select 
                className="input-field" 
                name="mood" 
                value={formData.mood} 
                onChange={handleChange}
              >
                <option value="happy">😄 Vui vẻ (Happy)</option>
                <option value="neutral">😐 Bình thường (Neutral)</option>
                <option value="sad">😢 Buồn (Sad)</option>
                <option value="angry">😠 Tức giận (Angry)</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-6">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="isPrivate" 
                checked={formData.isPrivate} 
                onChange={handleChange} 
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--accent-primary)' }}
              />
              <span className="text-subtle" style={{ fontWeight: 500 }}>Chế độ riêng tư (Chỉ mình tôi)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy bỏ</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <Save size={18} />
              {isLoading ? 'Đang lưu...' : 'Lưu nhật ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiaryModal;
