const consoleWrap = document.getElementById('r-console');
let isAnimating = false;

/* 动画控制 */
// 显示控制台
function showConsole() {
    if (isAnimating || consoleWrap.style.display !== 'none') return;
    
    isAnimating = true;
    consoleWrap.style.removeProperty('display');
    consoleWrap.classList.add('animated', 'showInUp');
    
    // 使用动画结束事件替代定时器
    const onFadeInEnd = () => {
        consoleWrap.style.backgroundColor = '#00000080';
        consoleWrap.classList.remove('showInUp');
        consoleWrap.removeEventListener('animationend', onFadeInEnd);
        isAnimating = false;
    };
    
    consoleWrap.addEventListener('animationend', onFadeInEnd);
}

// 隐藏控制台
function hideConsole() {
    if (isAnimating || consoleWrap.style.display === 'none') return;
    
    isAnimating = true;
    consoleWrap.offsetHeight; // 强制重排
    consoleWrap.classList.add('bounceOutRight');
    
    // 使用动画结束事件替代定时器
    consoleWrap.style.backgroundColor = 'transparent';
    const onFadeOutEnd = () => {
        consoleWrap.style.display = 'none';
        consoleWrap.classList.remove('animated', 'bounceOutRight');
        consoleWrap.removeEventListener('animationend', onFadeOutEnd);
        isAnimating = false;
    };
    
    consoleWrap.addEventListener('animationend', onFadeOutEnd);
}

// 切换控制台显示状态
function switchConsole() {
    if (consoleWrap.style.display === 'none') {
        showConsole();
    } else {
        hideConsole();
    }
}

// 点击控制台外部时隐藏
consoleWrap.addEventListener('click', (event) => {
    if (event.target === consoleWrap) {
        hideConsole();
    }
});
/* 动画控制 end */


