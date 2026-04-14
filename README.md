# 🎨 小朋友画画展示站 (Kids Gallery)

一个纯静态的瀑布流画廊站点，用于展示小朋友的画画作品。

**在线访问**: [guoliang25.github.io/kids-gallery](https://guoliang25.github.io/kids-gallery/)

## 如何添加新作品

1. 把照片放入 `images/artworks/` 目录（建议命名格式：`YYYY-MM-描述.jpg`）
2. 编辑 `data/artworks.json`，添加一条记录：
   ```json
   {
     "file": "2026-04-flower.jpg",
     "title": "春天的花",
     "date": "2026-04",
     "description": "水彩画"
   }
   ```
3. 提交并推送：
   ```bash
   git add .
   git commit -m "添加新作品：春天的花"
   git push
   ```
4. GitHub Pages 会自动更新，稍等片刻即可看到。

## 本地预览

```bash
cd ~/kids-gallery
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 功能特性

- 📱 响应式瀑布流布局（桌面 3 列 / 平板 2 列 / 手机 1 列）
- 🔍 点击图片灯箱大图预览，支持左右切换和 ESC 关闭
- ⚡ 图片懒加载，优化首屏性能
- 📋 JSON 配置管理作品元数据，维护简单
- 🚀 纯静态，push 即部署，无需构建工具
