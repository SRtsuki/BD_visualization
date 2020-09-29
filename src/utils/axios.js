import axios from 'axios'

const service = axios.create(
    {
        // axios请求的服务器地址
        // baseURL: 'http://10.128.25.9:3000/',
        baseURL: 'http://10.251.254.111:1234/',
        timeout: 10000,
        // withCredentials: true
    }
)

// 请求拦截
service.interceptors.request.use(
    config => {
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

//响应拦截
service.interceptors.response.use(
    response => {
        let {status, data} = response
        if (status !== 200) {
            console.error('网络异常，请刷新或者重试!')
            return Promise.reject('网络异常!')
        }
        return Promise.resolve(data)
    },
    error => {
        return Promise.reject(error)
    }
)

export default service
