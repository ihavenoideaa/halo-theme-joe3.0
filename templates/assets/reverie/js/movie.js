const spinner = document.querySelector('#spinner');

function createStarRating(rating) {
    let starHtml = '';
    let starLeft = 5;
    while (rating >= 2) {
        starHtml += `<i class="fa-solid fa-star text-amber-400"></i>`;
        rating -= 2;
        starLeft--;
    }
    if (rating >= 0.5) {
        starHtml += `<i class="fa-solid fa-star-half-stroke text-amber-400"></i>`;
        starLeft--;
    }
    while(starLeft > 0) {
        starHtml += `<i class="fa-regular fa-star text-amber-400"></i>`;
        starLeft--;
    }

    return starHtml;
}

async function createCardHtml(movie, index) {
    const rating = movie.rating;
    const starRating = createStarRating(rating);
    const imageUrl = movie.cover;
    const doubanUrl = movie.external_resources.find(item => item.url.includes("douban"));
    const detialUrl = doubanUrl ? doubanUrl.url : `https://neodb.social${movie.url}`;

    const imgColor = movie.cover_color;

    return `
    <div class="frontWeb lazypic" data-bg="${imageUrl}"> 
            <p style=" text-shadow: 0 0 20px rgba(${imgColor[0]}, ${imgColor[1]}, ${imgColor[2]}, 1),
             0 0 40px rgba(${imgColor[0]}, ${imgColor[1]}, ${imgColor[2]}, 1), 0 0 60px rgba(${imgColor[0]}, ${imgColor[1]}, ${imgColor[2]}, 1);;">${movie.title}</p>
        </div>

        <div class="back px-2 text-black lazypic" data-bg="${imageUrl}">
            <div class="back-content flex flex-col">
                <div class="text-lg/loose font-extrabold leading-6">${movie.title}</div>
                <div class="text-base/2 font-[500] mt-2">${movie.area?movie.area[0]:""} ${movie.language[0]} (${movie.year})</div>
                <div>
                    ${starRating}
                    <span class="pl-1">${rating}</span>
                </div>
                <p class="w-full font-[500] mt-1 leading-4 text-black line-clamp-4">${movie.description}</p>
                <a class="w-auto mx-5 py-1 mt-2 bg-[#2f54eb9c] rounded-lg text-white" target="_blank" 
                    href="${detialUrl}">Details</a>
                <button id="show_more" data-id="${index}" class="w-auto mx-5 py-1 mt-1 bg-[#2f54eb9c] rounded-lg text-white">Show Mine</button>
            </div>
        </div>
    `;
}

async function createCards(movies) {
    const cardContainer = document.querySelector('.card_container');
    for (const [index, movie] of movies.data.entries()) {
        const divItem = document.createElement('div');
        divItem.className = "card relative overflow-hidden rounded aspect-[2/3] timeline-item animated wow";
        divItem.setAttribute('data-wow-delay', `0.${index/4}s`);
        divItem.setAttribute('data-cid', "movie");

        const html = await createCardHtml(movie, index);
        divItem.innerHTML = html;
        cardContainer.appendChild(divItem);
    }
}

