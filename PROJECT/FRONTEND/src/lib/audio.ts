export type TrackStatus = "idle" | "processing" | "done"

export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "complete"
  | "recording"

export type Track = {
  id: string
  name: string
  status: TrackStatus
  originalUrl?: string
  processedUrl?: string
  originalFile?: File | Blob
  audioBuffer: AudioBuffer
  processedAudioBuffer?: AudioBuffer
  genre?: string
  confidence?: number
}
