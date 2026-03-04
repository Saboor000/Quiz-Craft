from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
import re
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a single reusable API instance (v1.x API)
ytt_api = YouTubeTranscriptApi()

def extract_video_id(url):
    # Supports various YouTube URL formats
    regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(regex, url)
    return match.group(1) if match else None


@app.route('/transcript', methods=['POST'])
def get_transcript():
    data = request.get_json() or {}
    video_url = data.get('video_url')

    if not video_url:
        logger.error('No video_url provided')
        return jsonify({'error': 'No video_url provided'}), 400

    try:
        video_id = extract_video_id(video_url)
        logger.info(f'Extracted video id: {video_id} for URL: {video_url}')
        if not video_id:
            logger.error(f'Invalid YouTube URL: {video_url}')
            return jsonify({'error': 'Invalid YouTube URL'}), 400

        # Attempt to get transcript using v1.x API
        transcript = ytt_api.fetch(video_id)
        plain_text = ' '.join([snippet.text for snippet in transcript])
        logger.info(f'Retrieved transcript length: {len(plain_text)}')
        return jsonify({'transcript': plain_text}), 200

    except Exception as e:
        # Log full exception for debugging
        logger.exception(f'Error fetching transcript for URL {video_url}: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
