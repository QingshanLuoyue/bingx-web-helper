exports.getWebviewContent = function (
  { completeImgList, vueLib } = { completeImgList: [], vueLib: '' }
) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  #img-box {
    display: flex;
    flex-wrap: wrap;
  }
  #img-box img {
    display: block;
    width: 30%;
    margin: 5px;
    border: 1px solid #d0d0c5;
    object-fit: contain;
    flex-basis: 30%;
  }
  #preview {
    overflow: auto;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 2001;
  }
  #preview img {
    width: 100%;
    max-width: none;
    max-height: none;
  }
  .close-btn {
    position: fixed;
    top: 30px;
    right: 30px;
    padding: 4px 8px;
    border: none;
    background-color: #3a8ee6;
    color:#fff;
    font-size: 16px;
    cursor: pointer;
    outline: none;
    border-radius: 4px;
  }
  </style>
  <title>Cat Coding</title>
</head>
<body>
  <div id="app">
    <div id="img-box">
      ${completeImgList
        .map((imgUrl) => {
          return `<img src="${imgUrl}" @click="handleClick($event)">`
        })
        .join('')}
    </div>
    <div id="preview" v-show="showPreview">
      <img :src="previewSrc" alt="">
      <button class="close-btn" @click="handleClose">关闭</button>
    </div>
  </div>
  <script src="${vueLib}"></script>
  <script>
    const vm = new Vue({
      el: '#app',
      data() {
        return {
          showPreview: false,
          previewSrc: ''
        }
      },
      methods: {
        handleClose() {
          this.showPreview = false
          this.previewSrc = ''
        },
        handleClick(event) {
          this.showPreview = true
          this.previewSrc = event.target.src
        }
      }
    })
  </script>
</body>
</html>`
}
