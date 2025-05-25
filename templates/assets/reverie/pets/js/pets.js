function switchPet(index) {
    // 侧边栏
    updateSidebar(index);
    // 顶部名字
    document.getElementById("header-pet-name").textContent = petList[index].realNode.pet_name;
}

function updateSidebar(index) {
    const sidebarInfo = document.getElementById("pet-side-info");
    // 创建文档片段用于高效更新DOM
    const fragment = document.createDocumentFragment();
    
    // 创建侧边栏内容容器
    const container = document.createElement('div');
    container.className = 'sidebar-content';
    
    // 设置头像
    const avatarDiv = document.createElement('div');
    avatarDiv.id = 'avatar';
    const img = document.createElement('img');
    img.className = 'flower';
    img.src = petList[index].realNode.pet_photo || '/themes/theme-Joe3/assets/reverie/pets/imgs/icon.png';
    avatarDiv.appendChild(img);
    container.appendChild(avatarDiv);
    
    // 设置简介
    const bioDiv = document.createElement('div');
    bioDiv.id = 'bio';
    (petList[index].realNode.pet_brief || '').split(';').forEach((brief) => {
        if (brief.trim()) {
            const p = document.createElement('p');
            p.innerHTML = brief;
            bioDiv.appendChild(p);
        }
    });
    container.appendChild(bioDiv);
    
    // 设置基本信息
    const infoDiv = document.createElement('div');
    infoDiv.className = 'small-box';
    const ul = document.createElement('ul');
    
    // 创建列表项
    const createListItem = (label, value) => {
        const li = document.createElement('li');
        li.textContent = `${label}: ${value || '未知'}`;
        return li;
    };
    
    ul.appendChild(createListItem('name', petList[index].realNode.pet_name));
    ul.appendChild(createListItem('breed', petList[index].realNode.pet_breed));
    
    const ageLi = createListItem('age', '计算中...');
    ageLi.id = 'pet-age';
    // 异步更新年龄，避免阻塞UI
    setTimeout(() => {
        ageLi.textContent = `age: ${calculateAge(petList[index].realNode.pet_birthday)}`;
    }, 0);
    ul.appendChild(ageLi);
    
    ul.appendChild(createListItem('pronouns', petList[index].realNode.pronoun));
    infoDiv.appendChild(ul);
    container.appendChild(infoDiv);
    
    // 将完整的内容添加到文档片段
    fragment.appendChild(container);

    sidebarInfo.innerHTML = '';
    sidebarInfo.appendChild(fragment);
}

function calculateAge(birthDateString) {
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) {
        return '无效的日期格式';
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}


window.addEventListener('click', e => {
    let dropboxs = document.getElementsByClassName("dropbox-content");
    let dropbox_btns = document.getElementsByClassName("dropbox-btn");

    if (dropbox_btns.namedItem(e.target.id) != null) return;

    if(dropboxs.namedItem(e.target.id) == null) {
        for (let i = 0; i < dropboxs.length; i++) {
            dropboxs[i].removeAttribute("visible");
        }
    }
}, true)

function toggleReadMore(id) {
    var post = document.getElementById(id)
    var fullContent = post.getElementsByClassName("full-content")[0];
    var btnText = post.getElementsByClassName("read-more-btn")[0];
    var textContent = post.getElementsByClassName("text-content")[0];

    if (fullContent.style.display === "none") {
        textContent.style.display = "none";
        fullContent.style.display = "inline";
        btnText.innerHTML = "read less";
    } else {
        textContent.style.display = "inline";
        fullContent.style.display = "none";
        btnText.innerHTML = "read more";
    }
}

function toggleDropbox(id) {
    let dropbox = document.getElementById(id);
    dropbox.toggleAttribute("visible");
}

document.addEventListener('DOMContentLoaded', function() {
    setPetAge();
    setArticleImages();
});

function setPetAge() {
    const ageContainer = document.getElementById("pet-age");
    const birthDate = ageContainer.getAttribute("data-birthday");
    ageContainer.textContent = `age: ${calculateAge(birthDate)}`;
}

function setArticleImages() {
const articles = document.querySelectorAll('.posts-list');
articles.forEach(article => {
    const contentStr = article.getAttribute('data-html');
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentStr, 'text/html');
    const images = doc.querySelectorAll('img');
    const imagesToAdd = Array.from(images).slice(0, 5);

    const imgContainer = document.getElementById('article-images');
    const fragment = document.createDocumentFragment();
    const tContainer = document.createElement('div');
    const bContainer = document.createElement('div');
    tContainer.className = 'photosetx2';
    bContainer.className = 'photosetx3';
    
    imagesToAdd.forEach((img, index) => {
    img.removeAttribute('style');
    img.removeAttribute('width');
    img.removeAttribute('height');
    if(index < 2) {
        tContainer.appendChild(img);
    } else {
        bContainer.appendChild(img);
    }
    });
    fragment.appendChild(tContainer);
    fragment.appendChild(bContainer);
    imgContainer.appendChild(fragment);
});
}

const petsThemes = ["light-blue", "dark-blue", "light-green", "dark-yellow", "light-pink", "light-purple"];
let currentThemeIndex = 0;
function switchTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % petsThemes.length;
    const newTheme = petsThemes[currentThemeIndex];
    document.body.setAttribute('data-petsTheme', newTheme);
    localStorage.setItem('petsTheme', newTheme);
}
function initTheme() {
    const savedTheme = localStorage.getItem('petsTheme');
    if (savedTheme) {
        document.body.setAttribute('data-petsTheme', savedTheme);
        currentThemeIndex = petsThemes.indexOf(savedTheme);
    }
}
