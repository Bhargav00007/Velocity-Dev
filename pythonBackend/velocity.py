from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import librosa
from moviepy.editor import VideoFileClip, concatenate_videoclips, vfx
import os

app = Flask(__name__)
CORS(app)  # Add CORS support

# Function to detect beats using Librosa
def detect_beats(audio_path):
    """
    Detects beats in an audio file using Librosa.
    :param audio_path: Path to the audio file.
    :return: A list of timestamps (in seconds) where beats occur.
    """
    try:
        y, sr = librosa.load(audio_path, sr=None)
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beat_frames, sr=sr)

        # Ensure correct formatting for logging
        tempo = float(tempo)
        beat_times_list = beat_times.tolist()
        print(f"Detected {len(beat_times_list)} beats at a tempo of {tempo:.2f} BPM.")
        print(f"First few beat timestamps: {', '.join(f'{t:.2f}' for t in beat_times_list[:5])}...")
        return beat_times_list
    except Exception as e:
        raise RuntimeError(f"Error during beat detection: {str(e)}")

# Function to create a velocity-edited video
def create_velocity_edit(input_video_path, input_audio_path, output_video_path, slow_factor=0.5, fast_factor=2):
    """
    Create a velocity-edited video by alternating slow and fast motion between beats.
    :param input_video_path: Path to the input video file.
    :param input_audio_path: Path to the input audio file.
    :param output_video_path: Path to save the output video.
    :param slow_factor: Speed factor for slow motion.
    :param fast_factor: Speed factor for fast motion.
    """
    clips = []  # Initialize clips list
    try:
        beats = detect_beats(input_audio_path)

        with VideoFileClip(input_video_path) as video:
            # Ensure FPS is set properly
            if not hasattr(video, 'fps') or video.fps is None or video.fps == 0:
                print("FPS is missing or invalid. Setting a default FPS of 30.")
                video = video.set_fps(30)
            else:
                print(f"Video FPS: {video.fps}")

            # Debugging
            print(f"Video duration: {video.duration}")
            print(f"Video size: {video.size}")

            total_duration = video.duration
            beats = [0] + [t for t in beats if t < total_duration] + [total_duration]

            for i in range(len(beats) - 1):
                start_time = beats[i]
                end_time = beats[i + 1]
                segment = video.subclip(start_time, end_time)

                # Apply velocity effects (alternate slow and fast)
                if i % 2 == 0:
                    segment = segment.fx(vfx.speedx, slow_factor)
                else:
                    segment = segment.fx(vfx.speedx, fast_factor)

                clips.append(segment)

            # Concatenate the clips
            final_clip = concatenate_videoclips(clips, method="compose")

            # Add audio
            with VideoFileClip(input_audio_path) as audio_clip:
                final_clip = final_clip.set_audio(audio_clip.audio)

            # Write the output video file
            final_clip.write_videofile(output_video_path, codec="libx264", audio_codec="aac")
    except Exception as e:
        print(f"Error during velocity edit: {str(e)}")
        raise RuntimeError(f"Error during velocity edit: {str(e)}")
    finally:
        # Cleanup
        for clip in clips:
            try:
                clip.close()
            except Exception as clip_cleanup_error:
                print(f"Error closing clip: {clip_cleanup_error}")

# Flask API Endpoint
@app.route('/velocity-edit', methods=['POST'])
def velocity_edit_endpoint():
    """
    API endpoint to process video and audio files for velocity editing.
    """
    try:
        # Ensure video and audio files are provided
        video_file = request.files.get('video')
        audio_file = request.files.get('audio')

        if not video_file or not video_file.filename.endswith(('.mp4', '.mov')):
            return jsonify({"error": "Invalid video file format. Only .mp4 or .mov allowed."}), 400
        if not audio_file or not audio_file.filename.endswith(('.mp3', '.wav')):
            return jsonify({"error": "Invalid audio file format. Only .mp3 or .wav allowed."}), 400

        # Define temporary file paths
        video_path = "uploaded_video.mp4"
        audio_path = "uploaded_audio.mp3"
        output_video_path = "velocity_edit.mp4"

        # Save uploaded files
        video_file.save(video_path)
        audio_file.save(audio_path)

        # Call the velocity edit function
        create_velocity_edit(video_path, audio_path, output_video_path)

        # Send the edited video as a response
        return send_file(output_video_path, as_attachment=True)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up temporary files
        for temp_file in ["uploaded_video.mp4", "uploaded_audio.mp3", "velocity_edit.mp4"]:
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception as cleanup_error:
                    print(f"Error cleaning up {temp_file}: {cleanup_error}")

if __name__ == "__main__":
    app.run(debug=True)