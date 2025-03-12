import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Box, Button, Card, CardContent, CardMedia, IconButton, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Link } from 'react-router-dom';

interface Product {
  _id: string;
  imageCover: string;
  category: {
    name: string;
  };
  title: string;
  price: number;
}

export default function ProductCard({ prod }: { prod: Product }) {
  const { _id, imageCover, category, title, price } = prod;
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsLiked(storedWishlist.some((item: Product) => item._id === _id));
  }, [_id]);

  const addToWishlist = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('يجب تسجيل الدخول أولاً');

      const response = await fetch('https://ecommerce.routemisr.com/api/v1/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: `${token}`,
        },
        body: JSON.stringify({ productId: _id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل إضافة المنتج إلى المفضلة');
      }

      return response.json();
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ ما');
    }
  };

  const mutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      localStorage.setItem('wishlist', JSON.stringify([...storedWishlist, prod]));
      setIsLiked(true);
      queryClient.invalidateQueries(['wishlist']);
      toast.success('تمت الإضافة إلى المفضلة');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleLikeClick = () => {
    if (!localStorage.getItem('userToken')) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    if (isLiked) return;
    mutation.mutate();
  };

  return (
    <Card
      sx={{
        borderRadius: '12px',
        boxShadow: 4,
        transition: 'transform 0.3s ease',
        '&:hover': { transform: 'scale(1.02)' },
        position: 'relative',
      }}
    >
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

      <Link to={`/productdetails/${_id}/${category.name}`} style={{ textDecoration: 'none' }}>
        <CardMedia
          component="img"
          height="200"
          image={imageCover}
          alt={title}
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
            {category.name || 'عام'}
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
            {title}
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
        to={`/productdetails/${_id}/${category.name}`}
        fullWidth
        sx={{
          backgroundColor: '#FF5722',
          color: 'white',
          borderRadius: '0 0 12px 12px',
          py: 1.5,
          '&:hover': { bgcolor: '#E64A19' },
        }}
      >
        تفاصيل المنتج
      </Button>
    </Card>
  );
}
