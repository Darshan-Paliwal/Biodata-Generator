import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    education: "",
    occupation: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Biodata Generator</h1>
        <form className="space-y-4">
          <input type="text" name="name" placeholder="Full Name"
            value={formData.name} onChange={handleChange}
            className="w-full border rounded p-2"/>
          <input type="number" name="age" placeholder="Age"
            value={formData.age} onChange={handleChange}
            className="w-full border rounded p-2"/>
          <input type="text" name="education" placeholder="Education"
            value={formData.education} onChange={handleChange}
            className="w-full border rounded p-2"/>
          <input type="text" name="occupation" placeholder="Occupation"
            value={formData.occupation} onChange={handleChange}
            className="w-full border rounded p-2"/>
          <textarea name="address" placeholder="Address"
            value={formData.address} onChange={handleChange}
            className="w-full border rounded p-2"/>
        </form>
        <button onClick={handleDownload}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Download PDF
        </button>
      </div>
    </div>
  );
}