/**
 * PKTextCarousel - 文字輪播類別
 * 作者: PK
 * 功能: 支援多個文字輪播實例，每個實例可獨立配置
 */
class PKTextCarousel {
  constructor(options = {}) {
      // 預設配置
      this.config = {
          selector: '#輪播文字',           // 目標元素選擇器
          textArray: ['Loading...'],        // 輪播文字陣列
          interval: 3000,                   // 切換間隔（毫秒）
          fadeOutTime: 250,                 // 淡出時間（毫秒）
          fadeInTime: 250,                  // 淡入時間（毫秒）
          animationType: 'fade',            // 動畫類型: 'fade', 'slide', 'scale'
          direction: 'up',                  // 滑動方向: 'up', 'down', 'left', 'right'
          autoStart: true,                  // 是否自動開始
          loop: true,                       // 是否循環播放
          onTextChange: null,               // 文字變更回調函數
          onComplete: null,                  // 輪播完成回調函數
          color: null,                       // 文字顏色
      };
      
      // 合併用戶配置
      Object.assign(this.config, options);
      
      // 內部狀態
      this.currentIndex = 0;
      this.isRunning = false;
      this.intervalId = null;
      this.$element = null;
      
      // 初始化
      this.init();
  }
  
  /**
   * 初始化輪播
   */
  init() {
      // 檢查jQuery是否存在
      if (typeof $ === 'undefined') {
          console.error('PKTextCarousel: jQuery is required');
          return;
      }
      
      // 獲取目標元素
      this.$element = $(this.config.selector);
      if (this.$element.length === 0) {
          console.error(`PKTextCarousel: Element not found: ${this.config.selector}`);
          return;
      }
      
      // 設定初始樣式
      this.setupStyles();
      
      // 設定初始文字
      if (this.config.textArray.length > 0) {
          this.$element.html(this.config.textArray[0]);
      }
      // 設定文字顏色
      if (this.config.color) {
          this.$element.css('color', this.config.color);
      }
      
      // 自動開始
      if (this.config.autoStart && this.config.textArray.length > 1) {
          this.start();
      }
  }
  
  /**
   * 設定CSS樣式
   */
  setupStyles() {
      const transitionTime = Math.max(this.config.fadeOutTime, this.config.fadeInTime) / 1000;
      
      this.$element.css({
          'transition': `opacity ${transitionTime}s ease-in-out, transform ${transitionTime}s ease-in-out`,
          'opacity': '1',
          'transform': 'translateX(0) translateY(0) scale(1)',
          'min-height': '1.2em',
          'display': 'inline-block'
      });
  }
  
  /**
   * 開始輪播
   */
  start() {
      if (this.isRunning || this.config.textArray.length <= 1) {
          return;
      }
      
      this.isRunning = true;
      this.intervalId = setInterval(() => {
          this.nextText();
      }, this.config.interval);
  }
  
  /**
   * 停止輪播
   */
  stop() {
      if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
      }
      this.isRunning = false;
  }
  
  /**
   * 下一個文字
   */
  nextText() {
      if (this.config.loop || this.currentIndex < this.config.textArray.length - 1) {
          this.currentIndex = (this.currentIndex + 1) % this.config.textArray.length;
          this.showText(this.currentIndex);
      } else {
          this.stop();
          if (this.config.onComplete) {
              this.config.onComplete();
          }
      }
  }
  
  /**
   * 上一個文字
   */
  prevText() {
      this.currentIndex = this.currentIndex === 0 ? 
          this.config.textArray.length - 1 : 
          this.currentIndex - 1;
      this.showText(this.currentIndex);
  }
  
  /**
   * 顯示指定索引的文字
   */
  showText(index) {
      if (index < 0 || index >= this.config.textArray.length) {
          return;
      }
      
      const newText = this.config.textArray[index];
      
      // 執行淡出動畫
      this.fadeOut(() => {
          // 更新文字
          this.$element.text(newText);
          
          // 執行淡入動畫
          this.fadeIn();
          
          // 執行回調
          if (this.config.onTextChange) {
              this.config.onTextChange(newText, index);
          }
      });
  }
  
  /**
   * 淡出動畫
   */
  fadeOut(callback) {
      const transform = this.getTransformStyle(true);
      
      this.$element.css({
          'opacity': '0',
          'transform': transform
      });
      
      setTimeout(callback, this.config.fadeOutTime);
  }
  
  /**
   * 淡入動畫
   */
  fadeIn() {
      setTimeout(() => {
          const transform = this.getTransformStyle(false);
          
          this.$element.css({
              'opacity': '1',
              'transform': transform
          });
      }, 50);
  }
  
  /**
   * 獲取變換樣式
   */
  getTransformStyle(isOut) {
      const { animationType, direction } = this.config;
      
      switch (animationType) {
          case 'slide':
              return this.getSlideTransform(direction, isOut);
          case 'scale':
              return isOut ? 'scale(0.8)' : 'scale(1)';
          case 'fade':
          default:
              return isOut ? 'translateY(-10px)' : 'translateY(0)';
      }
  }
  
  /**
   * 獲取滑動變換
   */
  getSlideTransform(direction, isOut) {
      const distance = isOut ? '20px' : '0';
      const sign = isOut ? '-' : '';
      
      switch (direction) {
          case 'up':
              return `translateY(${sign}${distance})`;
          case 'down':
              return `translateY(${isOut ? '' : '-'}${distance})`;
          case 'left':
              return `translateX(${sign}${distance})`;
          case 'right':
              return `translateX(${isOut ? '' : '-'}${distance})`;
          default:
              return `translateY(${sign}${distance})`;
      }
  }
  
  /**
   * 跳轉到指定文字
   */
  goTo(index) {
      if (index >= 0 && index < this.config.textArray.length) {
          this.currentIndex = index;
          this.showText(index);
      }
  }
  
  /**
   * 更新文字陣列
   */
  updateTextArray(newArray) {
      this.config.textArray = newArray;
      this.currentIndex = 0;
      if (newArray.length > 0) {
          this.$element.text(newArray[0]);
      }
  }
  
  /**
   * 獲取當前文字
   */
  getCurrentText() {
      return this.config.textArray[this.currentIndex];
  }
  
  /**
   * 獲取當前索引
   */
  getCurrentIndex() {
      return this.currentIndex;
  }
  
  /**
   * 銷毀輪播
   */
  destroy() {
      this.stop();
      this.$element.css({
          'transition': '',
          'transform': '',
          'opacity': ''
      });
  }
}

// 如果在Node.js環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PKTextCarousel;
}

// 如果在瀏覽器環境中，添加到全域
if (typeof window !== 'undefined') {
  window.PKTextCarousel = PKTextCarousel;
}