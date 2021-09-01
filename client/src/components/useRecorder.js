import { useEffect, useState } from "react";

const useRecorder = (updateAudioState) => {
  const [audioUrl, setAudioURL] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const audioChunks = [];
  useEffect(() => {
    // Lazily obtain recorder first time we're recording.
    if (recorder === null) {
      if (isRecording) {
        requestRecorder().then(setRecorder, console.error);
      }
      return;
    }

    // Manage recorder state.
    if (isRecording) {
      recorder.start();
    } else {
      recorder.stop();
    }

    // Obtain the audio when ready.
    const handleData = e => {
      audioChunks.push(e.data);
      // setAudioURL(URL.createObjectURL(e.data));
    };
    recorder.addEventListener("dataavailable", handleData);

    recorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks);
      setAudioBlob(audioBlob);
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl)
      });

    return () => recorder.removeEventListener("dataavailable", handleData);
  }, [recorder, isRecording]);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return [audioUrl, audioBlob, isRecording, startRecording, stopRecording];
};

async function requestRecorder() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return new MediaRecorder(stream);
}

export default useRecorder;
