export interface Profile {
  id: string
  email: string | null
  name: string | null
  role: 'user' | 'admin'
  created_at: string
}

export interface Video {
  id: string
  title: string
  description: string | null
  vimeo_id: string
  thumbnail_url: string | null
  genre: string | null
  tags: string[] | null
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface ViewHistory {
  id: string
  user_id: string
  video_id: string
  progress: number
  last_viewed_at: string
  video?: Video
}

export interface Favorite {
  id: string
  user_id: string
  video_id: string
  created_at: string
  video?: Video
}

export interface Comment {
  id: string
  user_id: string
  video_id: string
  content: string
  is_visible: boolean
  created_at: string
  profile?: Profile
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
      }
      videos: {
        Row: Video
        Insert: Omit<Video, 'id' | 'created_at' | 'updated_at' | 'view_count'> & {
          id?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Video>
      }
      view_history: {
        Row: ViewHistory
        Insert: Omit<ViewHistory, 'id'> & { id?: string }
        Update: Partial<ViewHistory>
      }
      favorites: {
        Row: Favorite
        Insert: Omit<Favorite, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Favorite>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Comment>
      }
    }
  }
}