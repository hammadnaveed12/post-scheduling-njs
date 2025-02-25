'use client'
import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";

type VideoThumbnailSelectorProps = {
  videoFile: File;
  selectedThumbnail:string | null,
  setSelectedThumbnail:Dispatch<SetStateAction<string | null>>
  setLoading:Dispatch<SetStateAction<boolean>>,
  thumbnails:string[], setThumbnails:Dispatch<SetStateAction<string[]>>
};

export default function VideoThumbnailSelector({ videoFile, selectedThumbnail, setSelectedThumbnail, thumbnails, setThumbnails  ,setLoading }: VideoThumbnailSelectorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoFile && thumbnails.length < 1) {
      generateThumbnails(videoFile);
    }
  }, [videoFile, thumbnails]);

  const generateThumbnails = (file: File) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.crossOrigin = "anonymous";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const captureTimes = [duration *0.1, duration * 0.25, duration * 0.5, duration * 0.75, duration];
      const tempThumbnails: string[] = [];
        console.log('duration', duration)
        setLoading(true)
      captureTimes.forEach((time, index) => {
        setTimeout(() => {
          video.currentTime = time;
          console.log('video.currentTime', video.currentTime)

        }, index * 500);
      });
      
      video.onseeked = () => {
        console.log('on seeked' )   
        console.log(video.width)

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = 480;
        canvas.height = 270;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        tempThumbnails.push(canvas.toDataURL("image/png"));
        if (tempThumbnails.length === captureTimes.length) {
            setLoading(false)

          setThumbnails(tempThumbnails);
        }
      };
    };
  };

  return (
    <div className="p-4">
      {videoFile && thumbnails.length < 1 && (
        <video ref={videoRef} src={URL.createObjectURL(videoFile)} controls className="w-full mb-4" />
      )}
      <div className="flex gap-2 flex-wrap overflow-hidden">
        {thumbnails.map((thumb, index) => (
          <img
            key={index}
            src={thumb}
            alt={`Thumbnail ${index + 1}`}
            className={`w-40 h-full  cursor-pointer border-2 ${
              selectedThumbnail === thumb ? "border-blue-500" : "border-transparent"
            }`}
            onClick={() => setSelectedThumbnail(thumb)}
          />
        ))}
      </div>
      {selectedThumbnail && (
        <div className="mt-4">
          <p>Selected Thumbnail:</p>
          <img src={selectedThumbnail} alt="Selected" className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
