class ThumbCache {
    constructor(fileName) {
        const fs = require('fs');
        const data = fs.readFileSync(fileName);
        const rawBytes = Buffer.from(data);

        this.images = [];

        let index = 0;

        const sig = rawBytes.toString('ascii', index, index + 4);
        if (sig !== "CMMM") {
            throw new Error("Header != CMMM");
        }
        index += 4;

        const ver = rawBytes.readUInt32LE(index);
        index += 4;

        const cacheType = rawBytes.readUInt32LE(index);
        index += 4;

        const firstOffset = rawBytes.readUInt32LE(index);
        index += 4;

        const firstAvailOffset = rawBytes.readUInt32LE(index);
        index += 4;

        const numEntries = rawBytes.readUInt32LE(index);
        index += 4;

        while (index < rawBytes.length) {
            const lastStart = index;

            const cacheSize = rawBytes.readUInt32LE(index);
            index += 4;

            index += 8; // skip entry hash

            const identifierSize = rawBytes.readInt32LE(index);
            index += 4;

            const paddingSize = rawBytes.readInt32LE(index);
            index += 4;

            const dataSize = rawBytes.readUInt32LE(index);
            index += 4;

            index += 4; // skip unknown

            index += 8; // skip data checksum
            index += 8; // skip header checksum

            index += 8; // move 8 for the rest to work

            const identifier = rawBytes.toString('utf16le', index, index + identifierSize);
            index += identifierSize;

            index += paddingSize;

            const rawImageBytes = rawBytes.slice(index, index + dataSize);

            if (rawImageBytes.length > 0) {
                const newBitmap = this.getImageFromByteArray(rawImageBytes);
                this.images.push(newBitmap);
            }

            index = lastStart + cacheSize;
        }
    }

    // from http://stackoverflow.com/questions/3801275/how-to-convert-image-in-byte-array/16576471#16576471
    getImageFromByteArray(byteArray) {
        const imageBuffer = Buffer.from(byteArray);
        const base64Image = imageBuffer.toString('base64');

        const img = new Image();
        img.src = 'data:image/png;base64,' + base64Image;

        return img;
    }
}

// Example usage
const thumbCache = new ThumbCache('yourFileName');
console.log(thumbCache.images);
