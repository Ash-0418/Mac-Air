const startBtn = document.getElementById("startBtn");
const preview = document.getElementById("preview");

let stream;
let recoder;
let videoFile;

const handleDownloaded = (event) =>{
    const a = document.createElement("a");
    a.href = videoFile;
    a.download = "MyRecordgin.webm";
    document.body.appendChild(a);
    a.click();
};

const handleStop = () =>{
    startBtn.innerText = "Download recoding"
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleDownloaded);
    recoder.stop();
};

const handleStart = () =>{
    startBtn.innerText = "Stop recoding"
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);
    recoder = new MediaRecorder(stream);
    recoder.ondataavailable = (event) => {
        videoFile =URL.createObjectURL(event.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop();
        video.play();
    };
    recoder.start();
    setTimeout(() =>{
        recoder.stop();
    },10000);
    
};


const init = async() =>{
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {width: 200, height:200},
    });
    preview.srcObject = stream;
    preview.play();
};
init();

startBtn.addEventListener("click", handleStart);