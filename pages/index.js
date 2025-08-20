const handleFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    const img = new Image();
    img.onload = () => {
      // Define max dimensions for PDF photo box
      const maxWidth = 200;
      const maxHeight = 250;

      let { width, height } = img;

      // Scale down while preserving aspect ratio
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width = width * ratio;
      height = height * ratio;

      // Draw on canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; // white background
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export cleaned JPG
      const jpgBase64 = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
      setFormData({ ...formData, photo: jpgBase64 });
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};