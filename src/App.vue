<template>
  <div id="app">
    <baidu-map id="allmap"
               :style="getMapStyle"
               :center="center"
               :zoom="zoom"
               @ready="handler"
    >
      <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
    </baidu-map>
  </div>
</template>

<script>

import {getNodeData} from "@/api/static";
import {waydata} from "../public/staticdata/waydata";

export default {
  name: 'App',
  components: {

  },
  computed: {
    getMapStyle() {
      // let width = document.body.clientWidth;
      let height = document.body.clientHeight;
      let option = {
        'width': '100%',
        'height' : height.toString() + 'px',
      };
      return option;
    }
  },
  data () {
    return {
      center: {lng: 116.404, lat: 39.915},
      zoom: 15,
      BMap: null,
      map: null,
      nodes: null
    }
  },
  created() {
    getNodeData().then(res=>{
      if (res) {
        this.nodes = res;
      }
    }).catch(err => {
      this.$message.error("获取地图信息错误：" + err);
    })
  },
  methods: {
    handler ({BMap, map}) {
      this.BMap = BMap;
      this.map = map;
      let ways = waydata;

      setTimeout(()=>{
        let cpoint = new BMap.Point(this.nodes[ways['1'][1]].x, this.nodes[ways['1'][1]].y);
        map.setCenter(cpoint);
        for (let i = 1; i < 3479; i++) {
          let pointstodraw = [];
          for (let j = 0; j < ways[i].length; j++){
            pointstodraw.push(new BMap.Point(this.nodes[ways[i][j]].x, this.nodes[ways[i][j]].y))
          }
          let polyline = new BMap.Polyline(pointstodraw, {strokeColor:"green", strokeWeight:5, strokeOpacity:0.8});   //创建折线
          map.addOverlay(polyline);          //增加折线
        }
      }, 1000)
    }
  }
}
</script>

<style>
#app,html,body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  padding: 0;
  margin: 0;
}

#allmap {
  width: 100%;
  height: 100%;
}

</style>
