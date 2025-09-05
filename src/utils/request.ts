import axios from 'axios'

const instance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    }
    else {
      console.error(res.message)
      return Promise.reject(new Error(res.message))
    }
  },
  (error) => {
    console.error('服务器或网络错误', error)
    return Promise.reject(error)
  },
)

export default instance
