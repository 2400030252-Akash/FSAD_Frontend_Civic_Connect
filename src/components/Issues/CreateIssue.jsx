import React, { useState } from 'react';
import { ArrowLeft, MapPin, Upload, AlertCircle, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';
import { useNotifications } from '../../context/NotificationContext';
import { categories } from '../../data/mockData';

const CreateIssue = ({ onCancel }) => {
  const { user } = useAuth();
  const { addIssue } = useIssues();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    tags: [],
    // 👇 we store BASE64 strings here, not File objects
    attachments: [],
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 Convert selected files to base64 and store them in attachments[]
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB

    files.forEach((file) => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is larger than 10MB and will be skipped.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result; // "data:image/png;base64,...."
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, base64],
        }));
      };
      reader.readAsDataURL(file);
    });

    // allow selecting same file again later
    e.target.value = '';
  };

  const removeAttachment = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user) {
      alert('Please log in to submit an issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // we already have base64 strings in attachments, so just pass them
      addIssue({
        ...formData,
        status: 'submitted',
        citizenId: user.id,
        citizenName: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      addNotification({
        userId: user.id,
        title: 'Issue Submitted Successfully',
        message: `Your issue "${formData.title}" has been submitted and is awaiting review.`,
        type: 'success',
        read: false,
      });

      onCancel();
    } catch (error) {
      console.error('Error submitting issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-600 mt-1">
            Describe the issue you'd like your representatives to address
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`input-field ${
                errors.title ? 'border-red-300 focus:border-red-500' : ''
              }`}
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.title}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.title.length}/200 characters
              </p>
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className={`input-field ${
                  errors.category ? 'border-red-300 focus:border-red-500' : ''
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">-
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="input-field"
              >
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Moderate impact</option>
                <option value="high">High - Significant impact</option>
                <option value="urgent">Urgent - Immediate attention needed</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <div className="relative">
              <MapPin
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="input-field pl-10"
                maxLength={100}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="input-field flex-1"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim() || formData.tags.length >= 5}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-primary-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              rows={8}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`input-field resize-none ${
                errors.description ? 'border-red-300 focus:border-red-500' : ''
              }`}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.description.length}/2000 characters (minimum 20 required)
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('imageUpload').click()}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-gray-500 mb-4">
                PNG, JPG up to 10MB each
              </p>
            </div>

            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Preview */}
            {formData.attachments.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.attachments.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={src}
                      alt="Attachment preview"
                      className="h-32 w-full object-cover rounded-lg shadow"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips & Actions (unchanged) */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h4 className="font-semibold text-primary-900 mb-3 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              Tips for effective issue reporting
            </h4>
            <ul className="text-sm text-primary-800 space-y-2">
              <li>Be specific about the problem and impact</li>
              <li>Include dates, times, and locations</li>
              <li>Suggest solutions if you have ideas</li>
              <li>Use respectful language</li>
              <li>Add relevant tags</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-32"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssue;
