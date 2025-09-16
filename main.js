// 黄金价格换算器
class GoldPriceConverter {
  constructor() {
    this.exchangeRate = 0;
    this.isLoading = false;
    this.currentUnit = "usd-oz"; // 默认单位
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadExchangeRate();
    this.startAutoRefresh();
  }

  bindEvents() {
    const goldPriceInput = document.getElementById("goldPrice");
    const refreshBtn = document.getElementById("refreshRate");
    const unitSelector = document.getElementById("unitSelector");

    goldPriceInput.addEventListener("input", () => this.calculatePrice());
    refreshBtn.addEventListener("click", () => this.loadExchangeRate());
    unitSelector.addEventListener("change", (e) =>
      this.changeUnit(e.target.value)
    );
  }

  async loadExchangeRate() {
    if (this.isLoading) return;

    this.isLoading = true;
    const rateElement = document.getElementById("exchangeRate");
    const refreshBtn = document.getElementById("refreshRate");

    try {
      rateElement.textContent = "加载中...";
      rateElement.classList.add("loading");
      refreshBtn.disabled = true;
      refreshBtn.textContent = "🔄 加载中...";

      // 使用免费的汇率API
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();

      if (data.rates && data.rates.CNY) {
        this.exchangeRate = data.rates.CNY;
        rateElement.textContent = `1 USD = ${this.exchangeRate.toFixed(4)} CNY`;
        rateElement.classList.remove("loading");

        // 重新计算价格（保持输入数据不变）
        this.calculatePrice();
      } else {
        throw new Error("无法获取汇率数据");
      }
    } catch (error) {
      console.error("获取汇率失败:", error);
      rateElement.textContent = "获取失败";
      rateElement.classList.remove("loading");
      this.showError("无法获取实时汇率，请稍后重试");
    } finally {
      this.isLoading = false;
      refreshBtn.disabled = false;
      refreshBtn.textContent = "🔄 刷新";
    }
  }

  changeUnit(newUnit) {
    this.currentUnit = newUnit;
    this.updateUnitDisplay();
    this.calculatePrice();
  }

  updateUnitDisplay() {
    const currencySymbol = document.getElementById("currencySymbol");
    const unitDisplay = document.getElementById("unitDisplay");
    const goldPriceInput = document.getElementById("goldPrice");

    switch (this.currentUnit) {
      case "usd-oz":
        currencySymbol.textContent = "$";
        unitDisplay.textContent = "/ 盎司";
        goldPriceInput.placeholder = "输入美元价格";
        break;
      case "cny-oz":
        currencySymbol.textContent = "¥";
        unitDisplay.textContent = "/ 盎司";
        goldPriceInput.placeholder = "输入人民币价格";
        break;
      case "cny-gram":
        currencySymbol.textContent = "¥";
        unitDisplay.textContent = "/ 克";
        goldPriceInput.placeholder = "输入人民币价格";
        break;
      case "usd-gram":
        currencySymbol.textContent = "$";
        unitDisplay.textContent = "/ 克";
        goldPriceInput.placeholder = "输入美元价格";
        break;
    }
  }

  calculatePrice() {
    const goldPriceInput = document.getElementById("goldPrice");
    const goldPrice = parseFloat(goldPriceInput.value) || 0;

    if (goldPrice <= 0) {
      this.updateResult(0);
      return;
    }

    if (this.exchangeRate <= 0) {
      this.showError("请等待汇率加载完成");
      return;
    }

    // 换算计算
    // 1 盎司 = 31.1035 克
    const OUNCE_TO_GRAM = 31.1035;

    // 根据输入单位转换为美元/盎司
    let usdPerOz, cnyPerOz, cnyPerGram;

    switch (this.currentUnit) {
      case "usd-oz":
        usdPerOz = goldPrice;
        cnyPerOz = goldPrice * this.exchangeRate;
        cnyPerGram = cnyPerOz / OUNCE_TO_GRAM;
        break;
      case "cny-oz":
        usdPerOz = goldPrice / this.exchangeRate;
        cnyPerOz = goldPrice;
        cnyPerGram = goldPrice / OUNCE_TO_GRAM;
        break;
      case "cny-gram":
        usdPerOz = (goldPrice * OUNCE_TO_GRAM) / this.exchangeRate;
        cnyPerOz = goldPrice * OUNCE_TO_GRAM;
        cnyPerGram = goldPrice;
        break;
      case "usd-gram":
        usdPerOz = goldPrice * OUNCE_TO_GRAM;
        cnyPerOz = goldPrice * OUNCE_TO_GRAM * this.exchangeRate;
        cnyPerGram = goldPrice * this.exchangeRate;
        break;
    }

    this.updateResult(cnyPerGram, {
      usdPerOz: usdPerOz,
      cnyPerOz: cnyPerOz,
      cnyPerGram: cnyPerGram,
    });
  }

  updateResult(cnyPerGram, details = {}) {
    const resultPrice = document.getElementById("resultPrice");
    const usdPerOz = document.getElementById("usdPerOz");
    const cnyPerOz = document.getElementById("cnyPerOz");
    const cnyPerGramEl = document.getElementById("cnyPerGram");

    resultPrice.textContent = cnyPerGram.toFixed(2);
    usdPerOz.textContent = `$${details.usdPerOz?.toFixed(2) || "0.00"}`;
    cnyPerOz.textContent = `¥${details.cnyPerOz?.toFixed(2) || "0.00"}`;
    cnyPerGramEl.textContent = `¥${cnyPerGram.toFixed(2)}`;
  }

  showError(message) {
    // 移除现有的错误消息
    const existingError = document.querySelector(".error");
    if (existingError) {
      existingError.remove();
    }

    // 创建新的错误消息
    const errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.textContent = message;

    // 插入到输入区域后面
    const inputSection = document.querySelector(".input-section");
    inputSection.appendChild(errorDiv);

    // 3秒后自动移除错误消息
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 3000);
  }

  startAutoRefresh() {
    // 每5分钟自动刷新汇率
    setInterval(() => {
      this.loadExchangeRate();
    }, 5 * 60 * 1000);
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  new GoldPriceConverter();
  updateCopyrightYear();
});

// 更新版权年份
function updateCopyrightYear() {
  const currentYear = new Date().getFullYear();
  const copyrightElement = document.getElementById("copyrightYear");

  if (copyrightElement) {
    if (currentYear > 2025) {
      copyrightElement.textContent = `2025-${currentYear}`;
    } else {
      copyrightElement.textContent = "2025";
    }
  }
}

// 添加一些实用的工具函数
const utils = {
  // 格式化数字
  formatNumber: (num, decimals = 2) => {
    return parseFloat(num).toFixed(decimals);
  },

  // 验证输入
  validateInput: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  },
};

// 导出供其他模块使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GoldPriceConverter, utils };
}
