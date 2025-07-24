import axios from "axios";

const uploadMultiple = async (files) => {
  // If no files, return empty array
  if (!files || files.length === 0) {
    return [];
  }

  const data = new FormData();
  
  // Add all files to the form data
  files.forEach((file) => {
    data.append("files", file);
  });

  try {
    const res = await axios.post("http://localhost:8800/api/upload/multiple", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const { urls } = res.data;
    return urls;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default uploadMultiple;
