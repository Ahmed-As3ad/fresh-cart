import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Box, Typography } from '@mui/material';
import ProductsD from "./ProductsD/ProductsD";
import Loading from "../Loading/Loading";
import SlidHome from "../Slider/Slider";
import toast from "react-hot-toast";

const getProducts = async () => {
  try {
    const response = await axios.get(`https://ecommerce.routemisr.com/api/v1/products`);
    return response.data?.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل تحميل المنتجات");
  }
};

export default function Home() {
  const { data: products, error, isError, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isLoading) return <Loading />;
  
  if (isError) {
    toast.error(error.message);
    return null; 
  }

  return (
    <>
      <SlidHome />
      <Box
        sx={{
          backgroundColor: '#f4f6f8',
          padding: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'center',
        }}
      >
        {products?.length > 0 ? (
          products.map((prod: any) => (
            <Box
              sx={{
                width: { xs: '100%', sm: '50%', md: '33%', lg: '20%' },
                padding: 2,
              }}
              key={prod._id}
            >
              <ProductsD prod={prod} />
            </Box>
          ))
        ) : (
          <Typography variant="h6" color="textSecondary" sx={{ textAlign: "center", width: "100%" }}>
            لا توجد منتجات متاحة حاليًا
          </Typography>
        )}
      </Box>
    </>
  );
}
