<template>
  <div id="app">
    <div class="control-bar"
         @click="handleOpenControlBar"
    >
      <div style="width: 100px;margin-left: auto">
        <i class="el-icon-caret-bottom"></i>
      </div>
      <div style="width: 6vw;">
        <span>打开控制栏</span>
      </div>
      <div style="width: 100px;margin-right: auto">
        <i class="el-icon-caret-bottom"></i>
      </div>
    </div>
    <el-drawer
        :visible.sync="drawerVisiable"
        :modal=false
        direction="ttb"
        size="15%"
        :withHeader=false
    >
      <div class="control-bar-container">
        <el-row>
          <el-col :span="3" style="padding: 48px">
            <span style="float: right;font-size: 18px">时间调节</span>
          </el-col>
          <el-col :span="6">
            <el-slider
                style="padding-top: 40px"
                v-model="controlbar.DayValue"
                :format-tooltip="timeFormatterForDay"
                :min=1
                :max=7
                :step="1"
                @input="handleSliderValueChange"
            >
            </el-slider>
            <div>
              <span class="control-bar-desc">日期</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div style="padding-top: 8px">
              <span class="control-bar-time">10月{{controlbar.DayValue}}日 {{getSelectedTime}}</span>
            </div>
            <div>
              <el-row style="display: flex;padding-top:2vh;padding-left: 2vw;padding-right: 2vw">
                <div style="border-style: solid;border-width: 4px;border-color: #66CC00;width: 2vw"></div>
                <div style="border-style: solid;border-width: 4px;border-color: #99CC00;width: 2vw"></div>
                <div style="border-style: solid;border-width: 4px;border-color: #CCCC00;width: 2vw"></div>
                <div style="border-style: solid;border-width: 4px;border-color: #CC6600;width: 2vw"></div>
                <div style="border-style: solid;border-width: 4px;border-color: #BF6000;width: 2vw"></div>
                <div style="border-style: solid;border-width: 4px;border-color: #BF3000;width: 2vw"></div>
                <div style="border-style: solid;border-width: 4px;border-color: #BF1800;width: 2vw"></div>
                <div style="border-style: solid;border-width: 4px;border-color: #BF0000;width: 2vw"></div>
              </el-row>
              <el-row style="display: flex;padding-top:1vh;padding-left: 2vw;padding-right: 2vw">
                <div style="width: 4vw">
                  <span class="control-bar-tooltip-start">轻微拥堵</span>
                </div>
                <div style="width: 12vw"></div>
                <div style="width: 4vw">
                  <span class="control-bar-tooltip-end">严重拥堵</span>
                </div>
              </el-row>
            </div>
          </el-col>
          <el-col :span="6">
            <el-slider
                style="padding-top: 40px"
                v-model="controlbar.sliderValue"
                :format-tooltip="timeFormatter"
                :min=0
                :max=144
                :step="1"
                @input="handleSliderValueChange"
            >
            </el-slider>
            <div>
              <span class="control-bar-desc">时刻</span>
            </div>
          </el-col>
          <el-col :span="3">
            <el-row style="margin-top:1vh;margin-left: 2vw">
              <el-switch
                  v-model="controlbar.graystyle"
                  active-text="浅色背景模式"
                  @change="handleStyleSwitch"
              >
              </el-switch>
            </el-row>
            <el-row style="margin-top:1.5vh;margin-left: 2vw">
              <el-switch
                  v-model="controlbar.showArea"
                  active-text="显示数据范围"
                  @change="handleAreaSwitch"
              >
              </el-switch>
            </el-row>
            <el-row>
              <div
                  class="control-bar-close-button"
                  @click="handleCloseControlBar"
              >
                <i class="el-icon-close"></i>
              </div>
            </el-row>
          </el-col>
<!--          <el-col :span="4">-->
<!--            <el-switch-->
<!--                v-model="controlbar.debug"-->
<!--                active-text="启用DEBUG模式"-->
<!--                @change="handleDebugSwitch"-->
<!--            >-->
<!--            </el-switch>-->
<!--          </el-col>-->
        </el-row>
      </div>
    </el-drawer>
    <baidu-map id="allmap"
               :center="center"
               :zoom="zoom"
               @ready="handler"
    >
      <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
    </baidu-map>
  </div>
