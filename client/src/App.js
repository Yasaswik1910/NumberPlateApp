import React, { useState, useEffect } from 'react'; // Added useEffect for fetching history
import axios from 'axios';
import { toast } from 'react-hot-toast';

function App() {
  const [video, setVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [plateInput, setPlateInput] = useState("");
  const [theftPlates, setTheftPlates] = useState([]);
  const [history, setHistory] = useState([]); // New state for history of plates
  const [searchQuery, setSearchQuery] = useState(""); // For search input

  // Fetch history from the backend when the component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/history");
        setHistory(response.data); // Update history with data from the backend
      } catch (err) {
        console.error("Error fetching history:", err.message);
        toast.error("Failed to fetch history.");
      }
    };

    fetchHistory();
  }, []); // Empty dependency array ensures it runs only once after initial mount

  const handleVideoUpload = (e) => {
    setVideo(e.target.files[0]);
  };

  const checkForTheftPlates = async (plates) => {
    const theftList = [];

    for (const plate of plates) {
      try {
        const response = await axios.get(`http://localhost:5000/check-theft/${plate}`);
        if (response.data.isTheft) {
          toast.error(`🚨 Theft Vehicle Detected: ${plate}`);
          theftList.push(plate);
        }
      } catch (err) {
        console.error(`Error checking plate ${plate}:`, err.message);
      }
    }

    setTheftPlates(theftList);
  };

  const handleSubmit = async () => {
    if (!video) return;
    const formData = new FormData();
    formData.append("video", video);
    setProcessing(true);
    setResult(null);
    setTheftPlates([]);
    setHistory([]); // Clear history before new upload

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      setResult(res.data);
      await checkForTheftPlates(res.data.plates);
      toast.success("Video processed successfully!");
      setHistory([...history, ...res.data.plates]); // Add newly detected plates to history
    } catch (err) {
      toast.error("Error processing video");
    } finally {
      setProcessing(false);
    }
  };

  const handleTheftEntry = async () => {
    if (!plateInput.trim()) {
      toast.error("Please enter a plate number.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/mark-theft", {
        plate_number: plateInput.trim(),
      });

      if (response.status === 200) {
        toast.success("Theft vehicle recorded successfully.");
        setPlateInput("");
        setHistory([...history, plateInput.trim()]); // Add to history
      } else {
        toast.error("Failed to record theft vehicle.");
      }
    } catch (err) {
      toast.error("Failed to record theft vehicle.");
      console.error("Error:", err.response?.data || err.message);
    }
  };

  const handleRemoveFromHistory = (index) => {
    const updatedHistory = history.filter((_, idx) => idx !== index);
    setHistory(updatedHistory);
  };

  const filteredPlates = result?.plates.filter((plate) =>
    plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">🚘 Automatic Number Plate Detection</h1>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="flex-1 p-2 border rounded" />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-transform transform hover:scale-105"
              disabled={processing}
            >
              {processing ? "Processing..." : "Upload & Process"}
            </button>
          </div>

          {/* Search Input */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search plates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full"
            />
          </div>

          {/* Video Preview Section */}
          {video && (
            <div className="mt-4">
              <h2 className="font-semibold">Video Preview:</h2>
              <video controls width="300" className="rounded-lg mt-2 shadow-md transition-transform transform hover:scale-105">
                <source src={URL.createObjectURL(video)} type={video.type} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploadProgress > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-4"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div className="text-sm text-gray-700">Upload Progress: {uploadProgress}%</div>

          {processing && (
            <div className="text-yellow-600 font-semibold mt-2">⏳ Processing video, please wait...</div>
          )}

          {filteredPlates && filteredPlates.length > 0 && (
            <div className="bg-green-100 border border-green-400 text-green-800 rounded p-4 mt-4">
              <h2 className="text-lg font-semibold mb-2">Detected Plates :</h2>
              <ul className="list-disc list-inside">
                {filteredPlates.map((p, idx) => (
                  <li
                    key={idx}
                    className={theftPlates.includes(p) ? "text-red-600 font-bold" : ""}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* History Table */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">🔎 History of Detected Plates</h2>
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Plate Number</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((plate, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2">{plate}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleRemoveFromHistory(idx)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-transform transform hover:scale-105"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="p-2 text-center">No history available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">🛑 Mark Theft Vehicle</h2>
            <div className="flex items-center space-x-4">
              <input
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value)}
                placeholder="Enter plate number"
                className="flex-1 border p-2 rounded"
              />
              <button
                onClick={handleTheftEntry}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-transform transform hover:scale-105"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

