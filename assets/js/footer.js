document.addEventListener('DOMContentLoaded', function() {
    // 创建页脚容器
    const footer = document.createElement('footer');
    footer.className = 'footer bg-light py-3 mt-4';
    footer.style.marginTop = 'auto';

    // 获取页脚数据
    fetch('/footer.json')
        .then(response => response.json())
        .then(data => {
            // 创建页脚内容
            // 生成链接HTML
            const linksHtml = data.links ? `
                <div class="mt-2">
                    ${data.links.map(link => `
                        <a href="${link.url}" class="text-decoration-none text-muted mx-2">${link.text}</a>
                    `).join('')}
                </div>
            ` : '';

            const footerContent = `
                <div class="container text-center">
                    <p class="mb-1">${data.copyright}</p>
                    <p class="mb-1">${data.info}</p>
                    ${linksHtml}
                </div>
            `;
            footer.innerHTML = footerContent;
        })
        .catch(error => console.error('加载页脚数据失败:', error));

    // 将页脚添加到页面
    document.body.appendChild(footer);

    // 确保页面内容占满视口高度
    document.body.style.minHeight = '100vh';
    document.body.style.display = 'flex';
    document.body.style.flexDirection = 'column';
});