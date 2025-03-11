import React, { useState, useEffect } from 'react';
import './styles/App.css';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container,
  Box,
  Paper,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './index';

// シンプルなテーマを作成
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#08A29E',
    },
    secondary: {
      main: '#F2994A',
    },
  },
});

function App() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // コンポーネントがマウントされたら科目リストを取得
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Firestoreから科目リストを取得する関数
  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const subjectsRef = collection(db, 'subjects');
      const snapshot = await getDocs(subjectsRef);
      const subjectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubjects(subjectsList);
    } catch (error) {
      console.error('科目リストの取得中にエラーが発生しました:', error);
      setError('データの取得中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // 日付のフォーマットを行う関数
  const formatDate = (dateString) => {
    if (!dateString) return '未設定';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}年${month}月${day}日`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Echoes Learn
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2">
                科目一覧
              </Typography>
            </Box>

            {error ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            ) : isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : subjects.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  登録されている科目はありません
                </Typography>
              </Box>
            ) : (
              <Box>
                {subjects.map((subject) => (
                  <Card key={subject.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{subject?.name || 'タイトルなし'}</Typography>
                      <Typography variant="body2">試験日: {formatDate(subject?.examDate)}</Typography>
                      <Typography variant="body2">ページ: {subject?.currentPage || 0} / {subject?.totalPages || 0}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App; 