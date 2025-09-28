// 黄金价格换算器
class GoldPriceConverter {
  constructor() {
    this.exchangeRate = 0;
    this.isLoading = false;
    this.currentUnit = "usd-oz"; // 默认单位
    this.goldPrice = 0; // 实时金价
    this.isFirstLoad = true; // 标记是否为首次加载
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadExchangeRate();
    this.startGoldPriceRefresh();
  }

  bindEvents() {
    const goldPriceInput = document.getElementById("goldPrice");
    const unitSelector = document.getElementById("unitSelector");

    goldPriceInput.addEventListener("input", () => this.calculatePrice());
    unitSelector.addEventListener("change", (e) =>
      this.changeUnit(e.target.value)
    );
  }

  async loadExchangeRate() {
    if (this.isLoading) return;

    this.isLoading = true;
    const rateElement = document.getElementById("exchangeRate");

    try {
      rateElement.textContent = "加载中...";
      rateElement.classList.add("loading");

      // 使用免费的汇率API
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();

      if (data.rates && data.rates.CNY) {
        this.exchangeRate = data.rates.CNY;
        rateElement.textContent = `1 USD = ${this.exchangeRate.toFixed(4)} CNY`;
        rateElement.classList.remove("loading");

        // 汇率加载完成后，获取实时金价
        await this.loadGoldPrice();

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
    }
  }

  async loadGoldPrice() {
    try {
      // 方案1: 使用福利云API（免费，支持CORS）
      const response = await fetch("https://free.xwteam.cn/api/gold/trade");
      const data = await response.json();

      if (data && data.code === 200 && data.data) {
        // 解析福利云API的金价数据
        let goldPrice = 0;

        // 优先使用伦敦金价格（GJ_Au），单位为美元/盎司
        if (data.data.GJ && data.data.GJ.length > 0) {
          const londonGold = data.data.GJ.find(
            (item) => item.Symbol === "GJ_Au"
          );
          if (londonGold && londonGold.BP > 0) {
            goldPrice = parseFloat(londonGold.BP);
          }
        }

        // 如果没有伦敦金价格，使用上海黄金99.99价格（需要转换）
        if (goldPrice === 0 && data.data.SH && data.data.SH.length > 0) {
          const shGold = data.data.SH.find(
            (item) => item.Symbol === "SH_Au9999"
          );
          if (shGold && shGold.BP > 0) {
            // 上海黄金价格是人民币/克，需要转换为美元/盎司
            const cnyPerGram = parseFloat(shGold.BP);
            const usdPerGram = cnyPerGram / this.exchangeRate; // 人民币转美元
            goldPrice = usdPerGram * 31.1035; // 克转盎司
          }
        }

        // 如果还没有价格，使用国内黄金价格（需要转换）
        if (goldPrice === 0 && data.data.LF && data.data.LF.length > 0) {
          const domesticGold = data.data.LF.find(
            (item) => item.Symbol === "Au"
          );
          if (domesticGold && domesticGold.BP > 0) {
            // 国内黄金价格是人民币/克，需要转换为美元/盎司
            const cnyPerGram = parseFloat(domesticGold.BP);
            const usdPerGram = cnyPerGram / this.exchangeRate; // 人民币转美元
            goldPrice = usdPerGram * 31.1035; // 克转盎司
          }
        }

        if (goldPrice > 0) {
          this.goldPrice = goldPrice;
          if (this.isFirstLoad) {
            this.setGoldPriceInput(goldPrice);
          }
          this.updateCurrentGoldPriceDisplay(goldPrice);
          console.log(
            "使用福利云API获取金价:",
            goldPrice.toFixed(2),
            "美元/盎司"
          );
          return;
        }
      }
    } catch (error) {
      console.error("福利云API失败:", error);
      // 福利云API失败，尝试xxapi.cn API
      await this.tryXxapiGoldPriceForFirstLoad();
      return;
    }

    // 如果福利云API返回数据但解析失败，也尝试xxapi.cn
    await this.tryXxapiGoldPriceForFirstLoad();
  }

  async tryXxapiGoldPriceForFirstLoad() {
    try {
      // 使用xxapi.cn免费API（支持CORS，数据丰富）
      const response = await fetch("https://v2.xxapi.cn/api/goldprice");
      const data = await response.json();

      if (data && data.code === 200 && data.data) {
        // 优先使用银行金条价格
        if (
          data.data.bank_gold_bar_price &&
          data.data.bank_gold_bar_price.length > 0
        ) {
          const bankGoldPrice = parseFloat(
            data.data.bank_gold_bar_price[0].price
          );
          if (bankGoldPrice > 0) {
            // 银行金条价格是人民币/克，需要转换为美元/盎司（使用当前汇率）
            const usdPerGram = bankGoldPrice / this.exchangeRate; // 人民币转美元
            const usdPerOz = usdPerGram * 31.1035; // 克转盎司

            this.goldPrice = usdPerOz;
            if (this.isFirstLoad) {
              this.setGoldPriceInput(usdPerOz);
            }
            this.updateCurrentGoldPriceDisplay(usdPerOz);
            console.log(
              "使用xxapi.cn API银行金条价格获取金价:",
              usdPerOz.toFixed(2),
              "美元/盎司"
            );
            return;
          }
        }

        // 如果没有银行金条价格，使用黄金回收价格
        if (
          data.data.gold_recycle_price &&
          data.data.gold_recycle_price.length > 0
        ) {
          // 查找24K金回收价格
          const gold24K = data.data.gold_recycle_price.find(
            (item) => item.gold_type === "24K金回收"
          );

          let goldPrice = 0;
          if (gold24K && gold24K.recycle_price) {
            goldPrice = parseFloat(gold24K.recycle_price);
          } else if (data.data.gold_recycle_price[0].recycle_price) {
            // 如果没有24K金回收价格，使用第一个回收价格
            goldPrice = parseFloat(
              data.data.gold_recycle_price[0].recycle_price
            );
          }

          if (goldPrice > 0) {
            // 将人民币/克转换为美元/盎司（使用当前汇率）
            const usdPerGram = goldPrice / this.exchangeRate; // 人民币转美元
            const usdPerOz = usdPerGram * 31.1035; // 克转盎司

            this.goldPrice = usdPerOz;
            if (this.isFirstLoad) {
              this.setGoldPriceInput(usdPerOz);
            }
            this.updateCurrentGoldPriceDisplay(usdPerOz);
            console.log(
              "使用xxapi.cn API黄金回收价格获取金价:",
              usdPerOz.toFixed(2),
              "美元/盎司"
            );
            return;
          }
        }
      }
    } catch (error) {
      console.error("xxapi.cn API失败:", error);
    }

    // 如果两个API都失败，使用备用方案
    await this.loadGoldPriceFallback();
  }

  async loadGoldPriceFallback() {
    // 如果没有获取到真实金价，不填充输入框
    console.log("无法获取实时金价数据，输入框保持为空");
    this.goldPrice = 0;
    this.updateCurrentGoldPriceDisplay(0);
    // 不调用 setGoldPriceInput，让输入框保持为空
  }

  setGoldPriceInput(price) {
    const goldPriceInput = document.getElementById("goldPrice");
    if (goldPriceInput && !goldPriceInput.value && price > 0) {
      goldPriceInput.value = price.toFixed(2);
      // 触发计算
      this.calculatePrice();
    }
  }

  updateCurrentGoldPriceDisplay(price) {
    const currentGoldPriceElement = document.getElementById("currentGoldPrice");
    if (currentGoldPriceElement) {
      if (price > 0) {
        currentGoldPriceElement.textContent = `$${price.toFixed(2)}`;
        currentGoldPriceElement.style.color = "#2d3748";
      } else {
        currentGoldPriceElement.textContent = "暂无数据";
        currentGoldPriceElement.style.color = "#a0aec0";
      }
    }

    // 更新价格单位显示
    const priceUnitElement = document.querySelector(".price-unit");
    if (priceUnitElement) {
      priceUnitElement.textContent = "美元/盎司";
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
        goldPriceInput.placeholder = "请输入美元价格";
        break;
      case "cny-oz":
        currencySymbol.textContent = "¥";
        unitDisplay.textContent = "/ 盎司";
        goldPriceInput.placeholder = "请输入人民币价格";
        break;
      case "cny-gram":
        currencySymbol.textContent = "¥";
        unitDisplay.textContent = "/ 克";
        goldPriceInput.placeholder = "请输入人民币价格";
        break;
      case "usd-gram":
        currencySymbol.textContent = "$";
        unitDisplay.textContent = "/ 克";
        goldPriceInput.placeholder = "请输入美元价格";
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

  startGoldPriceRefresh() {
    // 每1分钟自动刷新金价显示（不修改输入框）
    setInterval(() => {
      this.refreshGoldPriceOnly();
    }, 60000);
  }

  async refreshGoldPriceOnly() {
    // 只刷新金价显示，不修改输入框
    this.isFirstLoad = false; // 标记为非首次加载
    await this.loadGoldPriceOnly();
  }

  async loadGoldPriceOnly() {
    try {
      // 方案1: 使用福利云API（免费，支持CORS）
      const response = await fetch("https://free.xwteam.cn/api/gold/trade");
      const data = await response.json();

      if (data && data.code === 200 && data.data) {
        // 解析福利云API的金价数据
        let goldPrice = 0;

        // 优先使用伦敦金价格（GJ_Au），单位为美元/盎司
        if (data.data.GJ && data.data.GJ.length > 0) {
          const londonGold = data.data.GJ.find(
            (item) => item.Symbol === "GJ_Au"
          );
          if (londonGold && londonGold.BP > 0) {
            goldPrice = parseFloat(londonGold.BP);
          }
        }

        // 如果没有伦敦金价格，使用上海黄金99.99价格（需要转换）
        if (goldPrice === 0 && data.data.SH && data.data.SH.length > 0) {
          const shGold = data.data.SH.find(
            (item) => item.Symbol === "SH_Au9999"
          );
          if (shGold && shGold.BP > 0) {
            // 上海黄金价格是人民币/克，需要转换为美元/盎司
            const cnyPerGram = parseFloat(shGold.BP);
            const usdPerGram = cnyPerGram / this.exchangeRate; // 人民币转美元
            goldPrice = usdPerGram * 31.1035; // 克转盎司
          }
        }

        // 如果还没有价格，使用国内黄金价格（需要转换）
        if (goldPrice === 0 && data.data.LF && data.data.LF.length > 0) {
          const domesticGold = data.data.LF.find(
            (item) => item.Symbol === "Au"
          );
          if (domesticGold && domesticGold.BP > 0) {
            // 国内黄金价格是人民币/克，需要转换为美元/盎司
            const cnyPerGram = parseFloat(domesticGold.BP);
            const usdPerGram = cnyPerGram / this.exchangeRate; // 人民币转美元
            goldPrice = usdPerGram * 31.1035; // 克转盎司
          }
        }

        if (goldPrice > 0) {
          this.goldPrice = goldPrice;
          this.updateCurrentGoldPriceDisplay(goldPrice);
          console.log(
            "使用福利云API更新金价:",
            goldPrice.toFixed(2),
            "美元/盎司"
          );
          return;
        }
      }
    } catch (error) {
      console.error("福利云API失败:", error);
      // 福利云API失败，尝试xxapi.cn API
      await this.tryXxapiGoldPrice();
      return;
    }

    // 如果福利云API返回数据但解析失败，也尝试xxapi.cn
    await this.tryXxapiGoldPrice();
  }

  async tryXxapiGoldPrice() {
    try {
      // 使用xxapi.cn免费API（支持CORS，数据丰富）
      const response = await fetch("https://v2.xxapi.cn/api/goldprice");
      const data = await response.json();

      if (data && data.code === 200 && data.data) {
        // 优先使用银行金条价格
        if (
          data.data.bank_gold_bar_price &&
          data.data.bank_gold_bar_price.length > 0
        ) {
          const bankGoldPrice = parseFloat(
            data.data.bank_gold_bar_price[0].price
          );
          if (bankGoldPrice > 0) {
            // 银行金条价格是人民币/克，需要转换为美元/盎司（使用当前汇率）
            const usdPerGram = bankGoldPrice / this.exchangeRate; // 人民币转美元
            const usdPerOz = usdPerGram * 31.1035; // 克转盎司

            this.goldPrice = usdPerOz;
            this.updateCurrentGoldPriceDisplay(usdPerOz);
            console.log(
              "使用xxapi.cn API银行金条价格更新金价:",
              usdPerOz.toFixed(2),
              "美元/盎司"
            );
            return;
          }
        }

        // 如果没有银行金条价格，使用黄金回收价格
        if (
          data.data.gold_recycle_price &&
          data.data.gold_recycle_price.length > 0
        ) {
          // 查找24K金回收价格
          const gold24K = data.data.gold_recycle_price.find(
            (item) => item.gold_type === "24K金回收"
          );

          let goldPrice = 0;
          if (gold24K && gold24K.recycle_price) {
            goldPrice = parseFloat(gold24K.recycle_price);
          } else if (data.data.gold_recycle_price[0].recycle_price) {
            // 如果没有24K金回收价格，使用第一个回收价格
            goldPrice = parseFloat(
              data.data.gold_recycle_price[0].recycle_price
            );
          }

          if (goldPrice > 0) {
            // 将人民币/克转换为美元/盎司（使用当前汇率）
            const usdPerGram = goldPrice / this.exchangeRate; // 人民币转美元
            const usdPerOz = usdPerGram * 31.1035; // 克转盎司

            this.goldPrice = usdPerOz;
            this.updateCurrentGoldPriceDisplay(usdPerOz);
            console.log(
              "使用xxapi.cn API黄金回收价格更新金价:",
              usdPerOz.toFixed(2),
              "美元/盎司"
            );
            return;
          }
        }
      }
    } catch (error) {
      console.error("xxapi.cn API失败:", error);
    }

    // 如果所有API都失败，保持当前显示不变
    console.log("所有金价API都失败，保持当前显示不变");
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
