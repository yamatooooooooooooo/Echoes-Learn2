import React, { ReactNode } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  SxProps, 
  Theme 
} from '@mui/material';
import { OutlinedIcon } from './OutlinedIcon';
import { SvgIconComponent } from '@mui/icons-material';

interface ContentSectionProps {
  title?: string;
  subtitle?: string;
  icon?: SvgIconComponent;
  iconColor?: string;
  children: ReactNode;
  importance?: 'primary' | 'secondary' | 'tertiary';
  divided?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * 情報の視覚的階層を表現するコンテンツセクション
 * 重要度に応じて異なるスタイルを適用します
 */
export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  children,
  importance = 'primary',
  divided = false,
  sx = {}
}) => {
  // 重要度に応じたスタイルを取得
  const getImportanceStyles = () => {
    switch (importance) {
      case 'primary':
        return {
          padding: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        };
      case 'secondary':
        return {
          padding: 2,
          backgroundColor: 'background.default',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
        };
      case 'tertiary':
        return {
          padding: 1.5,
          borderLeft: '2px solid',
          borderColor: 'divider',
          pl: 2,
        };
      default:
        return {};
    }
  };

  return (
    <Box
      sx={{
        mb: 3,
        ...getImportanceStyles(),
        ...sx
      }}
    >
      {title && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          {icon && (
            <Box sx={{ mr: 1.5 }}>
              <OutlinedIcon 
                icon={icon} 
                size={importance === 'primary' ? 'medium' : 'small'} 
                color={iconColor}
                active={importance === 'primary'}
              />
            </Box>
          )}
          <Box>
            <Typography 
              variant={importance === 'primary' ? 'h6' : 'subtitle1'} 
              sx={{ 
                fontWeight: importance === 'tertiary' ? 400 : 500,
                color: importance === 'tertiary' ? 'text.secondary' : 'text.primary'
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 0.5, opacity: 0.8 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      
      {divided && <Divider sx={{ my: 2 }} />}
      
      <Box sx={{ 
        opacity: importance === 'primary' ? 1 : importance === 'secondary' ? 0.9 : 0.8
      }}>
        {children}
      </Box>
    </Box>
  );
};

interface DataDisplayProps {
  label: string;
  value: ReactNode;
  icon?: SvgIconComponent;
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  importance?: 'primary' | 'secondary' | 'tertiary';
  sx?: SxProps<Theme>;
}

/**
 * ラベルと値を視覚的に区別して表示するコンポーネント
 */
export const DataDisplay: React.FC<DataDisplayProps> = ({
  label,
  value,
  icon,
  size = 'medium',
  orientation = 'horizontal',
  importance = 'primary',
  sx = {}
}) => {
  // サイズに応じたスタイルを取得
  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return {
          labelVariant: 'subtitle1' as const,
          valueVariant: 'h5' as const,
          spacing: 1,
        };
      case 'small':
        return {
          labelVariant: 'caption' as const,
          valueVariant: 'body2' as const,
          spacing: 0.5,
        };
      case 'medium':
      default:
        return {
          labelVariant: 'body2' as const,
          valueVariant: 'subtitle1' as const,
          spacing: 0.75,
        };
    }
  };

  const { labelVariant, valueVariant, spacing } = getSizeStyles();
  
  const isVertical = orientation === 'vertical';
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: isVertical ? 'flex-start' : 'center',
        ...sx
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: isVertical ? spacing : 0,
        mr: isVertical ? 0 : 2,
        opacity: importance === 'primary' ? 0.9 : importance === 'secondary' ? 0.8 : 0.7,
      }}>
        {icon && (
          <Box sx={{ mr: 0.75 }}>
            <OutlinedIcon 
              icon={icon} 
              size="small" 
              sx={{ opacity: 0.8 }}
            />
          </Box>
        )}
        <Typography
          variant={labelVariant}
          className="label-text"
          sx={{ 
            color: 'text.secondary',
          }}
        >
          {label}
        </Typography>
      </Box>
      
      <Typography
        variant={valueVariant}
        sx={{ 
          fontWeight: importance === 'primary' ? 500 : 400,
          color: importance === 'primary' ? 'text.primary' : 'text.secondary',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

interface InfoSectionProps {
  title?: string;
  children: ReactNode;
  icon?: SvgIconComponent;
  importance?: 'primary' | 'secondary' | 'tertiary';
  bordered?: boolean;
  background?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * 情報を整理してセクション表示するコンポーネント
 */
export const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  children,
  icon,
  importance = 'primary',
  bordered = false,
  background = false,
  sx = {}
}) => {
  // 重要度に応じたスタイルを取得
  const getStyles = () => {
    const base = {
      mb: 3,
      borderRadius: importance === 'primary' ? 2 : importance === 'secondary' ? 1.5 : 1,
      padding: importance === 'primary' ? 2.5 : importance === 'secondary' ? 2 : 1.5,
    };

    if (bordered) {
      return {
        ...base,
        border: '1px solid',
        borderColor: 'divider',
        ...(importance === 'tertiary' && {
          borderLeft: '2px solid',
          borderLeftColor: 'primary.main',
        }),
      };
    }

    if (background) {
      return {
        ...base,
        backgroundColor: importance === 'primary' 
          ? 'background.paper' 
          : importance === 'secondary'
            ? 'rgba(0, 0, 0, 0.02)'
            : 'transparent',
      };
    }

    return base;
  };

  return (
    <Box
      sx={{
        ...getStyles(),
        ...sx
      }}
    >
      {title && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            pb: 1,
            borderBottom: bordered ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {icon && (
            <Box sx={{ mr: 1 }}>
              <OutlinedIcon 
                icon={icon} 
                size="small" 
                active={importance === 'primary'} 
              />
            </Box>
          )}
          <Typography 
            variant={
              importance === 'primary' 
                ? 'subtitle1' 
                : importance === 'secondary' 
                  ? 'subtitle2' 
                  : 'body2'
            }
            sx={{ 
              fontWeight: 500,
              color: importance === 'tertiary' ? 'text.secondary' : 'text.primary',
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      
      <Box>
        {children}
      </Box>
    </Box>
  );
}; 