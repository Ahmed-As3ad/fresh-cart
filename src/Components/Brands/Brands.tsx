import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import Loading from '../Loading/Loading';

interface Brand {
  id: number;
  name: string;
  image: string;
}

const fetchBrands = async (): Promise<Brand[]> => {
  try {
    const response = await axios.get('https://ecommerce.routemisr.com/api/v1/brands');
    return response.data.data;
  } catch (error) {
    throw new Error('فشل تحميل العلامات التجارية، حاول مرة أخرى لاحقًا.');
  }
};

export default function Brands() {
  const { data: brands, isLoading, isError, error } = useQuery<Brand[], Error>({
    queryKey: ['brands'],
    queryFn: fetchBrands,
    onError: (err) => {
      toast.error(err.message);
    },
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
        العلامات التجارية
      </Typography>
      <Grid container spacing={3}>
        {brands?.map((brand) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={brand.id}>
            <Card
              sx={{
                backgroundColor: 'white',
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
                image={brand.image}
                alt={brand.name}
                sx={{ objectFit: 'contain', padding: 2 }}
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" component="div">
                  {brand.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
