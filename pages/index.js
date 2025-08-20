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
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photo: reader.result.split(",")[1] });
    };
    reader.readAsDataURL(e.target.files[0]);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Biodata Generator</h1>
        <form className="grid grid-cols-2 gap-4">
          {Object.keys(formData).map((key) =>
            key !== "photo" ? (
              <input
                key={key}
                type="text"
                name={key}
                placeholder={key.replace(/([A-Z])/g, " $1")}
                value={formData[key]}
                onChange={handleChange}
                className="border rounded p-2"
              />
            ) : null
          )}
          <input type="file" accept="image/*" onChange={handleFile} className="col-span-2" />
        </form>
        <button
          onClick={handleDownload}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}