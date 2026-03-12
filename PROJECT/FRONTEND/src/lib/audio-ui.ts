export type AudioUploaderProps = {
  onUpload: (file: File) => void
}

export type AudioPlayerProps = {
  src?: string
}

export type GenreResultProps = {
  genre?: string
  confidence?: number
}
