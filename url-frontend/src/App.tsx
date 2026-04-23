import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [ttl, setTtl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isNumber, setIsNumber] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ttl === "") {
      setIsNumber(true);
      return;
    }
    const numericValue = Number(ttl);
    setIsNumber(!isNaN(numericValue) && numericValue >= 0);
  }, [ttl]);

  const isValidUrl = (url) => {
    try {
      const newUrl = new URL(url);
      return newUrl.protocol === "http:" || newUrl.protocol === "https:";
    } catch (err) {
      return false;
    }
  };

  const isFormValid = isValidUrl(originalUrl) && isNumber && originalUrl !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setCopied(false);

    try {
      const res = await axios.post("http://localhost:3000/shorten", {
        url: originalUrl,
        expiresAt: ttl !== "" ? Number(ttl) : null,
      });

      setShortUrl(res.data.shortUrl);
      setOriginalUrl("");
      setTtl("");
    } catch (err) {
      console.error("Error shortening URL:", err);
      alert("Failed to shorten URL. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="main min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-4">
      <h1 className="title text-5xl font-bold mb-8 text-transparent bg-clip-text bg-linear-to-r from-gray-500 to-orange-400">
        URL SHORTENER
      </h1>

      <form
        className="flex flex-col gap-6 w-full max-w-sm bg-gray-800 p-8 rounded-xl shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-400">
            Original URL
          </label>
          <input
            type="url"
            placeholder="https://example.com"
            className="bg-gray-700 p-3 rounded border border-gray-600 focus:border-orange-400 outline-none transition-all"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-sm font-semibold text-gray-400">
              Days until expiration
            </label>
            {!isNumber && (
              <span className="text-xs text-red-400 animate-pulse">
                Invalid number
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="(Optional)"
            className={`bg-gray-700 p-3 rounded border outline-none transition-all ${
              isNumber
                ? "border-gray-600 focus:border-orange-400"
                : "border-red-500"
            }`}
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
          />
        </div>

        <button
          disabled={!isFormValid || isLoading}
          className={`w-full py-3 rounded font-bold text-lg transition-all transform active:scale-95 ${
            !isFormValid || isLoading
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : "bg-orange-400 hover:bg-orange-300 shadow-lg shadow-orange-900/20"
          }`}
          type="submit"
        >
          {isLoading ? "Generating..." : "Generate Link"}
        </button>
      </form>

      <div
        className={`mt-10 transition-all duration-500 ${shortUrl ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {shortUrl && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col items-center gap-3">
            <p className="text-gray-400 text-sm">
              Your shortened URL is ready:
            </p>
            <div className="flex items-center gap-4 bg-gray-900 p-3 rounded border border-gray-600">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 font-mono underline hover:text-amber-300"
              >
                {shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs transition-colors"
              >
                {copied ? "✅ Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
