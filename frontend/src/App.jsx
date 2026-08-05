import { useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import QRCodeGenerator from "qrcode";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [error,setError]=useState("");
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidUrl=(value)=>{
    try{
      const url=new URL(value);
      return url.protocol==="http:" || url.protocol==="https:";
    }catch{
      return false;
    }
  };
  const handleShorten = async () => {
    if (!url.trim() || loading) return;
    setError("");
    if(!isValidUrl(url)){
      setError("Invalid URL. Please enter a valid URL starting with https:// or https://");
      return;
    }
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/shorten`, {
        originalUrl: url
      });

      const newShortUrl=res.data.shortUrl;
      setShortUrl(newShortUrl);
      setCopied(false);

      const qr=await QRCodeGenerator.toDataURL(newShortUrl);
      setQrImage(qr);
    } catch(err) {
      setError(err.response?.data.message || "Failed to shorten the URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-300 min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="text-4xl text-red-400 underline font-bold mb-4 text-center">URL-SHORTENER</h1>
      <div className="flex flex-col gap-3 w-full max-w-3xl">
        <input
          type="text"
          className="input input-success w-full"
          placeholder="Enter long URL"
          value={url}
          onChange={(e) =>{
             setUrl(e.target.value);
             setError("");
          }}
        />
        { error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md">
            <p>{error}</p>
            <p className="mt-2 font-semibold">Examples:</p>
            <ul className="list-disc ml-5">
              <li>http://example.com</li>
            </ul>
          </div>
        )}
        <button
          onClick={handleShorten}
          className="btn btn-primary w-full sm:auto text-2xl text-green-200"
          disabled={loading}
        >
          Shorten
        </button>
      </div>
      {shortUrl && (
        <div className="flex flex-col  items-center max-w-3xl w-full">
          <p className="font-medium mb-2 underline text-green-700 text-xl">Your short link:</p>
          <a
            className="link link-primary break-all"
            target="_blank"
            href={shortUrl}
          >
            {shortUrl}
          </a>
          <button
            onClick={handleCopy}
            className={`btn mt-2 pb-1 w-full text-xl ${
              copied ? "btn-success" : "btn-secondary"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>

          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <p className="mb-2 text-center font-bold text-gray-800 underline">
              Scan QR Code:
            </p>
            <QRCode value={shortUrl} size={180} />
          </div>
          {qrImage && (
            <a
              className="btn btn-accent mt-3 w-full text-lg underline"
              download="qr-code.png"
              href={qrImage}
            >
              Download QR Code
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
