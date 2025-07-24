import React, { useReducer, useState } from "react";
import "./Add.scss";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import uploadMultiple from "../../utils/uploadMultiple";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure toastify CSS is included

const Add = () => {
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };

  const handleUpload = async () => {
    if (!singleFile) {
      toast.error("Please select a cover image!");
      return;
    }

    setUploading(true);
    try {
      console.log("Starting upload...");
      console.log("Single file:", singleFile);
      console.log("Multiple files:", files);
      
      const cover = await upload(singleFile);
      console.log("Cover uploaded:", cover);
      
      const images = files && files.length > 0 ? await uploadMultiple([...files]) : [];
      console.log("Images uploaded:", images);
      
      setUploading(false);
      dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
      toast.success("Images uploaded successfully!");
    } catch (err) {
      console.log("Upload error:", err);
      setUploading(false);
      toast.error("Upload failed. Please try again.");
    }
  };

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (gig) => {
      return newRequest.post("/gigs", gig);
    },
    onSuccess: () => {
      toast.success("Gig created successfully!"); // Success message
      queryClient.invalidateQueries(["myGigs"]);
      navigate("/mygigs"); // Navigate after success
    },
    onError: (err) => {
      toast.error(err.response.data || "Something went wrong"); // Display error message
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting gig with state:", state);
    mutation.mutate(state);
  };

  return (
    <div className="add">
      <div className="container">
        <h1>Add New Gig</h1>
        <div className="sections">
          <div className="info">
            <label htmlFor="">Title</label>
            <input type="text" name="title" onChange={handleChange} required />
            <label htmlFor="">Category</label>
            <select name="cat" id="cat" onChange={handleChange} required>
              <option value="graphics_and_design">Graphics And Design</option>
              <option value="digital_marketing">Digital Marketing</option>
              <option value="writing_and_translation">
                Writing And Translation
              </option>
              <option value="video_and_animation">Video And Animation</option>
              <option value="music_and_audio">Music And Audio</option>
              <option value="programming_and_tech">Programming And Tech</option>
              <option value="web_development">Web Development</option>
              <option value="mobile_app_development">
                Mobile App Development
              </option>
              <option value="business">Business</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="data_analysis">Data Analysis</option>
              <option value="seo_services">SEO Services</option>
              <option value="software_development">Software Development</option>
            </select>

            <div className="images">
              <div className="imagesInputs">
                <label htmlFor="">Cover Image</label>
                <input
                  type="file"
                  onChange={(e) => setSingleFile(e.target.files[0])}
                  required
                />
                <label htmlFor="">Upload Images</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  required
                />
              </div>
              <button type="button" onClick={handleUpload} disabled={uploading}>
                {uploading ? "uploading" : "Upload"}
              </button>
              
              {/* Preview uploaded images */}
              {state.cover && (
                <div className="uploaded-images">
                  <h4>Cover Image:</h4>
                  <img 
                    src={`http://localhost:8800${state.cover}`} 
                    alt="Cover" 
                    style={{width: '100px', height: '100px', objectFit: 'cover', marginRight: '10px'}}
                  />
                </div>
              )}
              
              {state.images && state.images.length > 0 && (
                <div className="uploaded-images">
                  <h4>Additional Images:</h4>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                    {state.images.map((img, index) => (
                      <img 
                        key={index}
                        src={`http://localhost:8800${img}`} 
                        alt={`Image ${index + 1}`} 
                        style={{width: '100px', height: '100px', objectFit: 'cover'}}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <label htmlFor="">Description</label>
            <textarea
              name="desc"
              id=""
              placeholder="Brief descriptions to introduce your service to customers"
              cols="0"
              rows="16"
              onChange={handleChange}
              required
            ></textarea>
            <label htmlFor="">Delivery Time (e.g. 3 days)</label>
            <input
              type="number"
              name="deliveryTime"
              onChange={handleChange}
              required
            />

            <label htmlFor="">Price</label>
            <input
              type="number"
              onChange={handleChange}
              name="price"
              required
            />
            <button 
              type="submit" 
              onClick={handleSubmit}
              disabled={mutation.isPending || !state.cover}
            >
              {mutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;
