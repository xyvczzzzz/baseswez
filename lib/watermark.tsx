import fs from 'fs';
import { tmpdir } from "os";
import Crypto from "crypto";
import ff from 'fluent-ffmpeg';
import webp from "node-webpmux";
import path from "path";
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
interface MediaData {
    mimetype: string;
    data: Buffer;
}

let file = require.resolve(__filename);

interface StickerMetadata {
    packname?: string;
    author?: string;
    categories?: string[];
}

async function imageToWebp(media: Buffer): Promise<Buffer> {
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`)
    fs.writeFileSync(tmpFileIn, media)
    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
            ])
            .toFormat("webp")
            .save(tmpFileOut)
    })

    const buff = fs.readFileSync(tmpFileOut)
    fs.unlinkSync(tmpFileOut)
    fs.unlinkSync(tmpFileIn)
    return buff
}

/**
 * Convert video to WebP format
 * @param media - Video buffer
 * @returns WebP buffer
 */
async function videoToWebp(media: Buffer): Promise<Buffer> {
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)

    fs.writeFileSync(tmpFileIn, media)

    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                "-loop",
                "0",
                "-ss",
                "00:00:00",
                "-t",
                "00:00:05",
                "-preset",
                "default",
                "-an",
                "-vsync",
                "0"
            ])
            .toFormat("webp")
            .save(tmpFileOut)
    })

    const buff = fs.readFileSync(tmpFileOut)
    fs.unlinkSync(tmpFileOut)
    fs.unlinkSync(tmpFileIn)
    return buff
}

async function writeExifImg(media: Buffer, metadata: StickerMetadata): Promise<string | undefined> {
    let wMedia = await imageToWebp(media)
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    fs.writeFileSync(tmpFileIn, wMedia)

    if (metadata.packname || metadata.author) {
        const img = new webp.Image()
        const json = { 
            "sticker-pack-id": `https://github.com/xyzendev/xyzen.cjs`, 
            "sticker-pack-name": metadata.packname, 
            "sticker-pack-publisher": metadata.author, 
            "emojis": metadata.categories ? metadata.categories : [""] 
        }
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
        const exif = Buffer.concat([exifAttr, jsonBuff])
        exif.writeUIntLE(jsonBuff.length, 14, 4)
        await img.load(tmpFileIn)
        fs.unlinkSync(tmpFileIn)
        img.exif = exif
        await img.save(tmpFileOut)
        return tmpFileOut
    }
}

async function writeExifVid(media: Buffer, metadata: StickerMetadata): Promise<string | undefined> {
    let wMedia = await videoToWebp(media)
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    fs.writeFileSync(tmpFileIn, wMedia)

    if (metadata.packname || metadata.author) {
        const img = new webp.Image()
        const json = { 
            "sticker-pack-id": `https://github.com/xyzendev/xyzen.cjs`, 
            "sticker-pack-name": metadata.packname, 
            "sticker-pack-publisher": metadata.author, 
            "emojis": metadata.categories ? metadata.categories : [""] 
        }
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
        const exif = Buffer.concat([exifAttr, jsonBuff])
        exif.writeUIntLE(jsonBuff.length, 14, 4)
        await img.load(tmpFileIn)
        fs.unlinkSync(tmpFileIn)
        img.exif = exif
        await img.save(tmpFileOut)
        return tmpFileOut
    }
}

async function writeExif(media: MediaData, metadata: StickerMetadata): Promise<string | undefined> {
    let wMedia: Buffer;
    
    if (/webp/.test(media.mimetype)) {
        wMedia = media.data;
    } else if (/image/.test(media.mimetype)) {
        wMedia = await imageToWebp(media.data);
    } else if (/video/.test(media.mimetype)) {
        wMedia = await videoToWebp(media.data);
    } else {
        throw new Error("Unsupported media type");
    }
    
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    fs.writeFileSync(tmpFileIn, wMedia)

    if (metadata.packname || metadata.author) {
        const img = new webp.Image()
        const json = { 
            "sticker-pack-id": `https://github.com/xyzendev/xyzen.cjs`, 
            "sticker-pack-name": metadata.packname, 
            "sticker-pack-publisher": metadata.author, 
            "emojis": metadata.categories ? metadata.categories : [""] 
        }
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
        const exif = Buffer.concat([exifAttr, jsonBuff])
        exif.writeUIntLE(jsonBuff.length, 14, 4)
        await img.load(tmpFileIn)
        fs.unlinkSync(tmpFileIn)
        img.exif = exif
        await img.save(tmpFileOut)
        return tmpFileOut
    }
}

export { 
    imageToWebp, 
    videoToWebp, 
    writeExifImg, 
    writeExifVid, 
    writeExif,
    MediaData,
    StickerMetadata
};

export default {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    writeExif
};