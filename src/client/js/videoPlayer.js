const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videocontainer");
const videoControls = document.getElementById("videoControls");

let volumeVale = 0.5;
video.volume = volumeVale;
let videoPlayStatus = false;
let setVideoPlayStatus = false;
let controlsTimeout = null;
let controlsMovementTimeout = null;

console.log(videoContainer.dataset);


const handlePlayClick = () => {
    //if the video is playing, puse it
    //else playing the video
    if(video.paused){
        video.play();
    }else{
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause" ;

};


const handlemute = (e) => {
    if(video.muted){
        video.muted = false;
    }else{
        video.muted = true;
    }
    //muteBtn.innerText = video.muted?  "Unmute" : "Mute";
    muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
    volumeRange.value = video.muted? 0 : volumeVale;
};

const handleVolumeChange = (event) =>{
    const {target : {value},} = event;
    if(video.muted){
        video.muted = false;
       // muteBtn.innerText = "Unmute";
        
    }else{
        video.muted = true;
        //muteBtn.innerText = "Mute";
    }
    volumeVale = value;
    video.volume = value;
};

const formatTime = (seconds) => {
    const startIdx = seconds >= 3600 ? 11 : 14;
    return new Date(seconds * 1000).toISOString().substring(startIdx, 19);
    };
    

const loadeddata =() =>{
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};
const handleTimeUpdate = () =>{
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
    const {target: {value},} = event;
    if (!setVideoPlayStatus) {
        videoPlayStatus = video.paused ? false : true;
        setVideoPlayStatus = true;
        }
        video.pause();
    video.currentTime = value;
};

const handleTimelineSet = () => {
    videoPlayStatus ? video.play() : video.pause();
    setVideoPlayStatus = false;
    };

const handleFullscreen = () => {
    const fullscreen = document.fullscreenElement;
    
    if (fullscreen) {
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    } else {
      videoContainer.requestFullscreen();
      fullScreenIcon.classList = "fas fa-compress";
    }
};

const hideCondrols = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      controlsTimeout = null;
    }
    if (controlsMovementTimeout) {
      clearTimeout(controlsMovementTimeout);
      controlsMovementTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideCondrols, 3000);
  };
const handleMouseLeave = () =>{
    controlsTimeout = setTimeout(hideCondrols, 3000);
};
const handleVideoClickPlay = () => {
    handlePlayClick();
    };

const handleEnded = () => {
        const { id } = videoContainer.dataset;
        fetch(`/api/videos/${id}/view`, {
          method: "POST",
        });
    };

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handlemute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", loadeddata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("change", handleTimelineSet);
fullScreenBtn.addEventListener("click", handleFullscreen);
video.addEventListener("click", handleVideoClickPlay);
video.addEventListener("ended", handleEnded);

document.addEventListener("keyup", (event) => {
    if (event.code === "Space") {
        handlePlayClick();
        event.preventDefault();
            }
    });