async function fetchMovies(urlEndpoint) {
    try {
        const response = await fetch(urlEndpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    let movies;
    try {
        spinner.setAttribute("hidden", "");
        movies = await fetchMovies(movieJsonFile);
        if (movies) {
            await createCards(movies);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    
    // show mine 点击事件
    const overlay = document.querySelector('.overlay');
    const showDetailButtons = document.querySelectorAll('#show_more');
    showDetailButtons.forEach(item => {
        item.addEventListener('click', (event) => {
            const movie_info = movies.data[event.target.dataset.id];

            overlay.querySelector(".movie-cover").innerHTML=`
                <img class="md:w-56" src="${movie_info.cover}" alt="A Quiet Place movie poster" />`;
            const color = movie_info.cover_color;
            const info_block = overlay.querySelector('.movie-info-block');
            info_block.style.backgroundColor = `rgba(${color[0]},${color[1]},${color[2]})`

            let isDark = getContrastYIQ(color[0], color[1], color[2]);
            info_block.style.color = isDark ? 'black' : 'white';

            info_block.querySelector(".star-title").style.color = isDark ? '#434343' : '#adb5bd';
            info_block.querySelector(".comment-title").style.color = isDark ? '#434343' : '#adb5bd';


            overlay.querySelector('.movie-title').textContent = movie_info.title;
            overlay.querySelector('.movie-create_time').textContent = Utils.formatDate(movie_info.created_time, "yyyy年MM月dd日");

            overlay.querySelector('.movie-comment_stars').innerHTML = `🚩 ${createStarRating(movie_info.rating_grade)}`;
            
            let grade = movie_info.rating_grade;
            let gread_comment = grade==10 ? " 我给满分✨": (grade>=8 ? `👍🏻`:"")
            overlay.querySelector('.movie-rating_grade').innerHTML = `${movie_info.rating_grade} / 10 ${gread_comment}`;

            overlay.querySelector('.movie-comment').textContent = `🔴 ${movie_info.comment_text?movie_info.comment_text:"忘记评论了"}`;


            overlay.querySelector('.site-list').innerHTML = `
                <a class="neodb" href="${movie_info.url}" rel="noopener noreferrer">NeoDB</a>
                ${externalUrl(movie_info.external_resources)}`;

            overlay.style.display = 'flex';
        });
    })
    const closeDetailButton = document.getElementById('close-detail');
    closeDetailButton.addEventListener('click', () => {
        overlay.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === overlay) {
            overlay.style.display = 'none';
        }
    });

    // 图片懒加载
    const allImages = document.querySelectorAll('.lazypic');
    const normalLoadLimit = 20;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const imageUrl = entry.target.dataset.bg;
                entry.target.style.backgroundImage = `url(${imageUrl})`;
                entry.target.classList.remove('lazypic');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    allImages.forEach((image, index) => {
        if (index < normalLoadLimit) {
            const imageUrl = image.dataset.bg;
            image.style.backgroundImage = `url(${imageUrl})`;
            image.classList.remove('lazypic');
        } else {
            observer.observe(image);
        }
    });

    // 电影台词处理
    updateLineContent();

    // loading screen
    function hideLoadingScreen() {
        tl.pause(); // 暂停GSAP时间线动画
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.classList.add('fade-out');
    }
    requestAnimationFrame(() => {
        setTimeout(hideLoadingScreen, 2000);
    });
});

// 显示电影台词
async function updateLineContent() {
    try {
        const lineUrl = memosLinesApi;
        const response = await fetch(lineUrl);
        const { memos } = await response.json();
        const linesContent = [];
        const linesLength = memos.length;
    
        for (let index = 0; index < memos.length; index++) {
            linesContent.push(memos[index].content.replace(/#.*?\n/, ''));
        }
    
        if(memos && memos.length > 0) {
            const lineDom = document.querySelector('#lines-content');
            let index = 0;
            function updateText() {
                lineDom.textContent = linesContent[index];
                index = (index + 1) % linesLength;
            }
            updateText();
            requestAnimationFrame(() => {
                setInterval(updateText, 8000);
            });
        }

        $('.movie-lines').hover(
            function () {
                $(this).find('#lines-content').removeClass('line-clamp-1')
            },
            function () {
                $(this).find('#lines-content').addClass('line-clamp-1')
            }
        )
    }
    catch (error) {
        console.error('updateLineContent Error:', error);
    }
}

function getContrastYIQ(r, g, b) {
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128);
}

function externalUrl(urls){
    let html = "";
    urls.forEach(item => {
        if(item.url.includes("douban")) {
            html += `<a class="douban" href="${item.url}" target="_blank" rel="noopener noreferrer">豆瓣</a>`
        }
        else if(item.url.includes("imdb")) {
            html += `<a class="imdb" href="${item.url}" target="_blank" rel="noopener noreferrer">IMDB</a>`
        }
        else if(item.url.includes("tmdb")) {
            html += `<a class="tmdb" href="${item.url}" target="_blank" rel="noopener noreferrer">TMDB</a>`
        }
    })
    return html;
}


// loading
var title = document.getElementById('main-title').cloneNode(true);
document.querySelector('.titleCont').appendChild(title);
title.classList.add("overTitle")
var line = document.createElement('div');
line.className = 'line';
document.getElementById('main-content').appendChild(line); 

var tl = new TimelineMax({repeat:-1});

for(var i=50; i--;){
  tl.to(title,R(0.03,0.17),{opacity:R(0,1),y:R(-1.5,1.5), x:R(-1.5,1.5)})
};

tl.to(line,tl.duration()/2,{opacity:R(0.1,1),x:R(-window.innerWidth/2,window.innerWidth/2),ease:RoughEase.ease.config({strength:0.5,points:10,randomize:true,taper: "none"}),repeat:1},0);
  var dot;
  for (var i=0; i < 10; i++){
    dot = document.createElement('div');
    dot.className = 'dot';
    document.getElementById('main-content').prepend(dot); 
    setDotPosition(dot);
    tl.to(dot,0.1,{opacity:0,repeat:1, yoyo:true, onComplete:setDotPosition, onCompleteParams:[dot], ease:RoughEase.ease.config({strength:0.5,points:10,randomize:true,taper: "none"})},0);
  }

function setDotPosition(dot)
{
    TweenMax.set(dot, {x:R(-window.innerWidth/2,window.innerWidth/2),y:R(-window.innerHeight,window.innerHeight), delay:R(0, 1)});
}

function R(max,min){return Math.random()*(max-min)+min};

const noise = () => {
    let canvas, ctx;
    let wWidth, wHeight;
    let noiseData = [];
    let frame = 0;
    let loopTimeout;
    // Create Noise
    const createNoise = () => {
        const idata = ctx.createImageData(wWidth, wHeight);
        const buffer32 = new Uint32Array(idata.data.buffer);
        const len = buffer32.length;
        for (let i = 0; i < len; i++) {
            if (Math.random() < 0.5) {
                buffer32[i] = 0xff000000;
            }
        }
        noiseData.push(idata);
    };
    // Play Noise
    const paintNoise = () => {
        if (frame === 9) {
            frame = 0;
        } else {
            frame++;
        }
        ctx.putImageData(noiseData[frame], 0, 0);
    };
    // Loop
    const loop = () => {
        paintNoise(frame);
        loopTimeout = window.setTimeout(() => {
            window.requestAnimationFrame(loop);
        }, (1000 / 25));
    };
    // Setup
    const setup = () => {
        wWidth = window.innerWidth;
        wHeight = window.innerHeight;
        canvas.width = wWidth;
        canvas.height = wHeight;
        for (let i = 0; i < 10; i++) {
            createNoise();
        }
        loop();
    };
    // Reset
    let resizeThrottle;
    const reset = () => {
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeThrottle);
            resizeThrottle = window.setTimeout(() => {
                window.clearTimeout(loopTimeout);
                setup();
            }, 200);
        }, false);
    };
    // Init
    const init = (() => {
        canvas = document.getElementById('noise');
        ctx = canvas.getContext('2d');
        setup();
    })();
};

noise();