</template>

<script>

import {getNodeData, getJamData} from "@/api/static";
import {waydata} from "../public/staticdata/waydata";
import {debounce} from "@/utils/debounce";
import Vue from 'vue';
// import axios from 'axios';

export default {
  name: 'App',
  components: {

  },
  computed: {
    getSelectedTime() {
      return this.timeFormatter(this.controlbar.sliderValue);
    }
  },
  data () {
    return {
      center: {lng: 108.96908364216927, lat: 34.2492631702524},
      // center: {lng: 108.92960748887373, lat: 34.28581617249366},
      zoom: 14,
      // zoom: 17,
      BMap: null,
      map: null,
      nodes: null,
      // 控制栏
      drawerVisiable: false,
      controlbar:{
        sliderValue: 0,
        DayValue: 1,
        debug: false,
        graystyle: false,
        showArea: true
      },
      axiosService2: null,
      // 拥堵数据缓存
      jamData: {},
      // 区域坐标点
      areaPolygon: null
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
    document.title = "路况数据可视化";
  },
  methods: {
    handler ({BMap, map}) {
      this.BMap = BMap;
      this.map = map;
      this.map.enableScrollWheelZoom();
      this.map.disableDoubleClickZoom();
      // 绑定道路数据
      let ways = waydata;
      setTimeout(()=>{
        // 绘制路网
        for (let i = 1; i < 3645; i++) {
          let pointstodraw = [];
          for (let j = 0; j < ways[i].length; j++){
            if (this.nodes[ways[i][j]]) {
              pointstodraw.push(new BMap.Point(this.nodes[ways[i][j]].x, this.nodes[ways[i][j]].y))
            } else {
              console.error("找不到ID为 " + ways[i][j] + " 的点")
            }
          }
          //创建折线
          let polyline = new BMap.Polyline(pointstodraw, {
            strokeColor:"green",
            strokeWeight:4,
            strokeOpacity:0.2,
            enableMassClear:false // 不可清除
          })
          map.addOverlay(polyline); //增加折线
        }
        // 计算区域坐标点
        this.areaPolygon = new BMap.Polygon([
          new BMap.Point('108.92960991204184', '34.28581514564965'),//左上
          new BMap.Point('109.01540296767193', '34.28433033686454'),//右上
          new BMap.Point('109.01594219559554', '34.21303376750453'),//右下
          new BMap.Point('108.92840631454833', '34.210812426666617')//左下
        ], {
          strokeColor:"blue",
          fillColor: '',
          strokeWeight:2,
          strokeOpacity:0.5,
          fillOpacity:0,
          enableClicking: false
        });
        // 加载区域
        if (this.controlbar.showArea) {
          this.map.addOverlay(this.areaPolygon);
        }
      }, 500)
    },
    handleOpenControlBar(){
      this.drawerVisiable = true;
    },
    handleCloseControlBar(){
      this.drawerVisiable = false;
    },
    // 路段拥堵数据转化为颜色
    getJamColor(value){
      if (value > 3.5){
        return '#BF0000'
      } else if (value > 3.0){
        return '#BF1800'
      } else if (value > 2.5){
        return '#BF3000'
      } else if (value > 2.0){
        return '#BF6000'
      } else if (value > 1.5){
        return '#CC6600'
      } else if (value > 1.0){
        return '#CCCC00'
      } else if (value > 0.5){
        return  '#99CC00'
      } else {
        return '#66CC00'
      }
    },
    // 手动清除拥堵数据
    handleClearJam(){
      this.map.clearOverlays();
    },
    // 开关debug
    handleDebugSwitch(){
      this.handleLoadData();
    },
    // 开关浅色模式
    handleStyleSwitch(){
      if (this.controlbar.graystyle) {
        // 设置样式
        this.map.setMapStyle({style:'grayscale'});
      } else {
        this.map.setMapStyle({style:'normal'});
      }
    },
    // 开关范围
    handleAreaSwitch(){
      this.handleLoadData();
    },
    // 动态加载
    handleSliderValueChange: debounce(function () {
      //获取结果
      this.handleLoadData();
    }, 100),
    //
    zeroPad: (num, places) => String(num).padStart(places, '0'),
    // 时间展示格式化
    timeFormatter(val){
      let minuate = val * 10;
      return parseInt(minuate / 60) + ':' + this.zeroPad(minuate % 60, 2);
    },
    timeFormatterForDay(val){
      return '10月' + val + '日'
    },
    // 加载数据
    handleLoadData(){
      let params = {
        ts: (this.controlbar.DayValue - 1) * 144 + this.controlbar.sliderValue
      }
      if (this.jamData[params.ts]){
        // 清除上次的数据
        this.map.clearOverlays();
        // 加载区域
        if (this.controlbar.showArea) {
          this.map.addOverlay(this.areaPolygon);
        }
        // 加载数据
        for (let i =0; i < this.jamData[params.ts].lines.length; i++){
          this.map.addOverlay(this.jamData[params.ts].lines[i]);
        }
        // todo debug模式
      } else {
        getJamData(params).then(res => {
          if (res.code === 0 ){
            // 清除上次的数据
            this.map.clearOverlays();
            // 缓存数据
            Vue.set(this.jamData, params.ts, {lines:[]});
            // 加载数据
            for(let i = 0; i < res.data.length; i++){
              let startPoint = new this.BMap.Point(this.nodes[res.data[i].k.from].x, this.nodes[res.data[i].k.from].y)
              let endPoint = new this.BMap.Point(this.nodes[res.data[i].k.to].x, this.nodes[res.data[i].k.to].y)
              let polyline = new this.BMap.Polyline([
                startPoint,
                endPoint
              ], {
                strokeColor:this.getJamColor(res.data[i].v.v),
                strokeWeight:5, // todo customize weight
                strokeOpacity:1,
                strokeStyle:res.data[i].k.from + ':' + res.data[i].k.to
              })   //创建折线
              this.map.addOverlay(polyline);          //增加折线
              //缓存
              this.jamData[params.ts].lines.push(polyline);
              if(this.controlbar.debug){
                let marker = new this.BMap.Marker(startPoint);
                this.map.addOverlay(marker);
                let label = new this.BMap.Label("from:"+res.data[i].k.from+",to:" + res.data[i].k.to,{offset:new this.BMap.Size(20,-10)});
                marker.setLabel(label);
                // todo 缓存
              }
            }
            // 加载区域
            if (this.controlbar.showArea) {
              this.map.addOverlay(this.areaPolygon);
            }
          } else {
            this.$message.error("获取拥堵数据错误："+ res.msg);
          }
        }).catch(err => {
          this.$message.error("获取拥堵数据错误："+err);
        })
      }
    },
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  padding: 0;
  margin: 0;
}
html {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  padding: 0;
  margin: 0;
}
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  padding: 0;
  margin: 0 !important;
}

#allmap {
  width: 100%;
  height: calc(100vh - 60px);
}

.control-bar {
  width: 100%;
  height: 40px;
  padding-top: 4px;
  display: flex;
  -webkit-user-select: none;
  user-select: none;
}

.control-bar:hover
{
  color: #6891FF;
}

.control-bar-container {
  /*margin-top: 1vh;*/
  margin-bottom: 10px;
  margin-left: 20px;
  margin-right: 20px;
  /*background: #DDDDDD;*/
}

.control-bar-desc {
  font-size: 16px;
  color: #888888;
}

.control-bar-time{
  font-size: 42px;
}

.control-bar-tooltip-start {
  font-size: 8px;
  color: #888888;
  float: left;
}

.control-bar-tooltip-end {
  font-size: 8px;
  color: #888888;
  float: right;
}

.el-col {
  display: flex;
  flex-direction: column;
  align-content: flex-start;
}

.control-bar-close-button {
  float: right;
  margin-top: 2vh;
  width: 3vh;
  height: 3vh;
  background: #F8F8F8;
  border-style: solid;
  border-radius:7px;
  border-width: 3px;
  border-color: #6891FF;
  display: flex;
}

.el-icon-close {
  color: #888888;
  font-size: 2vh;
  margin: auto;
}

</style>