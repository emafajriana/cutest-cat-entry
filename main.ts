import { closeSync, mkdirSync, openSync, readFileSync, writeSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourcePath = fileURLToPath(new URL('./entry.png', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const outputPath = join(outputDir, 'entry.png');
const image = readFileSync(sourcePath);
const chunkSize = 64 * 1024;

mkdirSync(outputDir, { recursive: true });

const outputFd = openSync(outputPath, 'w');
try {
  for (let offset = 0; offset < image.length; offset += chunkSize) {
    const chunk = image.subarray(offset, Math.min(offset + chunkSize, image.length));
    let written = 0;
    while (written < chunk.length) {
      const count = writeSync(outputFd, chunk, written, chunk.length - written, offset + written);
      if (count === 0) throw new Error('Failed to write the complete image');
      written += count;
    }
  }
} finally {
  closeSync(outputFd);
}

const writtenImage = readFileSync(outputPath);
if (writtenImage.length !== image.length) {
  throw new Error(`Image length mismatch: expected ${image.length}, got ${writtenImage.length}`);
}
if (!writtenImage.equals(image)) {
  throw new Error('Written image differs from the bundled source');
}
