import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const preview = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const file = {
    input: "recording.webm",
    output: "output.mp4",
    thumbnail: "thumbnail.jpg"
};

const init = async() =>{
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {width: 200, height:200},
    });
    preview.srcObject = stream;
    preview.play();
};

const handleDownloaded = async () =>{
    actionBtn.removeEventListener("click", handleDownloaded);
    actionBtn.innerText = "Tranforming ...";
    actionBtn.disabled = true;

    const ffmpeg = createFFmpeg({log: true});
    await ffmpeg.load();
    
    ffmpeg.FS("writeFile", file.input, await fetchFile(videoFile));

    try {
        await ffmpeg.run("-i", file.input, "-r", "60", file.output);
        await ffmpeg.run("-i", file.input, "-ss", "00:00:01", "-frames:v", "1", file.thumbnail);
    } catch (e) {
        console.error('Error processing video with FFmpeg:', e);
    };
    
    const download = (fileURL, fileName) =>{
        const a = document.createElement("a");
        a.href = fileURL;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
    };

    const files = ffmpeg.FS('readdir', '/');
    if (files.includes(file.output)) {
        const mp4File = ffmpeg.FS('readFile', file.output);
    } else {
    console.error('File not found:', file.output);
    }


    const mp4File = ffmpeg.FS("readFile",file.output);
    const thumbFile = ffmpeg.FS("readFile", file.thumbnail)
    //console.log(thumbFile);
    //console.log(mp4File.buffer);
    const mp4Blob = new Blob([mp4File.buffer], {type:"video/mp4"});
    const mp4URL = URL.createObjectURL(mp4Blob);
    const thumbBlob = new Blob([thumbFile.buffer], {type:"image/jpg"});
    const thumbURL = URL.createObjectURL(thumbBlob);

    download(mp4URL, "My recording.mp4");
    download(thumbURL, "MyThumbnail.jpg");




    ffmpeg.FS("unlink", file.input);
    ffmpeg.FS("unlink", file.output);
    ffmpeg.FS("unlink", file.thumbnail);
  
    URL.revokeObjectURL(mp4URL);
    URL.revokeObjectURL(thumbURL);
    URL.revokeObjectURL(videoFile);

};

const handleStop = () =>{
    actionBtn.innerText = "Download Recording";
    actionBtn.removeEventListener("click", handleStop);
    actionBtn.addEventListener("click", handleDownloaded);
};

const handleStart = async() =>{
    actionBtn.innerText = "Stop recoding"
    actionBtn.removeEventListener("click", handleStart);
    actionBtn.addEventListener("click", handleStop);

    await init();  // 스트림 초기화를 기다립니다.

    if (!stream || !(stream instanceof MediaStream)) {
    console.error("Provided stream is not valid.");
    return;
}

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
        videoFile =URL.createObjectURL(event.data);
        preview.srcObject = null;
        preview.src = videoFile;
        preview.loop = true;
        preview.play();
    };
    recorder.start();
    //setTimeout(() =>{
    //    recorder.stop();
    //},10000);
    
};



actionBtn.addEventListener("click", handleStart);
