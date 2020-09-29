import axios from '../utils/axios.js'

// 获取地图点数据
// export function getNodeData() {
//     return axios.get('/nodes')
// }
export function getNodeData() {
    return axios.get('/source/nodes2.json')
}

// 获取拥堵数据
export function getJamData(params){
    return axios.get(
        '/way',
        {
            params:params
        }
    )
}