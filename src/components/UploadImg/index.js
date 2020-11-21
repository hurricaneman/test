import React, { useState } from 'react'
import { Upload, message } from 'antd'
import { session } from 'utils'

export default function UploadImg(props) {
  const {
    action,
    accept = 'image/png,image/jpg,image/jpeg',
    uploadimg,
    file,
  } = props
  const [fileList, setFileList] = useState([])

  React.useEffect(() => {
    if (file) {
      let list = file.split(',').map((t, i) => {
        return { uid: i, name: '附件', status: 'done', url: t }
      })
      setFileList(list)
      uploadimg(file)
    } else {
      setFileList([])
    }
  }, [file])

  const onChange = ({ fileList: newFileList }) => {
    console.log(newFileList)
    setFileList(newFileList)
    let imgList = newFileList.map(t => {
      let list = []
      if (t.response && t.response.code === 1) {
        list.push(t.response.data.webAccessPath)
      } else if (t.url) {
        list.push(t.url)
      }
      return list
    })
    uploadimg(imgList.join())
  }

  // const onPreview = async file => {
  //   let src = file.url
  //   if (!src) {
  //     src = await new Promise(resolve => {
  //       const reader = new FileReader()
  //       reader.readAsDataURL(file.originFileObj)
  //       reader.onload = () => resolve(reader.result)
  //     })
  //   }
  //   const image = new Image()
  //   image.src = src
  //   const imgWindow = window.open(src)
  //   imgWindow.document.write(image.outerHTML)
  // }

  function beforeUpload(file) {
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/pdf'
    if (!isJpgOrPng) {
      message.error('只能上传jepg，png，pdf')
    }
    const isLt2M = file.size / 1024 / 1024 < 5
    if (!isLt2M) {
      message.error('图片必须小于5MB!')
    }
    return isJpgOrPng && isLt2M
  }

  return (
    <Upload
      headers={{ Authorization: session.Authorization }}
      accept={accept}
      action={action}
      listType="picture-card"
      fileList={fileList}
      onChange={onChange}
      // onPreview={onPreview}
      beforeUpload={beforeUpload}
    >
      {fileList.length < 5 && '+ Upload'}
    </Upload>
  )
}
