import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Grid, Card, CardContent, CardMedia, Typography, Box, Alert } from '@mui/material';
import Loading from '../Loading/Loading';


interface Category {
  id: number;
  name: string;
  image: string;  
}


const fetchCategories = async (): Promise<Category[]> => {
  const response = await axios.get('https://ecommerce.routemisr.com/api/v1/categories');
  return response.data.data; 
};

export default function Categories() {
  const { data: categories, isLoading, isError, error } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });


  if (isLoading) {
    return (
      <Loading/>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Alert severity="error">{error?.message || 'فشل تحميل الفئات'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
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
                image={category.image} 
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
