const fs = require("fs");
const path = require("path");
const svg2png = require("svg2png");

// 创建 icons 目录（如果不存在）
const iconsDir = path.join(__dirname, "..", "..", "assets", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 基于 favicon.svg 生成不同尺寸的 PNG 图标
async function generateIcons() {
  try {
    // 读取 SVG 文件
    const svgBuffer = fs.readFileSync(
      path.join(__dirname, "..", "..", "assets", "favicon.svg")
    );

    // 定义需要生成的尺寸
    const sizes = [192, 512];

    // 为每个尺寸生成 PNG 图标
    for (const size of sizes) {
      const pngBuffer = await svg2png(svgBuffer, { width: size, height: size });
      const filename = `icon-${size}x${size}.png`;
      const filepath = path.join(iconsDir, filename);

      fs.writeFileSync(filepath, pngBuffer);
      console.log(`Generated ${filename}`);
    }

    console.log("Icon generation completed!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
