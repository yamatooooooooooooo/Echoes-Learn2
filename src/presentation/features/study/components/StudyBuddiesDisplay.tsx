import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Chip, 
  Tooltip, 
  AvatarGroup,
  Divider
} from '@mui/material';
import { 
  People as PeopleIcon, 
  EmojiEvents as TrophyIcon 
} from '@mui/icons-material';

interface StudyBuddy {
  id: string;
  name: string;
  avatar?: string;
  streak?: number;
  lastActive?: string;
  currentPage?: number;
}

interface StudyBuddiesDisplayProps {
  buddies: StudyBuddy[];
}

/**
 * 同時に学習中のユーザーを表示するコンポーネント
 */
const StudyBuddiesDisplay: React.FC<StudyBuddiesDisplayProps> = ({ buddies = [] }) => {
  if (buddies.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">一緒に学習中</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          現在、同じ内容を学習しているユーザーはいません。
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">一緒に学習中</Typography>
        <Chip 
          label={`${buddies.length}人`} 
          size="small" 
          color="primary" 
          sx={{ ml: 1 }} 
        />
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <AvatarGroup max={5} sx={{ mb: 2, justifyContent: 'center' }}>
        {buddies.map(buddy => (
          <Tooltip 
            key={buddy.id} 
            title={`${buddy.name}${buddy.streak ? ` (連続学習: ${buddy.streak}日)` : ''}`}
          >
            <Avatar 
              alt={buddy.name} 
              src={buddy.avatar} 
              sx={{ 
                bgcolor: !buddy.avatar ? `hsl(${buddy.name.charCodeAt(0) * 10}, 70%, 50%)` : undefined 
              }}
            >
              {!buddy.avatar && buddy.name.charAt(0)}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
      
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          トップの学習者
        </Typography>
        
        {buddies
          .filter(b => b.streak && b.streak > 0)
          .sort((a, b) => (b.streak || 0) - (a.streak || 0))
          .slice(0, 3)
          .map(buddy => (
            <Box 
              key={buddy.id}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1
              }}
            >
              <Avatar 
                alt={buddy.name} 
                src={buddy.avatar}
                sx={{ 
                  width: 24, 
                  height: 24,
                  mr: 1,
                  bgcolor: !buddy.avatar ? `hsl(${buddy.name.charCodeAt(0) * 10}, 70%, 50%)` : undefined 
                }}
              >
                {!buddy.avatar && buddy.name.charAt(0)}
              </Avatar>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {buddy.name}
              </Typography>
              <Chip
                icon={<TrophyIcon />}
                label={`${buddy.streak}日連続`}
                size="small"
                color={
                  (buddy.streak || 0) >= 30 ? 'success' :
                  (buddy.streak || 0) >= 7 ? 'primary' : 'default'
                }
                variant="outlined"
              />
            </Box>
          ))}
      </Box>
    </Paper>
  );
};

export default StudyBuddiesDisplay; 