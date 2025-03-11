import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Box } from '@mui/material';
import ProductsD from "./ProductsD/ProductsD";
import Loading from "../Loading/Loading";
import SlidHome from "../Slider/Slider";



export default function Home() {
  function getProducts(){
   return axios.get(`https://ecommerce.routemisr.com/api/v1/products`)
  }
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    select:(data)=>data?.data?.data
  })

  if (isLoading) return <Loading />;   
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <>
    <SlidHome/>
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
        
        {data.map((prod: any) => (
          <Box
            sx={{
              width: { xs: '100%', sm: '50%', md: '33%', lg: '20%' },
              padding: 2,
            }}
            key={prod._id}
          >
            <ProductsD prod={prod} />
          </Box>
        ))}
      </Box>
    </>
  
  )
}
