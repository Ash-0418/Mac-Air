const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn= document.getElementById("mute");
const volumeRange= document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");


let volumeVale = 0.5;
video.volume = volumeVale;

const handelPlayClick = (e) => {
    //if the video is playing, puse it
    //else playing the video
    if(video.paused){
        video.play();
    }else{
        video.pause();
    }
    playBtn.innerText = video.paused ? "Play" : "Pause"

}


const handelmute = (e) => {
    if(video.muted){
        video.muted = false;
    }else{
        video.muted = true;
    }
    muteBtn.innerText = video.muted?  "Unmute" : "Mute";
    volumeRange.value = video.muted? 0 : volumeVale;
};

const handelVolumeChange = (event) =>{
    const {target : {value},} = event;
    if(video.muted){
        video.muted = false;
        muteBtn.innerText = "Unmute";
    }else{
        video.muted = true;
        muteBtn.innerText = "Mute";
    }
    volumeVale = value;
    video.volume = value;
};
const handeleLoadedMetadata =() =>{
    totalTime.innerText = Math.floor(video.duration);
};

playBtn.addEventListener("click", handelPlayClick);
muteBtn.addEventListener("click", handelmute);
volumeRange.addEventListener("input", handelVolumeChange);
video.addEventListener("loadedmetadata", handeleLoadedMetadata);