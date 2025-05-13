function randomPost() {
    // 发起请求获取 sitemap.xml 文件
    fetch('/sitemap.xml')
    .then(response => {
          // 检查响应状态
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
      })
    .then(xmlText => {
          // 将 XML 文本解析为 DOM 对象
          const parser = new DOMParser();
          return parser.parseFromString(xmlText, "text/xml");
      })
    .then(xmlData => {
          const locationElements = xmlData.getElementsByTagName('loc');
          const validLocations = [];
          // 提前过滤出满足条件的链接
          for (let i = 0; i < locationElements.length; i++) {
              const location = locationElements[i].textContent;
              const urlParts = location.split('/');
              const locSplit = urlParts[3] || '';
              if (locSplit === 'archives') {
                  validLocations.push(location);
              }
          }
          if (validLocations.length > 0) {
              // 在有效链接中随机选择一个
              const randomIndex = Math.floor(Math.random() * validLocations.length);
              const randomLocation = validLocations[randomIndex];
              // 跳转到随机选择的 URL
              window.location.href = randomLocation;
          }
      })
    .catch(error => {
          // 处理请求过程中的错误
          console.error('Fetch error:', error);
    });
}