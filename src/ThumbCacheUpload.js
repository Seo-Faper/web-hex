import React, { useState } from 'react';

class ThumbCache {
  constructor() {
    this.images = [];
  }

  async parseDBFile(arrayBuffer) {
    this.images = [];
    let index = 0;
    const sig = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer.slice(index, index + 4)));

    if (sig !== "CMMM") {
      throw new Error("Header != CMMM");
    }

    index += 4;

    const ver = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    const cacheType = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    const firstOffset = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    const firstAvailOffset = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    const numEntries = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    while (index < arrayBuffer.byteLength) {
      const entrySig = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer.slice(index, index + 4)));
      const lastStart = index;

      index += 4;

      const cacheSize = new DataView(arrayBuffer, index, 4).getUint32(0, true);
      index += 4;

      index += 8; // skip entry hash

      const identifierSize = new DataView(arrayBuffer, index, 4).getInt32(0, true);
      index += 4;

      const paddingSize = new DataView(arrayBuffer, index, 4).getInt32(0, true);
      index += 4;

      const dataSize = new DataView(arrayBuffer, index, 4).getUint32(0, true);
      index += 4;

      index += 4; // skip unknown

      index += 8; // skip data checksum
      index += 8; // skip header checksum

      index += 8; // move 8 for rest to work

      const identifierBytes = new Uint16Array(arrayBuffer.slice(index, index + identifierSize));
      const identifier = String.fromCharCode.apply(null, identifierBytes);
      index += identifierSize;

      index += paddingSize;

      const rawImageBytes = new Uint8Array(arrayBuffer.slice(index, index + dataSize));
      index += dataSize;

      if (rawImageBytes.length > 0) {
        const newBitmap = await this.getImageFromByteArray(rawImageBytes);
        this.images.push(newBitmap);
      }

      index = lastStart + cacheSize;
    }
  }

  async getImageFromByteArray(byteArray) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([byteArray]);
      const imageUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = imageUrl;
    });
  }
}

function ThumbCacheUpload() {
  const [images, setImages] = useState([]);
  const thumbCache = new ThumbCache();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      await thumbCache.parseDBFile(arrayBuffer);
      setImages([...thumbCache.images]);
    }
  };

  return (
    <div>
      <input type="file" accept=".db" onChange={handleFileUpload} />
      <div>
        {images.map((image, index) => (
          <img key={index} src={image.src} alt={`Image ${index}`} />
        ))}
      </div>
    </div>
  );
}

export default ThumbCacheUpload;
