import React, { useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import imgSlider1 from "../../assets/slider.jpg";
import imgSlider2 from "../../assets/slider2.jpg";
import imgSlider3 from "../../assets/slider3.jpg";
import imgSliderR1 from "../../assets/img1.jpeg";
import imgSliderR2 from "../../assets/img2.jpg";
import toast from "react-hot-toast";

const images = [imgSlider1, imgSlider2, imgSlider3];
const imageAltTexts = ["Image 1", "Image 2", "Image 3"];

const SlidHome: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 600);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
      toast.success("تم تغيير الصورة تلقائيًا", { position: "top-right" });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    toast.success("انتقلت إلى الصورة التالية", { position: "top-right" });
  };

  const handlePrevious = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + images.length) % images.length);
    toast.success("عدت إلى الصورة السابقة", { position: "top-right" });
  };

  return (
    <Box sx={{ padding: "40px" }}>
      <Box sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", gap: 4 }}>
        <Box sx={{ width: isSmallScreen ? "100%" : "65%", position: "relative" }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "500px",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: 5,
              transition: "box-shadow 0.3s ease-in-out",
              "&:hover": {
                boxShadow: 10,
              },
            }}
          >
            <img
              src={images[currentSlide]}
              alt={imageAltTexts[currentSlide]}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "opacity 1s ease-in-out",
                borderRadius: "20px",
              }}
            />
            <Typography
              variant="h4"
              sx={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                color: "white",
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",
                zIndex: 2,
              }}
            >
              {imageAltTexts[currentSlide]}
            </Typography>
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: "absolute",
                top: "50%",
                left: "15px",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
              }}
            >
              <ArrowBackIosIcon sx={{ color: "black" }} />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                top: "50%",
                right: "15px",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
              }}
            >
              <ArrowForwardIosIcon sx={{ color: "black" }} />
            </IconButton>
          </Box>
        </Box>

        {!isSmallScreen && (
          <Box sx={{ width: "35%", display: "flex", flexDirection: "column", gap: 4 }}>
            <img
              src={imgSliderR1}
              alt="slider-right-1"
              style={{
                width: "100%",
                objectFit: "cover",
                height: "250px",
                borderRadius: "8px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s",
              }}
            />
            <img
              src={imgSliderR2}
              alt="slider-right-2"
              style={{
                width: "100%",
                objectFit: "cover",
                height: "250px",
                borderRadius: "8px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s",
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SlidHome;