class Pixel {
    constructor(canvas, context, x, y, color, speed, delay) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = context;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = this.getRandomValue(0.1, 0.9) * speed;
        this.size = 0;
        this.sizeStep = Math.random() * 0.4;
        this.minSize = 0.5;
        this.maxSizeInteger = 2;
        this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
        this.delay = delay;
        this.counter = 0;
        this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
        this.isIdle = false;
        this.isReverse = false;
        this.isShimmer = false;
    }

    getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }

    draw() {
        const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;

        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(
        this.x + centerOffset,
        this.y + centerOffset,
        this.size,
        this.size
        );
    }

    appear() {
        this.isIdle = false;

        if (this.counter <= this.delay) {
        this.counter += this.counterStep;
        return;
        }

        if (this.size >= this.maxSize) {
        this.isShimmer = true;
        }

        if (this.isShimmer) {
        this.shimmer();
        } else {
        this.size += this.sizeStep;
        }

        this.draw();
    }

    disappear() {
        this.isShimmer = false;
        this.counter = 0;

        if (this.size <= 0) {
        this.isIdle = true;
        return;
        } else {
        this.size -= 0.1;
        }

        this.draw();
    }

    shimmer() {
        if (this.size >= this.maxSize) {
        this.isReverse = true;
        } else if (this.size <= this.minSize) {
        this.isReverse = false;
        }

        if (this.isReverse) {
        this.size -= this.speed;
        } else {
        this.size += this.speed;
        }
    }
    }

    class PixelCanvas extends HTMLElement {
    static register(tag = "pixel-canvas") {
        if ("customElements" in window) {
        customElements.define(tag, this);
        }
    }

    static css = `
        :host {
        display: grid;
        inline-size: 100%;
        block-size: 100%;
        overflow: hidden;
        }
    `;

    get colors() {
        return this.dataset.colors?.split(",") || ["#f8fafc", "#f1f5f9", "#cbd5e1"];
    }

    get gap() {
        const value = this.dataset.gap || 5;
        const min = 4;
        const max = 50;

        if (value <= min) {
        return min;
        } else if (value >= max) {
        return max;
        } else {
        return parseInt(value);
        }
    }

    get speed() {
        const value = this.dataset.speed || 35;
        const min = 0;
        const max = 100;
        const throttle = 0.001;

        if (value <= min || this.reducedMotion) {
        return min;
        } else if (value >= max) {
        return max * throttle;
        } else {
        return parseInt(value) * throttle;
        }
    }

    get noFocus() {
        return this.hasAttribute("data-no-focus");
    }

    connectedCallback() {
        const canvas = document.createElement("canvas");
        const sheet = new CSSStyleSheet();

        this._parent = this.parentNode;
        this.shadowroot = this.attachShadow({ mode: "open" });

        sheet.replaceSync(PixelCanvas.css);

        this.shadowroot.adoptedStyleSheets = [sheet];
        this.shadowroot.append(canvas);
        this.canvas = this.shadowroot.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.timeInterval = 1000 / 60;
        this.timePrevious = performance.now();
        this.reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
        ).matches;

        this.init();
        this.resizeObserver = new ResizeObserver(() => this.init());
        this.resizeObserver.observe(this);

        this._parent.addEventListener("mouseenter", this);
        this._parent.addEventListener("mouseleave", this);

        if (!this.noFocus) {
        this._parent.addEventListener("focusin", this);
        this._parent.addEventListener("focusout", this);
        }
    }

    disconnectedCallback() {
        this.resizeObserver.disconnect();
        this._parent.removeEventListener("mouseenter", this);
        this._parent.removeEventListener("mouseleave", this);

        if (!this.noFocus) {
        this._parent.removeEventListener("focusin", this);
        this._parent.removeEventListener("focusout", this);
        }

        delete this._parent;
    }

    handleEvent(event) {
        this[`on${event.type}`](event);
    }

    onmouseenter() {
        this.handleAnimation("appear");
    }

    onmouseleave() {
        this.handleAnimation("disappear");
    }

    onfocusin(e) {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        this.handleAnimation("appear");
    }

    onfocusout(e) {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        this.handleAnimation("disappear");
    }

    handleAnimation(name) {
        cancelAnimationFrame(this.animation);
        this.animation = this.animate(name);
    }

    init() {
        const rect = this.getBoundingClientRect();
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        this.pixels = [];
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.createPixels();
    }

    getDistanceToCanvasCenter(x, y) {
        const dx = x - this.canvas.width / 2;
        const dy = y - this.canvas.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance;
    }

    createPixels() {
        for (let x = 0; x < this.canvas.width; x += this.gap) {
        for (let y = 0; y < this.canvas.height; y += this.gap) {
            const color = this.colors[
            Math.floor(Math.random() * this.colors.length)
            ];
            const delay = this.reducedMotion
            ? 0
            : this.getDistanceToCanvasCenter(x, y);

            this.pixels.push(
            new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay)
            );
        }
        }
    }

    animate(fnName) {
        this.animation = requestAnimationFrame(() => this.animate(fnName));

        const timeNow = performance.now();
        const timePassed = timeNow - this.timePrevious;

        if (timePassed < this.timeInterval) return;

        this.timePrevious = timeNow - (timePassed % this.timeInterval);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.pixels.length; i++) {
        this.pixels[i][fnName]();
        }

        if (this.pixels.every((pixel) => pixel.isIdle)) {
        cancelAnimationFrame(this.animation);
        }
    }
}
PixelCanvas.register();

// 侧边栏切换
function swtichSidebar() {
    const joeContainer = document.querySelector('.joe_main_container');
    joeContainer.classList.toggle('revert');
}

// 背景切换
function swtichBackgroud() {
    document.body.classList.toggle('console-no-bg');
}

let nowMusicIndex = -1; // 当前音乐索引
let isMusicStop = true; // 是否暂停
let consoleAplayer = null;
let consoleVolume = 0.15;
function musicInit() {
    consoleAplayer = document.querySelector("meting-js")?.aplayer;
    if(!consoleAplayer) {
        return false;
    }
    consoleAplayer.list.clear();
    consoleMusics.forEach(music => {
        consoleAplayer.list.add([
            {
                name: music.realNode.music_name,
                artist: music.realNode.music_artist,
                url: music.realNode.music_url,
                cover: music.realNode.music_cover ? music.realNode.music_cover : '',
                lrc: music.realNode.music_lrc ? music.realNode.music_lrc : '/res/files/pure_music.lrc',
                theme: '#ebd0c2'
            }
        ]);
    });
    consoleAplayer.volume(consoleVolume, false);
    consoleAplayer.on('ended', function () {
        musicSwitchEvent((nowMusicIndex + 1) % consoleMusics.length);
    });
    consoleAplayer.on('pause', function () {
        musicPauseEvent();
    });
    consoleAplayer.on('play', function () {
        if(nowMusicIndex !== -1) {
            musicRePlayEvent();
        }
    });
    return true;
}

function musicPlay(e, index) {
    if (nowMusicIndex === -1) { // 播放
        const initResult = musicInit();
        if(initResult === false) {
            console.error('控制面板音乐播放器初始化失败');
            return;
        }
        musicStart(index);
    }
    else if (nowMusicIndex === index) {  // 暂停
        if(isMusicStop) {
            musicPause();
        }
        else {
            musicRePlay();
        }
    }
    else { // 切歌
        musicSwitch(index);
    }
}

