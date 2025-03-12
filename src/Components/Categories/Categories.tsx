import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import Loading from '../Loading/Loading';
import toast, { Toaster } from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  image: string;  
}

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get('https://ecommerce.routemisr.com/api/v1/categories');
    return response.data.data;
  } catch (error) {
    toast.error('فشل تحميل الفئات، يرجى المحاولة لاحقًا');
    throw new Error('Failed to fetch categories');
  }
};

export default function Categories() {
  const { data: categories, isLoading, isError } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Toaster position="top-center" reverseOrder={false} />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Toaster position="top-center" reverseOrder={false} />
      <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center' }}>
        الفئات
      </Typography>
      <Grid container spacing={3}>
        {categories?.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={category.image || 'fallback-image.jpg'}
                alt={category.name}
                sx={{ objectFit: 'contain' }}
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" component="div">
                  {category.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}