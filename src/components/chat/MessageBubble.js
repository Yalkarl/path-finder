'use client';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MrPath } from '@/components/ui/mr-path';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '1rem',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Avatar */}
      <Avatar>
        {!isUser ? (
          <MrPath size={40} showBg={false} />
        ) : (
          <AvatarFallback style={{
            background: 'var(--primary)',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 'bold',
          }}>
            👤
          </AvatarFallback>
        )}
      </Avatar>

      {/* Bubble */}
      <div style={{
        background: isUser ? 'var(--primary-bg)' : 'var(--surface)',
        padding: '1rem 1.25rem',
        borderRadius: '16px',
        borderTopRightRadius: isUser ? '4px' : '16px',
        borderTopLeftRadius: !isUser ? '4px' : '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        maxWidth: '80%',
        color: 'var(--text-primary)',
        lineHeight: '1.6'
      }}>
        <ReactMarkdown
          components={{
            p: ({node, ...props}) => <p style={{ margin: '0 0 0.5rem 0' }} {...props} />,
            h3: ({node, ...props}) => <h3 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--primary)' }} {...props} />,
            ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }} {...props} />,
            li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
