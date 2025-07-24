const API_BASE_URL = "http://localhost:8800";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/img/noavatar.jpg";
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  
  // If it's a local path starting with /uploads/, prepend API base URL
  if (imagePath.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Default fallback
  return "/img/noavatar.jpg";
};

export default getImageUrl;
