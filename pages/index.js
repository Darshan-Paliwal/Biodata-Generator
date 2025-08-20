import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    birthName: "",
    dob: "",
    birthTime: "",
    birthPlace: "",
    district: "",
    gotra: "",
    height: "",
    bloodGroup: "",
    qualification: "",
    occupation: "",
    fatherName: "",
    motherName: "",
    sisterName: "",
    residence: "",
    permanentAddress: "",
    mobileMother: "",
    mobileMama: "",
    photo: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 200;
        const maxHeight = 250;

        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width *= ratio;
        height *= ratio;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const jpgBase64 = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
        setFormData({ ...formData, photo: jpgBase64 });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    const res = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "biodata.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="backdrop-blur-lg bg-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-white drop-shadow-md">
          ✨ Biodata Generator ✨
        </h1>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData).map((key) =>
            key !== "photo" ? (
              <input
                key={key}
                type={key === "dob" ? "date" : "text"}
                name={key}
                placeholder={key.replace(/([A-Z])/g, " $1")}
                value={formData[key]}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white/70 p-3 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition"
              />
            ) : null
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="col-span-1 md:col-span-2 text-white"
          />
        </form>

        <button
          onClick={handleDownload}
          className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition transform"
        >
          🚀 Download PDF
        </button>
      </div>
    </div>
  );
}