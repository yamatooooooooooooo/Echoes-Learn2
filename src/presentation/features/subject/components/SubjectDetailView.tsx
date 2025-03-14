import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  LinearProgress,
  Typography
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Subject } from '../../../../domain/models/SubjectModel';
import { ProgressFormData } from '../../../../domain/models/ProgressModel';
import { ProgressForm } from './ProgressForm';
import { isSubjectCompleted, getProgressStatusText } from '../utils/subjectUtils';

// 科目の詳細情報を表示するセクション
const SubjectInfoSection = ({ subject, formatDate }: { subject: Subject, formatDate: (date: Date) => string }) => {
  const isCompleted = isSubjectCompleted(subject);
  const progressStatus = getProgressStatusText(subject);
  const progressPercent = Math.round((subject.currentPage / subject.totalPages) * 100);

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        {/* 進捗状況バッジ */}
        {isCompleted && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Chip
              label="完了"
              color="success"
              icon={<CheckCircleIcon />}
              sx={{ fontWeight: 'bold', px: 1 }}
            />
          </Box>
        )}
        
        {/* 進捗バー */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              進捗状況: {progressStatus}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {progressPercent}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercent} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'background.paper',
              '& .MuiLinearProgress-bar': {
                bgcolor: isCompleted ? 'success.main' : 'primary.main'
              }
            }} 
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {subject.currentPage} / {subject.totalPages} ページ
          </Typography>
        </Box>

        {/* 科目情報 */}
        <Grid container spacing={2}>
          {subject.examDate && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                試験日
              </Typography>
              <Typography variant="body1">
                {formatDate(subject.examDate)}
              </Typography>
            </Grid>
          )}
          
          {subject.textbookName && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                教科書
              </Typography>
              <Typography variant="body1">
                {subject.textbookName}
              </Typography>
            </Grid>
          )}
          
          {subject.reportDeadline && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                レポート提出期限
              </Typography>
              <Typography variant="body1">
                {formatDate(subject.reportDeadline)}
              </Typography>
            </Grid>
          )}
          
          {subject.importance && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                重要度
              </Typography>
              <Typography variant="body1">
                {subject.importance === 'high' ? '高' : 
                 subject.importance === 'medium' ? '中' : '低'}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

// 進捗記録フォームを表示するセクション
const ProgressFormSection = ({ subject, onRecordProgress }: { subject: Subject, onRecordProgress: (data: ProgressFormData) => Promise<void> }) => {
  const isCompleted = isSubjectCompleted(subject);
  
  if (isCompleted) {
    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              おめでとうございます！
            </Typography>
            <Typography variant="body1" color="text.secondary">
              この科目は学習完了しました。
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader 
        title="進捗を記録" 
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        <ProgressForm 
          subject={subject}
          onSubmit={onRecordProgress}
        />
      </CardContent>
    </Card>
  );
};

// 科目詳細ビューコンポーネント
interface SubjectDetailViewProps {
  subject: Subject;
  onRecordProgress: (data: ProgressFormData) => Promise<void>;
  formatDate: (date: Date) => string;
}

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
  subject,
  onRecordProgress,
  formatDate
}) => {
  return (
    <Box>
      <SubjectInfoSection subject={subject} formatDate={formatDate} />
      <ProgressFormSection subject={subject} onRecordProgress={onRecordProgress} />
    </Box>
  );
}; 