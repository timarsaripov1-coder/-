import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useSendAdminMessage } from '@/hooks/useApi';
import { Send, Bot, User, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MessageComposerProps {
  chatId: string;
  onSent?: () => void;
  className?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  chatId,
  onSent,
  className,
}) => {
  const [content, setContent] = useState('');
  const [asBot, setAsBot] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  const { mutate: sendMessage, isPending } = useSendAdminMessage();

  const handleSend = () => {
    if (!content.trim()) return;

    sendMessage(
      {
        chat_id: chatId,
        content: content.trim(),
        as_bot: asBot,
      },
      {
        onSuccess: () => {
          setContent('');
          setIsPreview(false);
          onSent?.();
        },
        onError: (error) => {
          console.error('Failed to send message:', error);
          // TODO: Show error toast
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isPreview) {
        setIsPreview(true);
      } else {
        handleSend();
      }
    }
    if (e.key === 'Escape') {
      setIsPreview(false);
    }
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium text-gray-900">Send Message</h3>
          
          {/* Sender Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAsBot(false)}
              className={cn(
                'flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                !asBot
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <User className="h-3 w-3" />
              <span>As Admin</span>
            </button>
            <button
              onClick={() => setAsBot(true)}
              className={cn(
                'flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                asBot
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Bot className="h-3 w-3" />
              <span>As Bot</span>
            </button>
          </div>
        </div>

        {isPreview && (
          <button
            onClick={() => setIsPreview(false)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Message Input */}
      <div>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
          rows={isPreview ? 2 : 4}
          placeholder={`Type your message as ${asBot ? 'Kirill GPT' : 'admin'}...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isPending}
        />
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
          <span>Press ⌘+Enter for preview, Enter in preview to send, Esc to cancel</span>
          <span>{content.length} characters</span>
        </div>
      </div>

      {/* Preview */}
      {isPreview && content.trim() && (
        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
          <div className={cn(
            'p-3 rounded-lg max-w-xl',
            asBot 
              ? 'bg-primary-50 border border-primary-100' 
              : 'bg-gray-50 border border-gray-200'
          )}>
            <div className="flex items-center space-x-2 text-sm mb-1">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-white text-xs',
                asBot ? 'bg-primary-600' : 'bg-gray-500'
              )}>
                {asBot ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
              </div>
              <span className={cn(
                'font-medium',
                asBot ? 'text-primary-700' : 'text-gray-700'
              )}>
                {asBot ? 'Kirill GPT' : 'Admin'}
              </span>
            </div>
            <p className="text-gray-900 whitespace-pre-wrap break-words">
              {content.trim()}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {isPreview ? 'Review your message before sending' : 'Compose your message'}
        </div>
        
        <div className="flex items-center space-x-2">
          {!isPreview ? (
            <Button
              onClick={() => setIsPreview(true)}
              variant="secondary"
              size="sm"
              disabled={!content.trim() || isPending}
            >
              Preview
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              size="sm"
              disabled={!content.trim() || isPending}
              loading={isPending}
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};