function musicStart(index) {
    consoleAplayer.list.switch(index);
    document.getElementById("nav-music-hoverTips").click();
    nowMusicIndex = index;
    musicStartEvent();
}

function musicPause() {
    consoleAplayer.pause();
}

function musicRePlay() {
    consoleAplayer.play();
}

function musicSwitch(index) {
    consoleAplayer.pause();
    consoleAplayer.list.switch(index);
    consoleAplayer.play();
    musicSwitchEvent(index);
}

function musicStartEvent() {
    document.getElementById(`start-${nowMusicIndex}`).classList = "hidding";
    document.getElementById(`playing-${nowMusicIndex}`).classList = "showing";
}

function musicPauseEvent() {
    document.getElementById(`pause-${nowMusicIndex}`).classList = "showing";
    document.getElementById(`playing-${nowMusicIndex}`).classList = "hidding";
    isMusicStop = false;
}

function musicRePlayEvent() {
    document.getElementById(`pause-${nowMusicIndex}`).classList = "hidding";
    document.getElementById(`playing-${nowMusicIndex}`).classList = "showing";
    isMusicStop = true;
}

function musicSwitchEvent(index) {
    document.getElementById(`pause-${nowMusicIndex}`).classList = "hidding";
    document.getElementById(`playing-${nowMusicIndex}`).classList = "hidding";
    document.getElementById(`start-${nowMusicIndex}`).classList = "hovering";

    nowMusicIndex = index;
    isMusicStop = true;
    document.getElementById(`start-${index}`).classList = "hidding";
    document.getElementById(`playing-${index}`).classList = "showing";
}

document.addEventListener("DOMContentLoaded", function () {
    // 点赞按钮
    function initConsoleLike() {
        window.encryption = (str) => window.btoa(unescape(encodeURIComponent(str)));
        window.decrypt = (str) => decodeURIComponent(escape(window.atob(str)));

        const consolePosts = document.querySelectorAll(".console-post-like");
        let agreeArr = localStorage.getItem(encryption("agree"))
            ? JSON.parse(decrypt(localStorage.getItem(encryption("agree")))) : [];

        consolePosts.forEach((post) => {
            const cid = post.dataset.cid;
            let flag = agreeArr.includes(cid);

            const postTitle = post.querySelector(".r-underline");
            const Icon = post.querySelector(".console-icon-wrap");
            const consoleIconLike = Icon.querySelector(".console-icon-like");
            const consoleIconLiked = Icon.querySelector(".console-icon-liked");
            if (flag) {
                consoleIconLiked.classList.add("active");
            } else {
                consoleIconLike.classList.add("active");
            }

            Icon.addEventListener("click", function (e) {
                e.stopPropagation();

                if(!flag) {
                    $.ajax({
                        url: "/apis/api.halo.run/v1alpha1/trackers/upvote",
                        type: "post",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify({
                            group: "content.halo.run",
                            plural: "posts",
                            name: cid,
                        }),
                    })
                    .then((_res) => {
                        console.log('like++');
                        agreeArr.push(cid);

                        consoleIconLike.classList.remove("active");
                        consoleIconLiked.classList.add("active");

                        const name = encryption("agree");
                        const val = encryption(JSON.stringify(agreeArr));
                        localStorage.setItem(name, val);
                        flag = true;
                    })
                    .catch((err) => {
                        _loading = false;
                    });
                }
                
            });

            Icon.addEventListener('mouseenter', function() {
                postTitle.style.color = "#fff";
            });
            Icon.addEventListener('mouseleave', function() {
                postTitle.style.removeProperty('color');
            });
        });
    }
    initConsoleLike();

    // 音量控制
    document.getElementById('console-volume-btn').addEventListener('click', function() {
        document.getElementById('console-volume-container').classList.toggle('hidden');
    });
    document.getElementById('console-volume-slider').addEventListener('input', function() {
        consoleVolume = this.value / 100;
        document.getElementById('console-volume-percentage').textContent = this.value;
        if(consoleAplayer) {
            consoleAplayer.volume(consoleVolume, false);
        }
    });
    consoleWrap.addEventListener('click', (event) => {
        if (!document.getElementById('console-volume-control').contains(event.target)) {
            if(!document.getElementById('console-volume-container').classList.contains('hidden')) {
                document.getElementById('console-volume-container').classList.add('hidden');
            }
        }
    });
});