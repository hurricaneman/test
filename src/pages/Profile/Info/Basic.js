import React from 'react'
import { Form, Icon as LegacyIcon } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Card, Input, Radio, Upload, message, Button } from 'antd'
import axios from 'axios'
import styles from './index.module.scss'
import { session } from 'utils'
import { SERVER } from 'configs/service'

function Basic(props) {
  const {
    record,
    form,
    form: { getFieldDecorator: f },
  } = props
  const [loading, setLoading] = React.useState()
  const [uploading, setUpLoading] = React.useState()
  const [imageUrl, setImageUrl] = React.useState()
  const [rsimg, setRsimg] = React.useState()

  React.useEffect(() => {
    if (!record) {
      form.resetFields()
      return
    }
    form.setFieldsValue({
      realname: record.realname,
      sex: record.sex,
      email: record.email,
      mobile: record.mobile,
      imgUrl: record.imgUrl,
    })
    setImageUrl(record.imgUrl)
  }, [record])

  function onSubmit() {
    form.validateFields(async (err, fields) => {
      if (err) return
      setLoading(true)
      if (record.userId) {
        fields.userId = record.userId
        fields.roleIdList = record.roleIdList
        if (rsimg) {
          fields.imgUrl = rsimg
        } else {
          fields.imgUrl = record.imgUrl ? record.imgUrl : ''
        }
      }
      await axios
        .post('/user/' + `${fields.userId ? 'update' : 'add'}`, { ...fields })
        .then(res => {
          setLoading(false)
          if (res.data.code === 1) {
            message.success(res.data.msg)
          } else {
            message.error(res.data.msg)
          }
        })
    })
  }
  const uploadButton = (
    <div>
      <LegacyIcon type={uploading ? 'loading' : 'plus'} />
      <div className="ant-upload-text">Upload</div>
    </div>
  )
  const handleChange = info => {
    if (info.file.status === 'uploading') {
      setUpLoading(true)
      return
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, imageUrl => {
        if (info.file.response.code === 1) {
          setRsimg(info.file.response.data.fileUrl)
        }
        setImageUrl(imageUrl)
        setUpLoading(false)
      })
    }
  }

  const getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  const beforeUpload = file => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/jpg'
    if (!isJpgOrPng) {
      message.error('只能上传JPG/jpeg格式的文件!')
    }
    const isLt1M = file.size / 1024 / 1024 < 1
    if (!isLt1M) {
      message.error('图片大小必须小于1M!')
    }
    return isJpgOrPng && isLt1M
  }

  return (
    <Card title="基本设置" bordered={false}>
      <Form
        layout="horizontal"
        wrapperCol={{ span: 6 }}
        labelCol={{ span: 10 }}
        onSubmit={onSubmit}
        className="LowSmallForm"
      >
        <Form.Item label="头像">
          {f('imgUrl', {
            rules: [{ required: false, message: '头像必填' }],
          })(
            <Upload
              name="file"
              listType="picture-card"
              className={styles.avatarUploader}
              showUploadList={false}
              headers={{ Authorization: session.Authorization }}
              action={`${SERVER}/file/fileUpload`}
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
              ) : (
                uploadButton
              )}
            </Upload>
          )}
        </Form.Item>
        <Form.Item label="真实姓名">
          {f('realname', {
            rules: [
              { required: true, message: '真实姓名必填' },
              { min: 2, message: '长度必须大于2' },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        <Form.Item label="性别">
          {f('sex', {
            rules: [{ required: false, message: '性别非必填' }],
            initialValue: '1',
          })(
            <Radio.Group>
              <Radio value="1">男</Radio>
              <Radio value="2">女</Radio>
              <Radio value="0">保密</Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="邮箱">
          {f('email', {
            rules: [
              { required: false, message: '邮箱非必填' },
              {
                type: 'email',
                message: '请确认邮箱格式',
              },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        <Form.Item label="手机号">
          {f('mobile', {
            rules: [
              { required: false, message: '手机号非必填' },
              {
                pattern: /^^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/,
                message: '请输入正确的手机号',
              },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        {/* <Form.Item label="角色配置">
          {f('role', {
            rules: [{ required: false, message: '角色配置非必填' }],
          })(
            <Select>
              <Option value={1}>11</Option>
            </Select>
          )}
        </Form.Item> */}
        {/* <Form.Item label="状态">
          {f('status', {
            rules: [{ required: false, message: '状态非必填' }],
            initialValue: '1',
          })(
            <Radio.Group>
              <Radio value="0">停用</Radio>
              <Radio value="1">正常</Radio>
            </Radio.Group>
          )}
        </Form.Item> */}
        <Form.Item wrapperCol={{ offset: 10, span: 14 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default Form.create()(Basic)
