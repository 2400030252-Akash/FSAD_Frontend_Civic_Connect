import React, { useState } from 'react';
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  MapPin,
  Calendar,
  User,
  Send,
  Flag,
  CreditCard as Edit,
  Trash2,
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitial } from '../../utils/string';
import { useIssues } from '../../context/IssueContext';
import { useNotifications } from '../../context/NotificationContext';

const IssueDetail = ({ issue, onBack }) => {
  const { user } = useAuth();
  const { updateIssue, addResponse, upvoteIssue, deleteIssue } = useIssues();
  const { addNotification } = useNotifications();
  const [newResponse, setNewResponse] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleUpvote = () => {
    if (!user) {
      alert('Please log in to vote.');
      return;
    }

    upvoteIssue(issue.id);

    if (user?.id !== issue.citizenId) {
      addNotification({
        userId: issue.citizenId,
        title: 'Issue Upvoted',
        message: `${user?.name || 'Someone'} upvoted your issue "${issue.title}"`,
        type: 'info',
        read: false,
        relatedIssueId: issue.id,
      });
    }
  };

  const handleSubmitResponse = async () => {
    if (!newResponse.trim()) return;
    if (!user) {
      alert('Please log in to submit a response.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      addResponse(issue.id, {
        issueId: issue.id,
        userId: user.id,
        userName: user.name || 'Anonymous',
        userRole: user.role || 'citizen',
        content: newResponse,
      });

      if (user?.id !== issue.citizenId) {
        addNotification({
          userId: issue.citizenId,
          title: 'New Response',
          message: `${user?.name || 'Someone'} responded to your issue "${issue.title}"`,
          type: 'success',
          read: false,
          relatedIssueId: issue.id,
        });
      }

      setNewResponse('');
      setShowResponseForm(false);
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    updateIssue(issue.id, { status: newStatus });

    addNotification({
      userId: issue.citizenId,
      title: 'Issue Status Updated',
      message: `Your issue "${issue.title}" status changed to ${newStatus.replace('_', ' ')}`,
      type: 'info',
      read: false,
      relatedIssueId: issue.id,
    });
  };

  const handleDeleteIssue = () => {
    if (window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      deleteIssue(issue.id);
      onBack();
    }
  };

  const canChangeStatus =
    user?.role === 'politician' || user?.role === 'admin' || user?.role === 'moderator';
  const canRespond = user?.role !== 'citizen' || user?.id === issue.citizenId;
  const canDelete = user?.role === 'admin' || user?.id === issue.citizenId;
  const canEdit = user?.id === issue.citizenId && issue.status === 'submitted';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{issue.title}</h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <User size={16} className="mr-2" />
                  {issue.citizenName}
                </span>
                <span className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {formatDate(issue.createdAt)}
                </span>
                {issue.location && (
                  <span className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    {issue.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`status-badge status-${issue.status} text-sm px-3 py-1`}>
                {issue.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`text-sm font-semibold uppercase px-3 py-1 rounded-full priority-${issue.priority} bg-opacity-10`}>
                {issue.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Issue Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Issue Description</h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {issue.category}
                </span>
                {issue.tags && issue.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary-50 text-primary-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {issue.description}
              </p>
            </div>

            {/* 🔥 Attachments show here */}
            {issue.attachments && issue.attachments.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {issue.attachments.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt="Issue Attachment"
                    className="w-full h-48 object-cover rounded-lg shadow"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Responses (unchanged) */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Responses ({issue.responses.length})
              </h3>
              {canRespond && (
                <button
                  onClick={() => setShowResponseForm(!showResponseForm)}
                  className="btn-primary"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Add Response
                </button>
              )}
            </div>

            {showResponseForm && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Write your response..."
                  className="input-field resize-none"
                  rows={6}
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-500">
                    {newResponse.length}/1000 characters
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowResponseForm(false)}
                      disabled={isSubmitting}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitResponse}
                      disabled={!newResponse.trim() || isSubmitting}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Submit Response
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {issue.responses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h4>
                  <p>Be the first to respond to this issue!</p>
                </div>
              ) : (
                issue.responses.map((response) => (
                  <div key={response.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                          {getInitial(response.userName)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{response.userName}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="capitalize">{response.userRole}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(response.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {response.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (unchanged) */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleUpvote}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200 font-medium"
              >
                <ThumbsUp size={18} />
                Upvote ({issue.upvotes})
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 font-medium">
                <Share2 size={18} />
                Share Issue
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200 font-medium">
                <Flag size={18} />
                Report Issue
              </button>
              {canEdit && (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 font-medium">
                  <Edit size={18} />
                  Edit Issue
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDeleteIssue}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200 font-medium"
                >
                  <Trash2 size={18} />
                  Delete Issue
                </button>
              )}
            </div>
          </div>

          {canChangeStatus && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Status</h3>
              <div className="space-y-2">
                {['submitted', 'under_review', 'in_progress', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                      issue.status === status
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Category:</span>
                <span className="font-semibold">{issue.category}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Priority:</span>
                <span className={`font-semibold capitalize priority-${issue.priority}`}>
                  {issue.priority}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className="font-semibold">{issue.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Created:</span>
                <span className="font-semibold">{formatDate(issue.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="font-semibold">{formatDate(issue.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Upvotes:</span>
                <span className="font-semibold">{issue.upvotes}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 font-medium">Responses:</span>
                <span className="font-semibold">{issue.responses.length}</span>
              </div>
              {issue.assignedPolitician && (
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Assigned to:</span>
                  <span className="font-semibold text-primary-600">Representative</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
