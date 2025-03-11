import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Box, Button, Card, CardContent, CardMedia, IconButton, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Link } from 'react-router-dom';

export default function ProductCard({ prod }: { prod: Product }) {
  const { _id, imageCover, category, title, price } = prod;
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  const addToWishlist = async (productId: string) => {
    const token = localStorage.getItem('userToken');
    if (!token) throw new Error('Authentication required');

    const response = await fetch('https://ecommerce.routemisr.com/api/v1/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': `${token}`,
      },
      body: JSON.stringify({ productId: _id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add to wishlist');
    }
    return response.json();
  };

  useEffect(() => {
    const storedWishlist = localStorage.getItem('wishlist') ? JSON.parse(localStorage.getItem('wishlist') || '[]') : [];
    setIsLiked(storedWishlist.some((item: Product) => item._id === _id));
  }, [_id]);

  const mutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: (data) => {
      const storedWishlist = localStorage.getItem('wishlist') ? JSON.parse(localStorage.getItem('wishlist') || '[]') : [];
      localStorage.setItem('wishlist', JSON.stringify([...storedWishlist, prod]));

      setIsLiked(true);

      queryClient.invalidateQueries(['wishlist']);
      enqueueSnackbar('تمت الإضافة إلى المفضلة', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
    },
  });

  const handleLikeClick = () => {
    if (!localStorage.getItem('userToken')) {
      enqueueSnackbar('يجب تسجيل الدخول أولاً', { variant: 'warning' });
      return;
    }
    if (isLiked) return;
    mutation.mutate(_id);
  };

  const categoryName = category?.name || 'عام';
  const truncatedTitle = title?.split(' ').slice(0, 3).join(' ') || '';

  return (
    <Card sx={{ borderRadius: '12px', boxShadow: 4, transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.02)' }, position: 'relative' }}>
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 2,
          color: isLiked ? 'rgb(255, 27, 27)' : 'rgb(162, 162, 162)',
          bgcolor: 'background.paper',
          '&:hover': {
            color: isLiked ? 'rgb(255, 0, 0)' : 'error.main',
            bgcolor: 'rgba(255,255,255,0.9)',
          },
        }}
        onClick={handleLikeClick}
      >
        {isLiked ? <FavoriteIcon fontSize="medium" /> : <FavoriteBorderIcon fontSize="medium" />}
      </IconButton>

      <Link to={`/productdetails/${_id}/${categoryName}`} style={{ textDecoration: 'none' }}>
        <CardMedia
          component="img"
          height="200"
          image={imageCover}
          alt={truncatedTitle}
          sx={{
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            objectFit: 'cover',
            aspectRatio: '1/1',
          }}
        />

        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: '#FF5722',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}
          >
            {categoryName}
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              height: '3em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {truncatedTitle}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mt: 1,
              color: 'primary.main',
              fontWeight: 'bold',
              '&:hover': { color: '#FF5722' },
            }}
          >
            {price.toLocaleString()} جنيه
          </Typography>
        </CardContent>
      </Link>

      <Button
        component={Link}
        to={`/productdetails/${_id}/${categoryName}`}
        fullWidth
        sx={{
          backgroundColor: '#FF5722',
          color: 'white',
          borderRadius: '0 0 12px 12px',
          py: 1.5,
          '&:hover': { bgcolor: '#E64A19' },
        }}
      >
        More Details
      </Button>
    </Card>
  );
}
