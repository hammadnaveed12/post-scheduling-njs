'use server';

import axios from 'axios';
import sharp from 'sharp';

export async function reduceImageBySize(url: string, maxSizeKB = 976) {
  try {
    // Fetch the image from the URL
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    let imageBuffer = Buffer.from(response.data);

    // Use sharp to get the metadata of the image
    const metadata = await sharp(imageBuffer).metadata();
    let width = metadata.width!;
    let height = metadata.height!;

    // Resize iteratively until the size is below the threshold
    while (imageBuffer.length / 1024 > maxSizeKB) {
      width = Math.floor(width * 0.9); // Reduce dimensions by 10%
      height = Math.floor(height * 0.9);

      // Resize the image
      const resizedBuffer = await sharp(imageBuffer)
        .resize({ width, height })
        .toBuffer();

      imageBuffer = resizedBuffer;

      if (width < 10 || height < 10) break; // Prevent overly small dimensions
    }

    return imageBuffer;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}
