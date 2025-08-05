import React, { useCallback, useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Box,
  Card,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  CardContent,
} from "@mui/material";
import { presign } from "../api/api";
import DeleteIcon from '@mui/icons-material/Delete';

// Custom styles for the dropzone area
const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 4,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
};

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

export const Upload = ({ setAlert }) => {
  // State variables for managing the upload process
  const [items, setItems] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Function to handle files dropped into the dropzone
  const onDrop = useCallback((acceptedFiles) => {
    // Add new files to the items state
    setItems((prevState) => [
      ...prevState,
      ...acceptedFiles.map(file => ({ label: file.name, file: file }))
    ]);
    // Clear any previous error messages
    setUploadError("");
  }, []);

  // Function to dismiss a file from the list
  const onDismiss = (itemIndex) => {
    setItems((prevState) => prevState.filter((_, index) => index !== itemIndex));
  };

  // Function to handle the actual upload
  const onUpload = async (e) => {
    e.preventDefault();
    setUploadStatus(true);
    setUploadError("");

    try {
      if (items.length === 0) {
        throw new Error("Please select files to upload.");
      }
      
      // Loop through each file and upload it
      for (const item of items) {
        const file = item.file;
        console.log("File uploaded=", file.name);

        const response = await presign(file.name);
        
        if (!response || !response.url) {
            throw new Error(`Failed to get a valid presigned URL for file: ${file.name}`);
        }

        // The original code used a PUT request, which is common for presigned URLs
        await axios.put(response.url, file);
      }

      setItems([]);
      setAlert({ heading: "Upload success", text: "Files uploaded successfully.", variant: "success" });

    } catch (err) {
      console.error("Upload error", err);
      // Set a descriptive error message
      setUploadError(err.message || "An unknown error occurred during upload.");
    } finally {
      // Always reset the upload status when done
      setUploadStatus(false);
    }
  };

  // useDropzone hook with file validation and styling
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.ogg', '.amr'],
      'video/*': ['.mp4', '.webm'],
    },
    validator: file => {
      // Validate filename characters
      if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
        setUploadError("Filenames can only include characters a-z, A-Z, 0-9, period (.), underscore (_), and hyphen (-).");
        return {
          code: "filename-invalid",
          message: `Invalid character in file name: ${file.name}`
        };
      }
      return null;
    },
  });

  // Memoize the dropzone styling for performance
  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [isFocused, isDragAccept, isDragReject]);

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        {/* Display an error alert if there is one */}
        {uploadError && (
          <Alert severity="error" onClose={() => setUploadError("")} sx={{ mb: 2 }}>
            {uploadError}
          </Alert>
        )}
        
        {/* Upload form and dropzone area */}
        <form onSubmit={onUpload}>
          <Box {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <Typography variant="body1" color="text.primary" sx={{ textAlign: 'center' }}>
              Drag and drop or click to select call recordings to upload.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Valid formats: MP3, WAV, FLAC, OGG, AMR, MP4, and WEBM.
              <br/>Filenames can only include characters a-z, A-Z, 0-9, period (.), underscore (_), and hyphen (-).
            </Typography>
          </Box>
          
          {/* Display selected files as chips */}
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            {items.map((item, index) => (
              <Chip
                key={index}
                label={item.label}
                onDelete={() => onDismiss(index)}
                deleteIcon={<DeleteIcon />}
              />
            ))}
          </Stack>

          {/* Loading indicator during upload */}
          {uploadStatus && <LinearProgress sx={{ mt: 2 }} />}

          {/* Upload button */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              type="submit"
              disabled={uploadStatus || items.length === 0}
            >
              {uploadStatus ? "Uploading..." : "Upload"}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default Upload;
