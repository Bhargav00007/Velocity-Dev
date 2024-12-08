from flask import Flask, request, jsonify, send_file
import moviepy as mo  # Update the import statement to use moviepy.editor

app = Flask(__name__)

@app.route('/')
def index():
    return "Flask server is running. Use the /merge endpoint to merge video and audio."

@app.route('/merge', methods=['POST'])
def merge_video_audio():
    try:
        # Get uploaded files
        video = request.files['video']
        audio = request.files['audio']

        # Save the uploaded files locally
        video.save("uploaded_video.mp4")
        audio.save("uploaded_audio.mp3")

        # Process the files
        video_clip = mo.VideoFileClip("uploaded_video.mp4").subclipped(0, 10)  # Example range
        audio_clip = mo.AudioFileClip("uploaded_audio.mp3").subclipped(0, 10)  # Ensure this matches the video duration
        video_with_audio = video_clip.with_audio(audio_clip)

        # Save the output
        output_file = "merged_video.mp4"
        video_with_audio.write_videofile(output_file, codec="libx264", audio_codec="aac")
        

        return send_file(output_file, as_attachment=True)
    
    except Exception as e:
        # Log the error for better debugging
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
