import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function App() {
  const [video, setVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [plateInput, setPlateInput] = useState("");
  const [theftPlates, setTheftPlates] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/history");
        setHistory(response.data);
      } catch (err) {
        console.error("Error fetching history:", err.message);
        toast.error("Failed to fetch history.");
      }
    };
    fetchHistory();
  }, []);

  const handleVideoUpload = (e) => {
    setVideo(e.target.files[0]);
  };

  const checkForTheftPlates = async (plates) => {
    const theftList = [];
    for (const plate of plates) {
      try {
        const response = await axios.get(`http://localhost:5000/check-theft/${plate}`);
        if (response.data.isTheft) {
          alert()
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

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      const cleanedPlates = res.data.plates
        .map(p => p.replace(/\s+/g, '').toUpperCase())
        .filter(p => p.length >= 8);

      setResult({ plates: cleanedPlates });
      await checkForTheftPlates(cleanedPlates);
      toast.success("Video processed successfully!");
      setHistory(prev => [...cleanedPlates, ...prev]);
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
        setHistory(prev => [plateInput.trim(), ...prev]);
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

  const handleDownload = () => {
    const csv = ["Plate Number", ...history].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "detected_plates_history.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredPlates = result?.plates.filter((plate) =>
    plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter((plate) =>
    plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors p-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">🚘 Automatic Number Plate Detection</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>

          {/* Upload Section */}
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">📤 Upload Video</h2>
            <div className="flex items-center gap-4">
              <input type="file" accept="video/*" onChange={handleVideoUpload} className="flex-1 p-2 border rounded" />
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                disabled={processing}
              >
                {processing ? "Processing..." : "Upload & Process"}
              </button>
            </div>

            {video && (
              <div>
                <video controls width="400" className="mt-2 rounded-lg shadow-lg">
                  <source src={URL.createObjectURL(video)} type={video.type} />
                </video>
              </div>
            )}

            {uploadProgress > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-3" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
            <div className="text-sm">Upload Progress: {uploadProgress}%</div>
          </div>

          {/* Search + Detected Results */}
          {filteredPlates && filteredPlates.length > 0 && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="🔍 Search detected plates"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border rounded w-full"
              />

              <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-800 dark:text-green-200 rounded p-4">
                <h2 className="font-semibold mb-2">Detected Plates:</h2>
                <ul className="space-y-1">
                  {filteredPlates.map((p, idx) => (
                    <li key={idx} className={`text-lg ${theftPlates.includes(p) ? "text-red-600 font-bold" : ""}`}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* History Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">📜 History of Detected Plates</h2>
            <input
              type="text"
              placeholder="🔍 Search history"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full mb-2"
            />

            <button
              onClick={handleDownload}
              className="mb-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              ⬇️ Download History CSV
            </button>

            <div className="max-h-60 overflow-y-auto rounded border">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 border">Plate Number</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((plate, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-100 dark:hover:bg-gray-600">
                        <td className="p-2">{plate}</td>
                        <td className="p-2">
                          <button
                            onClick={() => handleRemoveFromHistory(idx)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="p-2 text-center">No matching history found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Theft Vehicle Marking */}
          <div className="border-t pt-4">
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
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
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
