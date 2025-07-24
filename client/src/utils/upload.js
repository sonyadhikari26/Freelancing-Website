import axios from "axios";

const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);

  try {
    const res = await axios.post("http://localhost:8800/api/upload/single", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const { url } = res.data;
    return url;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default upload;
