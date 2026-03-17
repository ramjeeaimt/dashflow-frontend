// TaskComments.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

const TaskComments = ({ comments = [], onAddComment, taskId }) => {
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && attachments.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onAddComment(newComment, attachments);
      setNewComment('');
      setAttachments([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-foreground">Comments ({comments.length})</h3>
      </div>

      {/* Comments List */}
      <div className="max-h-[300px] overflow-y-auto p-4 space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.user?.avatar || `https://i.pravatar.cc/32?u=${comment.userId}`}
                alt={comment.user?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-foreground">
                      {comment.user?.name || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                  
                  {/* Attachments */}
                  {comment.attachments?.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {comment.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-background rounded px-2 py-1">
                          <Icon name="Paperclip" size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Icon name="MessageSquare" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to comment</p>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="file"
            id="file-upload"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconName="Paperclip"
            onClick={() => document.getElementById('file-upload').click()}
          />
          <Button
            type="submit"
            size="sm"
            iconName="Send"
            disabled={isSubmitting || (!newComment.trim() && attachments.length === 0)}
          >
            Send
          </Button>
        </div>
        
        {/* Attachment preview */}
        {attachments.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-muted rounded px-2 py-1">
                <Icon name="File" size={12} />
                <span className="text-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskComments;