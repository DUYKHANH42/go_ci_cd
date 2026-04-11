import React from 'react';
import { Search, Calendar, Tag, Layers } from 'lucide-react';

const moods = [
  { value: '', label: 'Tất cả' },
  { value: 'happy', label: '😄 Hạnh phúc' },
  { value: 'neutral', label: '😐 Trung tính' },
  { value: 'sad', label: '😢 Buồn' },
  { value: 'angry', label: '😠 Giận dữ' },
];

const FilterPanel = ({ filter, setFilter }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilter = { ...filter, [name]: value };
    setFilter(newFilter);
  };

  return (
    <div className="ks-filter-bar">
      <div className="ks-filter-group">
        <Search size={14} className="ks-filter-icon" />
        <input
          type="text"
          name="keyword"
          placeholder="Tìm kiếm..."
          value={filter.keyword || ''}
          onChange={handleChange}
          className="ks-filter-input"
        />
      </div>

      <div className="ks-filter-divider" />

      <div className="ks-filter-group">
        <select name="mood" value={filter.mood || ''} onChange={handleChange} className="ks-filter-select">
          {moods.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ks-filter-divider" />

      <div className="ks-filter-group">
        <Tag size={14} className="ks-filter-icon" />
        <input
          type="text"
          name="tags"
          placeholder="Thẻ (cách nhau bằng thẻ)..."
          value={filter.tags || ''}
          onChange={handleChange}
          className="ks-filter-input"
        />
      </div>

      <div className="ks-filter-divider" />

      <div className="ks-filter-group">
        <Calendar size={14} className="ks-filter-icon" />
        <input
          type="date"
          name="startDate"
          value={filter.startDate || ''}
          onChange={handleChange}
          className="ks-filter-input ks-date-input"
        />
        <span style={{ color: '#aaa', margin: '0 4px' }}>→</span>
        <input
          type="date"
          name="endDate"
          value={filter.endDate || ''}
          onChange={handleChange}
          className="ks-filter-input ks-date-input"
        />
      </div>

      <div className="ks-filter-divider" />

      <div className="ks-filter-group">
        <Layers size={14} className="ks-filter-icon" />
        <select
          name="pageSize"
          value={filter.pageSize || 10}
          onChange={handleChange}
          className="ks-filter-select"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / trang
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
