import sharp from 'sharp';

async function inspect() {
  const image = sharp('src/sprites/bunny.png');
  const metadata = await image.metadata();
  console.log('Image metadata:', metadata.width, 'x', metadata.height, 'channels:', metadata.channels);

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  console.log('Pixel at 0,0:', data[0], data[1], data[2], data[3]);
  console.log('Pixel at 10,10:', data[40], data[41], data[42], data[43]);
  console.log('Pixel at center (768, 512):', 
    data[(512 * info.width + 768) * 4],
    data[(512 * info.width + 768) * 4 + 1],
    data[(512 * info.width + 768) * 4 + 2],
    data[(512 * info.width + 768) * 4 + 3]
  );
}

inspect();
