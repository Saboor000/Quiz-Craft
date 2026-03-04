#!/usr/bin/env python
import re
from youtube_transcript_api import YouTubeTranscriptApi

def extract_video_id(url):
    # Supports various YouTube URL formats
    regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(regex, url)
    return match.group(1) if match else None

# Test with the video URL that's failing
video_url = "https://www.youtube.com/watch?v=KaLKyK7LDdA"
video_id = extract_video_id(video_url)

print(f"Video URL: {video_url}")
print(f"Extracted Video ID: {video_id}")

try:
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    print(f"✅ Successfully fetched transcript ({len(transcript)} entries)")
    plain_text = ' '.join([entry['text'] for entry in transcript])
    print(f"Transcript text length: {len(plain_text)} characters")
    print(f"First 200 chars: {plain_text[:200]}")
except Exception as e:
    print(f"❌ Error: {type(e).__name__}")
    print(f"Message: {str(e)}")
