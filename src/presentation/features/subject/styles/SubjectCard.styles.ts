import { SxProps, Theme } from '@mui/material';

export const subjectCardStyles = {
  card: {
    mb: 2,
    border: '1px solid #EAEAEA',
    borderRadius: '3px',
    transition: 'all 0.2s',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    '&:hover': {
      borderColor: '#D1D1D1',
      backgroundColor: '#FAFAFA',
      transform: 'translateY(-1px)',
      boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px',
    },
  },
  cardContent: {
    p: '16px 20px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    mb: 1.5,
  },
  title: {
    fontWeight: 500,
    fontSize: '1rem',
    color: '#37352f',
    lineHeight: 1.3,
  },
  daysChip: (color: string) => ({
    backgroundColor: color,
    color: 'white',
    fontSize: '0.7rem',
    height: '20px',
    fontWeight: 500,
    ml: 1,
  }),
  divider: {
    my: 1.5,
    opacity: 0.6,
  },
  infoText: {
    display: 'flex',
    alignItems: 'center',
    color: '#6b6b6b',
  },
  icon: {
    fontSize: '0.9rem',
    mr: 1,
    opacity: 0.8,
  },
  progressBar: {
    mt: 2,
    width: '100%',
    height: '4px',
    backgroundColor: '#EAEAEA',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressIndicator: (color: string) => ({
    height: '100%',
    backgroundColor: color,
    transition: 'width 0.3s ease-in-out',
  }),
  buttonContainer: {
    mt: 2,
    display: 'flex',
    gap: 1,
  },
  quickProgressButton: {
    minWidth: 0,
    px: 1,
  },
} as const;
