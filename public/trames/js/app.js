
const { loadModule } = window["vue3-sfc-loader"];

let emitter = mitt();
emitter.on('update_view', function(trigger) {
  //console.log(settings);
});

emitter.on('save_image', function(trigger) {
  console.log("save image")
});

emitter.on('edit_screen', function(trigger) {
  console.log("edit_screen");
});

emitter.on('screen_loaded', function(trigger) {
  //console.log("screen_loaded")
});


/////////////////////////
////// CREATE APP //////
const app = Vue.createApp({
  template: '<global></global>',
  globalProperties: {
    emitter: emitter
  },
  components: {
    'global': Vue.defineAsyncComponent(() => loadModule('./js/components/global.vue', {
      moduleCache: {
        vue: Vue,
      },
      getFile(url) {
        return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
      },
      addStyle(styleStr) {
        const style = document.createElement('style');
        style.textContent = styleStr;
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      },
      log(type, ...args) {
        console.log(type, ...args);
      }
    }))
  }
});

//// MOUNT!
app.mount('#app');

// const canvas = new OffscreenCanvas(256, 256);
// const engine = CreateEngine(canvas, () => {
//   // const viewport = document.getElementById("preview");
//   // const context = viewport.getContext("2d");
//   console.log(canvas.transferToImageBitmap());
//   // const image = new Image()
//   // document.appendChild
// });